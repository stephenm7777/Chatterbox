const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
const port = 8000; 
const cors = require("cors"); 
app.use(cors()); 

app.use(bodyParser.urlencoded({ extended : false})); 
app.use(bodyParser.json()); 
app.use(passport.initialize()); 
const jwt = require("jsonwebtoken"); 

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

app.listen(port, "192.168.1.215", () => {
    console.log("Server running on port 8000");
})

const User = require("./models/user"); 
const Message = require("./models/message"); 


//endpoint for registration of the user 

app.post("/register", (req, res) => {
    console.log("Request body:", req.body); // Log request body
    const { name, email, password, image } = req.body;

    const newUser = new User({ name, email, password, image });

    // save user to mongo
    newUser.save().then(() => {
        res.status(200).json({ message: "User registered successfully" });
    }).catch((err) => {
        console.log("Error registering user", err);
        res.status(500).json({ message: "Error registering user" });
    });
});