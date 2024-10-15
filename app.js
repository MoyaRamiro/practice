const mongoose = require("mongoose")
const logger = require('./utils/logger')
const config = require('./utils/config')
const cors = require('cors')
const express = require("express")
//const app = express()
const blogsRouter = require('./controllers/blogs.js')
const app = express()
const usersRouter = require('./controllers/users.js')
const loginRouter = require('./controllers/login')


mongoose.set("strictQuery", false);

logger.info("connecting to", config.MONGODB_URI);

const mongoUrl = 'mongodb+srv://moya04ramiro:NxZGhS0zuDczpKYh@phonebookapi.nfk4x.mongodb.net/?retryWrites=true&w=majority&appName=phonebookapi'
mongoose.connect(mongoUrl)


app.use(cors())
app.use(express.json())
app.use('/api/login', loginRouter)
app.use("/api/blogs", blogsRouter)
app.use('/api/users', usersRouter)

module.exports = app;

