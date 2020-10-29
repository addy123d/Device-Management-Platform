// Include dependency (Express)
const express = require("express");
const host = "127.0.0.1";
const port = 5000;

// Initialisation
var app = express();

//Middleware functions
app.use(express.json());
app.use(express.urlencoded({extended : false}));

//Create array for storing users names users
const users = [];

// REQUEST - (Path - /)
// RESPONSE - HTML page 
app.use("/",express.static("client"));

// Registration
app.get("/register",function(request,response){
    response.send(`<form action="/registerDetails" method="POST">
                    <input type="email" name="email" placeholder="Email📧" autocomplete="off">
                    <input type="password" name="password" placeholder="Choose Password" autocomplete="off">
                    <button>Submit</button>
                 `);
})

//Collect Registration Details
app.post("/registerDetails",function(request,response){
    console.log("Email :",request.body.email);
    console.log("Password :",request.body.password);

    const email = request.body.email;
    const password = request.body.password;

    //Registration logic
    //[x]. Empty Array creation named users - (For storing users)
    //[x]. Create user object - (properties - email,password,id,token_id)
    //[x]. PUSH user object into an users array

    //Check if user exists or not !

    // var userExists = false;

    // for (var i = 0 ; i< users.length ; i++){
    //     if(users[i].email === email){
    //         userExists = true;
    //         break;
    //     };
    // };

    // if(userExists === true){
    //     response.send("Error : User Exists Already !❌");
    // }else{
    //     //Create User object👤
    //     let user = {
    //         email : email,
    //         password : password
    //     }

    //     //Push user object into users array !
    //     users.push(user);
    //     console.log(users);

    //     //Send Registration successful message✅ !
    //     response.send("registration successful !🎉");

    // };

     const getIndex = users.findIndex((user) => user.email === email);
     console.log(getIndex);
    
     if(getIndex < 0){

        //const,var,let
        let today = new Date().toLocaleString().split(",")[0];


        //  Create User object👤
         let user = {
             _id : Math.random().toString().split(".")[1],
             email : email,
             password : password,
             api_key : Math.random().toString(16).split(".")[1],
             usage :[{
                 date : today,
                 count : 0
             }]
         }

        //  Push user object into users array !
        users.push(user);
        console.log(users);

        //  Send Registration successful message✅ !
        response.send("registration successful !🎉");

     }else{
        
        //  Send Error message❌ !
          response.send("Error !");
     }

});

// Login
app.get("/login",function(request,response){
    response.send(`<form action="/loginDetails" method="POST">
                    <input type="email" name="email" placeholder="Email📧" autocomplete="off">
                    <input type="password" name="password" placeholder="Choose Password" autocomplete="off">
                    <button>Submit</button>
                 `);
});

app.post("/loginDetails",function(request,response){
    const email = request.body.email;
    const password = request.body.password;

    console.log("Email :",email);
    console.log("Password :",password);


    //Login logic
    //x[]Search users array and check whether user exists or not !
    //x[] If user doesn't exists then send error message

    const getIndex = users.findIndex((user)=>user.email === email);
    console.log("Index :",getIndex);

    if(getIndex < 0){
        response.send("Error : User doesn't exists !😥");
    }else{
        //User exists !
        //Password matching
        if(users[getIndex].password === password){
            response.send("Success : Logged In !🎉");
        }else{
            response.send("Error :Password Incorrect !❌");
        }
    }

})



app.listen(port,host,function(){
    console.log("Server is running !");
});
