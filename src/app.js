require("dotenv").config();
require("./db/mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const userRoute = require('./routes/user');
const taskRoute = require('./routes/task');

//Init app
const app = express();
const port = process.env.PORT || 3000;

//middlewares
app.use(bodyParser.json());
app.use(userRoute);
app.use(taskRoute);


app.listen(port,()=>{
    console.log(`Server is up and Running on port ${port}`);
});