// LED Blinking code
// const { Board, Led } = require("johnny-five");
// const board = new Board();

// board.on("ready", function() {
//   //Pin configuration
//   var led = new Led(13);

//   // Server Configuration
//   const express = require("express");
//   const host = "127.0.0.1";
//   const port = 3000;

//   const app = express();

//   app.get("/",function(request,response){
//     response.send(`<a href="/on">Led On</a>`)
//   })

//   app.get("/on",function(request,response){
//       //Blink
//       led.blink(1500);
//       response.send("LED is blinking !");
//   });

//   app.listen(port,host,function(){
//     console.log("Server is running...");
//   })


// });


// Motor Code
// const {Board, Servo} = require("johnny-five");
// const board = new Board();

// board.on("ready", () => {
//   const servo = new Servo(4);

//   // Server Configuration
//   const express = require("express");
//   const host = "127.0.0.1";
//   const port = 3000;

//   const app = express();

//   app.get("/",function(request,response){
//     response.send(`<a href="/on">Motor On</a>`)
//   })

//   app.get("/on",function(request,response){
//       //Blink
//       servo.sweep();
//       response.send("Motor is working !");
//   });

//   app.listen(port,host,function(){
//     console.log("Server is running...");
//   })


// });