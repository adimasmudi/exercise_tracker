const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");
const bodyParser = require("body-parser")


mongoose.connect('mongodb+srv://freecodecamp_mongo:wYJYEfQY3rlKMLYu@cluster0.hoyf0.mongodb.net/exercise_tracker?retryWrites=true&w=majority', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const { Schema } = mongoose;

const ExerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post("/api/users", (req, res) => {
  console.log(`req.body`, req.body)
  const newUser = new User({
    username: req.body.username
  })
  newUser.save((err, data) => {
    if(err || !data){
      res.send("There was an error saving the user")
    }else{
      res.json(data)
    }
  })
})

app.post("/api/users/:id/exercises", (req, res) => {
  const id = req.params.id
  const {description, duration, date} = req.body
  User.findById(id, (err, userData) => {
    if(err || !userData) {
      res.send("Could not find user");
    }else{
      const newExercise = new Exercise({
        userId: id, 
        description,
        duration,
        date: new Date(date), 
      })
      newExercise.save((err, data) => {
        if(err || !data) {
          res.send("There was an error saving this exercise")
        }else {
          const { description, duration, date, _id} = data;
          res.json({
            username: userData.username,
            description,
            duration,
            date: date.toDateString(),
            _id: userData.id
          })
        }
      })
    }
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

app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if(!data){
      res.send("No users")
    }else{
      res.json(data)
    }
  })
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})