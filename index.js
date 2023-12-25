const express = require('express');
require('dotenv').config();
const connectionDB = require('./config/connectionDB')
const rateLimiting = require('express-rate-limit');
const hpp = require('hpp');
const xss  = require('xss-clean');
const helmet = require('helmet')

const authRouter = require('./routes/authRoute')
const userRouter = require('./routes/userRoute')
const postRouter = require('./routes/postRoute')
const commentRouter = require('./routes/commentRoute')
const categoryRouter =require('./routes/categoryRoute');
const { notFound, errorHandler } = require('./middlewares/errorHandler');



//Connection To Db 
connectionDB()


//init App 

const app = express()

//middelwares

app.use(express.json());

//security headers
app.use(helmet()) // To add more security to headers

//Prevent Http Params Pollution
app.use(hpp())

//Prevent xss  (cross site scripting) Attacks
app.use(xss())

//Rate Limiting
app.use(rateLimiting({
  windowMs:10 * 60 *100,  // 10 minutes
  max:200
}))
// Routes 

app.use('/api/auth',authRouter)
app.use('/api/users',userRouter)
app.use('/api/posts',postRouter)
app.use('/api/comments',commentRouter)
app.use('/api/categories',categoryRouter)


//error handler middleware
app.use(notFound)
app.use(errorHandler)


//Running The Server

const port = process.env.PORT ||8000
app.listen(port,()=>{
  console.log(`server running in ${process.env.NODE_ENV} on port ${process.env.PORT}`)
})