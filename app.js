require('dotenv').config();
const express=require('express');
const bodyParser = require('body-parser');
const mongoose =require('mongoose');
const session=require("express-session");
const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passportlocalMongoose=require("passport-local-mongoose");
const app=express();
const findorcreate=require("mongoose-findorcreate")
const ejs=require('ejs');


app.use(express.static("public"));
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:"Our little secret",
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());





mongoose.connect("mongodb://localhost:27017/userDB",{useUnifiedTopology: true, useNewUrlParser: true});
mongoose.set("useCreateIndex",true);
const userSchema = new mongoose.Schema({
    email:String,
    password:String
})
userSchema.plugin(passportlocalMongoose);
userSchema.plugin(findorcreate);
const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user,done){
    done(null,user.id);
})
passport.serializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(null,user.id);
    })
})


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/",function(req,res){
    res.render("home");
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/register",function(req,res){
    res.render("register");
})
app.get("/login",function(req,res){
    res.render("login");
})

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
})
app.post("/register",function(req,res){
User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }else{
passport.authenticate("local")(req,res,function(){
    res.redirect("/secrets");
})
    }
})
    
})


app.post("/login",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    })
  req.login(user,function(err){
      if(err){
          console.log(err);
      }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        })
      }
  })
})
app.listen(3000,function(){
    console.log("server is running on port 3000");
})

