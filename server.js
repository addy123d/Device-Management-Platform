// Include dependency (Express)
const express = require("express");
const session = require("express-session");
const ejs = require("ejs");
const host = "127.0.0.1";
const port = 5000;

// Initialisation
var app = express();

//Middleware functions
app.use(express.json());
app.use(express.urlencoded({extended : false}));

//Configuration
 // SESSION CONFIGURATION (for initialising of token, and many more properties !)
 const sess = {
    name: "User",
    resave: false,
    saveUninitialized: true,
    secret: "mySecret",
    cookie: {}
  }


  if (app.get('env') === "production") {
    sess.cookie.secure = false;
    sess.cookie.maxAge = 60 * 60;
    sess.cookie.sameSite = true;
}


app.use(session(sess));

app.set("view engine","ejs");

//Functions
function redirectProfile(request,response,next){
    console.log(request.session.Email);
    if(request.session.Email){
        response.redirect("/profile");
    }else{
        next();
    }
};

function redirectLogin(request,response,next){
    if(!request.session.Email){
        response.redirect("/login");
    }else{
        next();
    }
}

//Create array for storing users names users
const users = [];

// REQUEST - (Path - /)
// RESPONSE - HTML page 
app.use("/",express.static("client"));

// Registration
app.get("/register",redirectProfile,function(request,response){
    response.render("register");
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
             }],
             projectTitle : [],
             ips : [],
             pinNumber : [],
             projectDescription : []
         }

        //  Push user object into users array !
        users.push(user);
        console.log(users);

        //  Send Registration successful message✅ !
        // response.send("registration successful !🎉");

        //Store data into cookie🍪
        
        request.session.Email = email;
        request.session.Password = password;

        console.log(request.session);

        response.redirect("/addnewproject");

     }else{
        
        //  Send Error message❌ !
          response.send("Error !");
     }

});

// Login
app.get("/login",redirectProfile,function(request,response){
    response.render("login");
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
            // response.send("Success : Logged In !🎉");

         //Store data into cookie🍪
        request.session.Email = users[getIndex].email;
        request.session.Password = users[getIndex].password;

        console.log(request.session);

        response.redirect("/addnewproject");
        }else{
            response.send("Error :Password Incorrect !❌");
        }
    }

});

app.get("/addnewproject",redirectLogin,function(request,response){
    response.render("newproject");
});

app.post("/projectDetails",function(request,response){
    const title = request.body.title;
    const ip = request.body.ip;
    const pinNumber = request.body.pinNumber;
    const description = request.body.projDescription; 
    const email = request.session.Email;

    //Steps to push details
    //Find location of user in array
    const getIndex = users.findIndex((user)=>user.email === email);

    console.log("Index :",getIndex);

    //Push details
    users[getIndex].projectTitle.push(title);
    users[getIndex].ips.push(ip);
    users[getIndex].pinNumber.push(pinNumber);
    users[getIndex].projectDescription.push(description);

    console.log("Titles :",users[getIndex].projectTitle);
    console.log("IPs :",users[getIndex].ips);
    console.log("Pin Number :",users[getIndex].pinNumber);
    console.log("description :",users[getIndex].projectDescription);

})

app.get("/logout",function(request,response){
    request.session.destroy(function(err){
        if(err){
            response.redirect("/profile");
        }

        response.redirect("/login");
    })
})

app.listen(port,host,function(){
    console.log("Server is running !");
});
