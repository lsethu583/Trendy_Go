
const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/trendy_go")

const express=require("express")
const app=express()
const session=require("express-session")
const path=require("path")
const userRoute=require("./routes/userRoute")
const admin_route = require("./routes/adminRoute")
require('dotenv').config();
const nocache = require("nocache")
app.use(nocache())
app.use(
    session({
      secret: "your-secret-key", 
      resave: false,
      saveUninitialized: false,
    })
  );

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use(express.static(path.join(__dirname,"public")))
app.use(express.static(path.join(__dirname,"public/assets")))
app.use(express.static(path.join(__dirname,"public/assetsb")))

app.use("/",userRoute)
app.use("/admin",admin_route)

// app.use('*',(req,res)=>{

//   res.render('user/error');

// })

const port = process.env.PORT; // Use port 4004 if PORT variable is not defined in .env

app.listen(port, () => {
    console.log(`Listening to the server on http://localhost:${port}`);
});

