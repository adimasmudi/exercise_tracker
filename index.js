const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

mongoose.connect('mongodb+srv://freecodecamp_mongo:wYJYEfQY3rlKMLYu@cluster0.hoyf0.mongodb.net/exercise_tracker?retryWrites=true&w=majority')

let userSchema = new mongoose.Schema({
  username : {
    type : String,
    required : true
  }
})

let exerciseSchema = new mongoose.Schema({
  user : {
    username : {
      type : String,
      required : true
    },
    id : Object
},
  description : {
    type : String,
    required : true
  },
  duration : {
    type : Number,
    required : true
  },
  date : String
})

let logSchema = new mongoose.Schema({
  username : String,
  count : Number,
  log : [{
    description : String,
    duration : Number, 
    date : Date
  }]
})

let User = mongoose.model('User',userSchema)
let Exercise = mongoose.model('Exercise',exerciseSchema)
let Log = mongoose.model('Log',logSchema)



app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

// index
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// post user data
app.post('/api/users', (req, res)=>{
  let the_user = new User({
    username : req.body.username
  })

  the_user.save((err, data)=>{
    if(err) return console.log(err)
    res.json({
      username : data.username,
      _id : data._id
    })
  })
})

// get all user's data
app.get('/api/users', (req, res)=>{
  User.find((err, data)=>{
    res.json({
      id : data.id,
      username : data.username
    })
  })
})
// save user's exercise data
app.post('/api/users/:_id/exercises', (req, res)=>{
  const id_user = req.params.id
  User.findOne(id_user,(err, data)=>{
    const day = ['sun','mon','tue','wed','thu','fri','sat']
    const month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    let date;
    let string_date;
    if(req.body.date){
      date = new Date(req.body.date)
    }else{
      date = new Date()
    }
    string_date = `${day[date.getDay()]} ${month[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`
    let the_exercise = new Exercise({
        user : {
          username : data.username,
          id : data._id
        },
        description : req.body.description,
        duration : req.body.duration,
        date : string_date
      })
    the_exercise.save((err, data2)=>{
      if(err) return console.log(err)
      res.json({
        id : data2.user.id,
        username : data2.username,
        description : data2.description,
        duration : data2.duration,
        date : data2.date
      })
    })
  })
})

app.get('/api/users/:_id/logs',(req, res)=>{
  const id_user = req.params.id
  Exercise.find({id : id_user}, (err, data)=>{
    let logs = []
    for(let i = 0; i < data.length; i++){
      logs.push( {
        description : data[i].description,
            duration : data[i].duration,
            date : data[i].date
      })
    }
    res.json({
      username : data[0].user.username,
      count : data.length,
      _id : data[0].user.id,
      log : logs
    })
  })
})

app.get('/api/users/:_id/logs?from&to&limit', (req, res)=>{
  res.send(req.query)
  // Exercise.where(log.date).gte(new Date(from)).lte(new Date(to))
  //   .where("log").slice(+limit)
  //   .exec(/*callback*/)
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
