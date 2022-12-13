const express = require('express');
const app = express();
let cors = require('cors');
const helmet = require("helmet");
let bodyParser = require('body-parser');
const multer = require('multer');
const PORT = process.env.PORT || 3000

// all routes
let authRoutes = require('./routes/authRoute')
let adminRoutes = require('./routes/adminRoute')
let userRoutes = require('./routes/userRoute')



// image
app.use('/backend/uploads',express.static('uploads'))

// dependency
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({origin: '*'}))

// http://localhost:4200

//secure http
app.use(helmet());

//image google cloud cloud
const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})
app.use(multerMid.single('file'))



//database connection
const db = require('./database/db')();

// socket connection
let server = require('http').Server(app);
let io = require('socket.io')(server,
    
    
    {
    cors: {
      origin:'*',
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  }
  
  ); 
app.set('io',io);
io.on('connection', socket => {
    console.log("new socket connection...");
    socket.emit("test event","hey");
});

// for testing purpose
app.get('/', (req, res) => {
    res.send("Hello")
})

// use all routes
app.use('/', authRoutes)
app.use('/admin', adminRoutes)
app.use('/user', userRoutes)


// for debugging
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

