const express = require('express')
const dbConnection = require('../dbConnection')
const auth = require('./auth')
const { route } = require('./projects')

// Create route
const router = express.Router()

/* ---------------------------- Route handlers -------------------------------- */
// Get all status reports
router.get('/status',auth.authenticateToken,(req,res)=>{
  const query = `SELECT * FROM Status_reports`

  dbConnection.query(query, (err, rows, fields) => {
    if (!err) res.send(rows)
    else res.sendStatus(503)
  })
})

// Add a new report 
router.post('/status',auth.authenticateToken,(req,res)=>{
  const query = `INSERT INTO Status_reports SET ?`

  dbConnection.query(query,req.body, (err, rows, fields) => {
    if (!err) res.send('Status added successfully')
    else res.sendStatus(503)
  })
})


module.exports = router