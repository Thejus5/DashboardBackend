const mysql = require('mysql')

const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'thejus@sql0',
  database: 'Project_management_dashboard',
  multipleStatements: true
})

mysqlConnection.connect((err) => {
  if (!err) console.log('Connected to database')
  else console.log('Cannot connect', err)
})

module.exports = mysqlConnection