const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const projectRoute = require('./routes/projects')
const resourceRoutes = require('./routes/resources')
const statusRoutes = require('./routes/status')
const auth = require('./routes/auth')

// Setup express server
const server = express()

// Middleware
server.use(cors())
server.use(bodyParser.json())
server.use(auth.router)
server.use(projectRoute)
server.use(resourceRoutes)
server.use(statusRoutes)
// server.use(cors)

const port = 8080
server.listen(port, () => {
  console.log('Listening to requests')
})