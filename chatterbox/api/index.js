const express = require("express"); 
const bodyParser = require("body-parser"); 
const mongoose = require("mongoose"); 
const passport = require("passport"); 
const LocalStrategy = require("passport-local").Strategy;

const app = express(); 
const port = 8000; 
const cors = require("cors"); 
app.use(cors()); 

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
app.use(passport.initialize()); 
const jwt = require("jsonwebtoken"); 

mongoose.connect(
    "mongodb+srv://stephenmartinez7000:twerkteamA1@cluster0.mapthaa.mongodb.net/", {
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
    }
).then(() => {
    console.log("connected to mongodb");
}).catch((err) => { // <-- Added parameter 'err'
    console.log("error connecting to mongodb", err); 
}); 

app.listen(port, () => { 
    console.log("Server running on port 8000"); 
});
