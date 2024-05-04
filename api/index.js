const express = require("express"); 
const bodyParser = require("body-parser"); 
const mongoose = require("mongoose"); 
const passport = require("passport"); 
const LocalStrategy = require("passport-local").Strategy

const app = express();
const port = 8000; 
const cors = require("cors"); 
app.use(cors()); 

app.use(bodyParser.urlencoded({ extended : false})); 
app.use(bodyParser.json()); 
app.use(passport.initialize()); 
const hwt = require("jsonwebtoken"); 

mongoose.connect(
    "mongodb+srv://stephenmartinez7000:twerkteamA1@cluster0.mapthaa.mongodb.net/", 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    }
).then(() => {
    console.log("Connected to MongoDB"); 
}).catch((err) => {
    console.log("Error connecting to MongoDb", err); 
});

app.listen(port, () => {
    console.log("Server running on port 8000");
})