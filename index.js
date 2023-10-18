require('dotenv').config()
const express= require("express")
const axios =require("axios")
const ejs = require("ejs")
const mongoose= require("mongoose")
const bodyParser= require("body-parser")
const encrypt= require("mongoose-encryption")
const app=express();
const port=3000;

mongoose.connect("mongodb://127.0.0.1:27017/secret_project");
const {Schema}=mongoose;// Schema=mongoose.schema
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
// -----------------------------------------------------------------------------------

const UserSchema= new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    }
})
const secretSchema= new Schema({
    secret:{
        type: String,
        unique: true,
    }
})

// var secretKey = "Thisismysecretkey";// any one can view secret key if declared here,if upload on github therefore keep it in .env file which will be kept in .gitignore (i.e. it will not be uploaded on github)

UserSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields:["password"]});// plugins are kind of middle wares

const userdata= mongoose.model("userdata",UserSchema);// usedata collection
const userSecrets=mongoose.model("userSecrets",secretSchema);// userSecrets collection
// get home
app.get("/", async(req,res)=>{
    try{
        res.render("home.ejs");
    } catch(e){
        console.log(e);
    }    
})
// get register
app.get("/register", async(req,res)=>{
     try{
         res.render("register.ejs");
     } catch(e){
        console.log(e);
     }
})
// get login
app.get("/login", async( req, res)=>{
    try{
        res.render("login.ejs");
    } catch(e){
        console.log(e);
    }
})
// post register
app.post("/register", async( req, res)=>{
    try{
        const result=await userdata.findOne({username: req.body.username});
        if(result){
            res.render("register.ejs",{userExist:` username already exist please`});
        }
        else{
            let data= new userdata({
                username: req.body.username,
                password: req.body.password,
            })
            const result=await data.save();
            // console.log(result);
            const secret_arr= await userSecrets.find();
            res.render("secrets.ejs",{ s_arr: secret_arr});
        }
    } catch(e){
        console.log(e);
    }
})

// post login

app.post("/login" , async( req,res)=>{
    try{
        let result=await userdata.findOne({username: req.body.username})
        // console.log(result);
        if(result){
           
            if(result.password===req.body.password){
                let sec_arr= await userSecrets.find();
                res.render("secrets.ejs",{s_arr:sec_arr});
            }
            else{
                res.render("login.ejs",{WrongPass:` entered password is wrong`});
            }
        }
        else{
            res.render("login.ejs",{userNotExist:`username doesn't exist please`});
        }

    } catch(e){
        console.log(e);
    }
})

// get logout
app.get("/logout", async( req,res)=>{
    try{
        res.render("login.ejs");
    } catch(e){
        console.log(`error while logging out`);
    }
})

// post secret
app.post("/submit", async(req,res)=>{
    try{
        let Secret= new userSecrets({
            secret: req.body.secret,
        })
        const result=await Secret.save();
        // console.log(result);
        const sec_arr= await userSecrets.find();
        res.render("secrets.ejs",{s_arr: sec_arr});
    } catch(e){
        console.log(`error while submitting the post`);
    }
})

// get submit
app.get("/submit", async(req,res)=>{
    try{
        res.render("submit.ejs");
    } catch(e){
        console.log(`error while opening submit page`);
    }
})

app.get("/secrets", async(req,res)=>{
    try{
        const sec_arr= await userSecrets.find();
        res.render("secrets.ejs",{s_arr: sec_arr});
    } catch(e){
        console.log(`error while rendering secret`);
    }
})

app.listen(port,()=>{
    console.log(`server started running on port ${port}`);
})
