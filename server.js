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
    const getIndex = users.findIndex((user) => user.email === email);
    console.log(getIndex);
    
    if(getIndex < 0){

        //Create User object👤
        let user = {
            email : email,
            password : password
        }

        //Push user object into users array !
        users.push(user);
        console.log(users);

        //Send Registration successful message✅ !
        response.send("registration successful !🎉");
    }else{
        
        //Send Error message❌ !
        response.send("Error !");
    }

    // TODO - loop problem is remaining !😫

});


app.listen(port,host,function(){
    console.log("Server is running !");
});
