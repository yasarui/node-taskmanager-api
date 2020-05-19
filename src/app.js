require("dotenv").config();
const express = require("express");

//Init app
const app = express();
const port = process.env.PORT || 3000;

app.get("/",(req,res)=>{
   res.json({"message":"Hi Yasar Arafat"})
});

app.listen(port,()=>{
    console.log(`Server is up and Running on port ${port}`);
})