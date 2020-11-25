const express = require('express')
const dbConnection = require('../dbConnection')
const auth = require('./auth')

// Create route
const router = express.Router()

/* ---------------------------- Route handlers -------------------------------- */
// List of all resources available
router.get('/resources', auth.authenticateToken, (req, res) => {

  const query = `SELECT Resources.id,name,email,role,project_id,billable,ratePerHour FROM Resources LEFT JOIN Project_resource_map ON Resources.id = Project_resource_map.resource_id;`

  dbConnection.query(query, (err, rows, fields) => {
    if (!err) res.send(rows)
    else {
      res.sendStatus(503)
      console.log(err)
    }
  })

})

// Add a resource to a project
router.post('/resources', auth.authenticateToken, (req, res) => {
  dbConnection.query('SELECT id FROM Resources WHERE email = ?', req.body.email, (err, rows, fields) => { // See if already present
    if (!err) {
      if (rows.length == 0) {
        const query = `INSERT INTO Resources SET ?`
        let responseBody = { name: req.body.name, email: req.body.email, role: req.body.role };
        dbConnection.query(query, responseBody, (err, data, fields) => {
          if (!err) {
            res.send(JSON.stringify(data.insertId));
            console.log(data.insertId)
            addMapping(req.body)
          }
          else {
            res.sendStatus(503)
            console.log(err)
          }
        })

      }
      else {
        addMapping(req.body)
        console.log(rows.id)
        res.send(JSON.stringify(rows[0].id));
      }
    }
    else {
      res.sendStatus(503)
      console.log(err)
    }
  });

})

// Update an existing resource
router.put('/resources/:id', auth.authenticateToken, (req, res) => {
  const query = `UPDATE Resources SET name =?, email = ?, role=? WHERE id = ?`
  const queryTwo = `UPDATE Project_resource_map SET billable = ?, ratePerHour = ? WHERE project_id = ? AND resource_id = ?`

  const { name, role, email, billable, ratePerHour, project_id } = req.body

  dbConnection.query(query, [name, email, role, parseInt(req.params.id)], (err, rows, field) => {
    if (!err) res.send('Updated Resources')
    else {
      res.sendStatus(503)
      console.log(err)
    }
  })
  dbConnection.query(queryTwo, [billable, ratePerHour, project_id, parseInt(req.params.id)], (err, rows, field) => {
    if (!err) console.log('Updated Mapping')
    else {
      res.sendStatus(503)
      console.log(err)
    }
  })

})

// Delete an existing resource
router.delete('/resources/:res_id/:proj_id', auth.authenticateToken, (req, res) => {
  const query = `DELETE FROM Project_resource_map WHERE resource_id = ? and project_id = ?`

  dbConnection.query(query, [parseInt(req.params.res_id), parseInt(req.params.proj_id)], (err, rows, fields) => {
    if (!err) res.send('Data deleted successfully')
    else {
      res.sendStatus(503)
      console.log(err)
    }
  })
})


// Function to map added resource to its corresponding project
function addMapping(response) {
  dbConnection.query('SELECT id FROM Resources WHERE email = ?', response.email, (err, rows, fields) => {
    if (!err) {
      const query = `INSERT INTO Project_resource_map SET ?`;
      let resourceMapObject = { project_id: response.project_id, resource_id: rows[0].id, billable: response.billable, ratePerHour: response.ratePerHour }
      console.log(resourceMapObject);
      dbConnection.query(query, resourceMapObject, (error, row, fields) => {
        if (!error) console.log('Mapped data added successfully')
        else {
          res.sendStatus(503)
          console.log(err)
        }
      })
    }
    else {
      res.sendStatus(503)
      console.log(err)
    }
  })
}


router.get('/techs', auth.authenticateToken, (req, res) => {

  const query = `SELECT JSON_ARRAYAGG(name) as techs FROM Technologies;`

  dbConnection.query(query, (err, rows, fields) => {
    if (!err) res.send(rows[0].techs)
    else {
      res.sendStatus(503)
      console.log(err)
    }
  })

})



module.exports = router