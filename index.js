
const express=require("express")
const app=express()
const session=require("express-session")
const path=require("path")
const mongoose=require("mongoose");

                      
mongoose.connect("mongodb+srv://sethulb4878:Sethu%40123@cluster0.2em6nxn.mongodb.net/Trendy_Go")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  }); 
   
       

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


const port = process.env.PORT; // Use port 4004 if PORT variable is not defined in .env

app.listen(port, () => {
    console.log(`Listening to the server on http://localhost:${port}`);
});

