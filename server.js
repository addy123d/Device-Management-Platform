// Include dependency (Express)
const express = require("express");
const host = "127.0.0.1";
const port = 5000;

// Initialisation
var app = express();

// REQUEST - (Path - /)
// RESPONSE - HTML page 
app.use("/",express.static("client"));

// app.get("/",(request,response)=>{
//     response.send("Hello from my app !");
// });


app.listen(port,host,function(){
    console.log("Server is running !");
});



