require('dotenv').config();
const express=require('express');
const bodyParser = require('body-parser');
const mongoose =require('mongoose');
const encrypt=require('mongoose-encryption');
const exp = require('constants');
const app=express();
const ejs=require('ejs');
const { redirect } = require('statuses');
const { config } = require("bluebird");
app.use(express.static("public"));
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB",{useUnifiedTopology: true, useNewUrlParser: true});
const userSchema = new mongoose.Schema({
    email:String,
    password:String
})

userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:['password']});




const User=mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("home");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.get("/login",function(req,res){
    res.render("login");
})


app.post("/register",function(req,res){
    const user=new User({
        email:req.body.username,
        password:req.body.password
    })
    user.save(function(err){
        if(err){
            console.log(err)
        }else{
            res.render("secrets");
        }
    });
    
})


app.post("/login",function(req,res){
    const email = req.body.username;
    const password = req.body.password;
    User.findOne({
        email:email,
    },function(err,item){
        if(err){
            console.log(err);
        }
      else  if(!item){
            console.log("Invalid User");
        }
        else{
            if(password=== item.password){
                res.render("secrets");
            }
        }
    })
})
app.listen(3000,function(){
    console.log("server is running on port 3000");
})

