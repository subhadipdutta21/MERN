const express = require('express')
const connectDb = require('./config/db')
const app = express()

// connect to mongoDB
connectDb()

app.use(express.json({extended : false}))
app.get('/',(req,res)=> res.send('API is running'))

// define routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/auth', require('./routes/api/auth'))


const Port = process.env.PORT || 5000

app.listen(Port, ()=> console.log('server is running at port',Port ))
