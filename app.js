const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const cors = require('cors');
require('dotenv/config');

app.use(cors())
app.use(bodyParser.json())
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
)

/*https://domain.com/api/user/*/
const UserRoute 	= require('./routes/user'),
	  SessionRoute	= require('./routes/session')

app.use('/api/v1/user', UserRoute)
app.use('/api/v1/session', SessionRoute)

app.listen(port, () => console.log("Server up and running!"));