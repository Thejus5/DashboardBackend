require('dotenv').config()
const express = require('express')
const crypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dbConnection = require('../dbConnection')

// Create route
const router = express.Router()

/*------------ Routes ------------------------------ */
router.post('/auth/register', async (req, res) => {
	try {
		const hashedPassword = await hashPassword(req.body.password)
		dbConnection.query(
			'INSERT INTO Users Set name = ?,email = ?, password = ?',
			[req.body.name, req.body.email, hashedPassword],
			(err, rows, fields) => {
				if (!err) res.sendStatus(200)
				else {
					console.log(err)
					// res.status(503).send("Database Unavailable");
					res.sendStatus(503)
				}
			}
		)
	} catch {
		res.sendStatus(500)
	}
})

async function hashPassword(password) {
	const salt = await crypt.genSalt()
	const hashedPassword = await crypt.hash(password, salt)
	return hashedPassword
}


router.post('/auth/login', async (req, res) => {
	dbConnection.query('SELECT * FROM Users WHERE email = ?', req.body.email, async (err, rows, field) => {
		if (!err) {
			if (rows.length > 0) {
				if (await crypt.compare(req.body.password, rows[0].password)) {
					res.send({ accessToken: generateAccessToken(req.body.email) })
				} else {
					res.sendStatus(401)
				}
			} else {
				// res.status(401).send("User not found");
				res.sendStatus(401)
			}
		} else res.sendStatus(503)
	})
})

function generateAccessToken(email) {
	const user = { email: email }
	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
	return accessToken
}


// Token authentication for all api calls
const authenticateToken = function (req, res, next) {
	// Bearer Token
	const header = req.headers['authorization']
	const token = header && header.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			return res.sendStatus(403)
		}
		else {
			req.user = user
			next()
		}


	})
}

// // Can be removed while implementing refresh tokens
// async function userExistInDatabase(user) {
// 	await dbConnection.query('SELECT * FROM Users WHERE email = ?', [user.email], (err, rows, fields) => {
// 		if (!err) {
// 			if (rows.length > 0) {
// 				console.log('User found')
// 				return true
// 			}
// 			else {
// 				console.log('No user')
// 				return false
// 			}
// 		}
// 		else return 'Database Unavailable'
// 	})
// }


module.exports = { router, authenticateToken }
