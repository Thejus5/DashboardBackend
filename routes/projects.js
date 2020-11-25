const express = require('express')
const jwt = require('jsonwebtoken')
const dbConnection = require('../dbConnection')
const auth = require('./auth')

// Create route
const router = express.Router()

/* ---------------------------- Route handlers -------------------------------- */
// List of all projects in db
router.get('/projects',auth.authenticateToken, (req, res) => {

  // This query is so big just because all the columns are being renamed to match frontend code.
  const query = `SELECT Projects.id as projectId, Projects.name as projectName, Projects.client as clientName, Projects.manager as projectManager, Projects.status as projectStatus, Projects.start_date as startDate, Projects.end_date as endDate, Projects.progress, Projects.description, JSON_ARRAYAGG(Technologies.name) as technologies FROM Projects JOIN Project_tech_map ON Projects.id = Project_tech_map.project_id JOIN Technologies ON Project_tech_map.tech_id = Technologies.id GROUP BY Projects.id;`

  dbConnection.query(query, (err, rows, fields) => {
    if (!err) { res.send(rows) }
    else res.sendStatus(503)
  })

})

// Add a new project to the db
router.post('/projects',auth.authenticateToken, (req, res) => {
  const query = `INSERT INTO Projects SET ?`

  let { technologies, ...other } = req.body

  dbConnection.query(query, other, (err, rows, fields) => {
    if (!err) {
      res.send('Data added successfully')
      addTech(technologies, rows.insertId)
    }
    else res.sendStatus(503)
  })

})

// Edit or update an existing project in db
router.put('/projects/:id',auth.authenticateToken, (req, res) => {
  const query = `UPDATE Projects SET name = ?, client = ?, manager=?, status = ?, start_date = ?, end_date = ?, progress= ?, description = ? Where ID = ?`

  const dataToPut = [`${req.body.name}`, `${req.body.client}`, `${req.body.manager}`, `${req.body.status}`, `${req.body.start_date}`, `${req.body.end_date}`, `${req.body.progress}`, `${req.body.description}`, parseInt(req.params.id)]

  dbConnection.query(query, dataToPut, (err, rows, fields) => {
    if (!err) {
      dbConnection.query('DELETE FROM Project_tech_map WHERE project_id = ?', parseInt(req.params.id), (err, res, fields) => {
        if (!err) {
          addTech(req.body.technologies, parseInt(req.params.id))
        }
        else res.sendStatus(503)
      })
      res.send('Data updated successfully')
    }
    else res.sendStatus(503)
  })

})

// Delete an existing project from db
router.delete('/projects/:id',auth.authenticateToken, (req, res) => {
  const query = `DELETE FROM Projects WHERE id = ?`

  dbConnection.query(query, [parseInt(req.params.id)], (err, rows, fields) => {
    if (!err) res.send('Data deleted successfully')
    else res.sendStatus(503)
  })

})


// Function

function addTech(technologies, projectId) {
  technologies.forEach((tech) => {
    const query = `SELECT id FROM Technologies WHERE name = ?`

    dbConnection.query(query, tech, (err, rows, fields) => {
      if (!err) {
        if (rows.length == 0) {
          let techId
          dbConnection.query(`INSERT INTO Technologies SET name =?`, tech, (err, res, fields) => {
            if (!err) {
              techId = res.insertId
              console.log('Tech added successfully')
              console.log(techId)
              techMap(projectId, techId)
            }
            else res.sendStatus(503)
          })
        }
        else {
          console.log(rows[0].id)
          techMap(projectId, rows[0].id)
        }
      }
      else res.sendStatus(503)
    })

  })
}

function techMap(projectId, techId) {
  const query = `INSERT INTO Project_tech_map SET ?`
  const techMapObj = {
    project_id: projectId,
    tech_id: techId
  }

  dbConnection.query(query, techMapObj, (err, rows, fields) => {
    if (!err) console.log('Tech map added successfully')
    else res.sendStatus(503)
  })

}



module.exports = router