//For ultrasonic sensor and led project
const { Board, Proximity, Led } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
    //Pin declarations
  const proximity = new Proximity({
    controller: "HCSR04",
    pin: 6
  });

  const led = new Led(13);

  const express = require("express");
  const fetch = require("node-fetch");
  const host = '127.0.0.1';
  const port = 3000;


  var app = express();

  const readings = [];

  app.get("/",function(request,response){
      response.send(`<a href="/on">Start Device</a>
                    <a href="/checkdata">Check data</a>`);
  });

  app.get("/on",function(request,response){

      //Request platform server
      fetch("http://127.0.0.1:5000/deviceping/61fb1c9acb6d5&ac@gmail.com&LED")
      .then(response=>response.json())
      .then((result)=>{
          console.log(result);
          //Blink
          if(result.error === 'You are not allowed !' || result.error === "Max calls exceeded !"){
              return response.send(result.error);
          };

              //Alright
              proximity.on("change", () => {
                const {centimeters} = proximity;
                console.log("  cm  : ", centimeters);
            
                if(centimeters < 5){
                    led.on();
            
                    const data = {
                        "distance" :`${centimeters} cms`,
                        "reading" : centimeters,
                        "status" : `LED on !`,
                        "time" : new Date().toString()
                    };

                    readings.push(data);
                    
                    //Post data using fetch
                
                    const options = {
                        method : 'post',
                        body : JSON.stringify(readings[readings.length-1]),
                        headers : {'Content-Type':'application/json'}
                    };

                    fetch('http://127.0.0.1:5000/device/data/61fb1c9acb6d5&LED',options)
                    .then(res=>res.json())
                    .then((json)=>{
                        console.log("Message from server :",json);
                    })
                    .catch(function(err){
                        console.log(err);
                    });
                }else{
                    led.off();
                }
        
              });

              return response.json({"message" : "Data sending ...."});
        }).
        catch(function(err){
            console.log(err);
        });
             

  });

  app.listen(port,host,function(){
      console.log("server is running ......");
  })


});


// For Servo motor

            // const { Board, Servo } = require("johnny-five");
            //                 const board = new Board();

            //                 board.on("ready", () => {
            //                 //Pin declarations
            //                 const servo = new Servo(4);


            //                 const express = require("express");
            //                 const fetch = require("node-fetch");
            //                 const host = "127.0.0.1";
            //                 const port = 3000;


            //                 var app = express();

            //                 const readings = [];

            //                 app.get("/",function(request,response){
            //                 response.send(`<a href = "/on" > Start Device</a>`);
            //                 });

            //                 app.get("/on",function(request,response){
            //                 //Request platform server
            //                 fetch("http://127.0.0.1:5000/deviceping/2b64691f2e18c&ac@gmail.com&Motor")
            //                 .then(response=>response.json())
            //                 .then((result)=>{
            //                         console.log(result);
            //                         //Blink
            //                         if(result.error === 'You are not allowed !' || result.error === "Max calls exceeded !"){
            //                         return response.send(result.error);
            //                         };

            //                 //Alright

            //                     servo.sweep(); 
            //                     const data={ 
            //                         "status" : "LED on!", 
            //                          "time" : new Date().toString() 
            //                         }; 

            //                         readings.push(data); 
            //                         //Post data using fetch 
            //                         const options={ 
            //                             method : 'post' ,
            //                              body : JSON.stringify(readings[readings.length-1]),
            //                               headers : {'Content-Type':'application/json'} 
            //                             };
            //                 fetch('http://127.0.0.1:5000/device/data/2b64691f2e18c&Motor',options)
            //                  .then(res=>res.json())
            //                     .then((json)=>{
            //                         console.log("Message from server :",json);
            //                     })
            //                     .catch(function(err){
            //                         console.log(err);
            //                     });
                 

                        

            //                 return response.json({"message" : "Data sending ...."});
            //                 })
            //                 .catch(function(err){
            //                 console.log(err);
            //                 });


            //                 });

            //                 app.listen(port,host,function(){
            //                 console.log("server is running ......");
            //                 })


            //                 });
// ----------------------------------------------------------------------------------------------------------------------------------------------------------
//For Testing
