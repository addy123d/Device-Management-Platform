// Include dependency (Express)
const express = require("express");
const session = require("express-session");
const mongo = require("mongoose");
const urlObj = require("./setup/config");
const User = require("./tables/User");
const Data  = require("./tables/Data");
const ejs = require("ejs");
const host = "127.0.0.1";
const port = 5000;
var hour = 3600000;

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


//   if (app.get('env') === "production") {
    sess.cookie.secure = false; //http or https
    sess.cookie.expires = new Date(Date.now() + hour)
    sess.cookie.maxAge = hour;
    sess.cookie.sameSite = true;
// }


app.use(session(sess));

app.set("view engine","ejs");

//Database Connection
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify : false 
    };


    mongo.connect(urlObj.url,options)
    .then(function(){
        console.log("Database Connected !");
    })
    .catch(function(err){
        console.log("Something went wrong !");
    });

//Functions
function redirectProfile(request,response,next){
    console.log(request.session.Email);

    if(request.session.Email){
        response.redirect("/addnewproject");
    }else{
        next();
    }

};

function redirectLogin(request,response,next){

    if(!request.session.Email){
        response.redirect("/login");
    }else{
        next();
    };

}

function validateKey(request,response,next){

    const email = request.params.email;
    const key = request.params.key;

    //USING DB :
    User.findOne({api_key : key})
    .then(function(person){
        if(person){
        let today = new Date().toLocaleString().split(",")[0];

        //Usage day exists or not !
        const usageIndex = person.usage.findIndex(user=>user.date === today);

        var API_COUNT;

        if(usageIndex >= 0){
           
            //Check user's plan
            if(person.plan === "Free"){
                API_COUNT = 2;
            }else{
                if(person.plan === "Silver"){
                    API_COUNT = 5;  
                }else{
                    API_COUNT = 10; 
                }
            };

            if(person.usage[usageIndex].count > API_COUNT){
                response.json({
                    "error" : "Max calls exceeded !"
                });
            }else{
                person.usage[usageIndex].count++;
                console.log("Count :",person.usage[usageIndex].count);


                let updatedCount = person.usage[usageIndex].count;

                // users = [{
                //     key : key,
                //     usage : [{
                //         date ,
                //         count
                //     }]
                // },{
                //     key : key,
                //     usage : [{
                //         date ,
                //         count
                //     }]
                // },{
                //     key : key,
                //     usage : [{
                //         date ,
                //         count
                //     }]
                // }]
                User.updateOne(
                    { api_key: key, "usage.date": today },  //api_key is to find user in database, usage.date is to find which day we have to track or update count !
                    { $set: { "usage.$.count" : updatedCount } }
                )
                .then(()=>{
                    console.log("Updated Successfully !");
                    next();
                })
                .catch(err=>console.log(err))

            }

        }else{

            User.findOneAndUpdate({
                api_key : key
            },
            {
                $push : {
                    usage :  {
                            date : today,
                            count : 0
                        }
                }
            },
            {
                new : true
            })
            .then((person)=>{
                
            console.log("Account Usage :",person.usage);

            next();
            })
            .catch(err=>console.log(err));

            // account.usage.push({
            //     date : today,
            //     count : 0
            // });

        }
   

        }else{
        response.json({
            "error" : "You are not allowed !"
        });
        }
    })
    .catch(function(err){
        console.log("Error :",err);
    })

    //USING ARRAYS :
    // //Check if account exists or not
    // const account = users.find((user)=> user.email === email && user.api_key === key);

    // //object or undefined
    // if(account){
    //     let today = new Date().toLocaleString().split(",")[0];

    //     //Usage day exists or not !
    //     const usageIndex = account.usage.findIndex(user=>user.date === today);
    //     var API_COUNT;

    //     if(usageIndex >= 0){
           
    //         //Check user's plan
    //         if(account.plan === "Free"){
    //             API_COUNT = 2;
    //         }else{
    //             if(account.plan === "Silver"){
    //                 API_COUNT = 5;  
    //             }else{
    //                 API_COUNT = 10; 
    //             }
    //         };

    //         if(account.usage[usageIndex].count > API_COUNT){
    //             response.json({
    //                 "error" : "Max calls exceeded !"
    //             });
    //         }else{
    //             account.usage[usageIndex].count++;
    //             console.log("Count :",account.usage[usageIndex].count);
    //             next();
    //         }

    //     }else{

    //         account.usage.push({
    //             date : today,
    //             count : 0
    //         });

    //         console.log("Account Usage :",account.usage);

    //         next();
    //     }
    // }else{

    //     response.json({
    //         "error" : "You are not allowed !"
    //     });

    // }
}

//Create array for storing users names users
// const users = [];
// const userData = [];

// REQUEST - (Path - /)
// RESPONSE - HTML page 
app.use("/",express.static("client"));

// Registration
app.get("/register",redirectProfile,function(request,response){
    response.render("register");
});


//Collect Registration Details
app.post("/registerDetails",function(request,response){

    // USING DATABASE
    const { email, password, plan} = request.body;

    User.findOne({email : email})
    .then(function(person){

        // Check if person exists or not !
        if(person){
            response.json({
                "emailerr" : "Already Registered !"
            })
        }else{
            //For free plan usage check
            var plan_usage;

            if(plan === "Free"){
            plan_usage = "Yes";
            }else
            plan_usage = "No";

            let today = new Date().toLocaleString().split(",")[0];

            let user = {
                email : email,
                password : password,
                plan : plan,
                Freeplan_usage : plan_usage,
                api_key : Math.random().toString(16).split(".")[1],
                usage :[{
                date : today,
                count : 0
                }],
                // projectTitle : [],
                // ips : [],
                // pinNumber : [],
                // projectDescription : []
                //Idea to be executed
                projectData : []
            };

            //SAVING USER DETAILS IN DB
            new User(user).save()
            .then(function(user){
                console.log("User Registered !");

            //Store data into cookie🍪
            request.session.Email = user.email;
            request.session.Password = user.password;
            request.session.key = user.api_key;
            console.log(request.session);


            // Response
            response.send(`<h1>Registered ! Your key - ${user.api_key}</h1>
                           <a href="/addnewproject"><button>New Project</button></a>`);

            })
            .catch(function(err){
                console.log("Error :",err);
            });
        }    
    })
    .catch(function(err){
        console.log("Error :",err);
     });


    // USING ARRAYS :
    // console.log("Email :",request.body.email);
    // console.log("Password :",request.body.password);

    // // const email = request.body.email;
    // // const password = request.body.password;
    
    // const { email, password, plan} = request.body;

    // //Registration logic
    // //[x]. Empty Array creation named users - (For storing users)
    // //[x]. Create user object - (properties - email,password,id,token_id)
    // //[x]. PUSH user object into an users array

    // //Check if user exists or not !

    // // var userExists = false;

    // // for (var i = 0 ; i< users.length ; i++){
    // //     if(users[i].email === email){
    // //         userExists = true;
    // //         break;
    // //     };
    // // };

    // // if(userExists === true){
    // //     response.send("Error : User Exists Already !❌");
    // // }else{
    // //     //Create User object👤
    // //     let user = {
    // //         email : email,
    // //         password : password
    // //     }

    // //     //Push user object into users array !
    // //     users.push(user);
    // //     console.log(users);

    // //     //Send Registration successful message✅ !
    // //     response.send("registration successful !🎉");
    // // };

    //     //For free plan usage check
    //     var plan_usage;
        
    //     if(plan === "Free"){
    //          plan_usage = "Yes";
    //     }else
    //         plan_usage = "No";

    //  const getIndex = users.findIndex((user) => user.email === email);
    //  console.log(getIndex);
    
    //  if(getIndex < 0){

    //     //const,var,let
    //     let today = new Date().toLocaleString().split(",")[0];


    //     //  Create User object👤
    //      let user = {
    //         //  _id : Math.random().toString().split(".")[1],
    //          email : email,
    //          password : password,
    //          plan : plan,
    //          Freeplan_usage : plan_usage,
    //          api_key : Math.random().toString(16).split(".")[1],
    //          usage :[{
    //              date : today,
    //              count : 0
    //          }],
    //          projectTitle : [],
    //          ips : [],
    //          pinNumber : [],
    //          projectDescription : []
    //      }

    //     //  Push user object into users array !
    //     users.push(user);
    //     console.log(users);

    //     //  Send Registration successful message✅ !
    //     // response.send("registration successful !🎉");

    //     //Store data into cookie🍪
    //     request.session.Email = email;
    //     request.session.Password = password;

    //     console.log(request.session);

    //     response.send(`<h1>Registered ! Your key - ${user.api_key}</h1>
    //                     <a href="/addnewproject"><button>New Project</button></a>`);

    //  }else{
        
    //     //  Send Error message❌ !
    //       response.send("Error !");
    //  }

});

app.get("/delete",redirectLogin,function(request,response){

    //Send project Title to determine the project for deletion !
    response.send(`<form action="/deleteProject" method="POST">
                    <input type="text" name="title" placeholder="Enter Project Title" autocomplete="off">
                    <button>Delete Project</button>
                    </form>`);
});

app.post("/deleteProject",function(request,response){
    const email = request.session.Email;
    const title = request.body.title;

    //Logic for project Deletion
    User.updateOne(
        {email : email},
        {$pull : {projectData : {projectTitle : title} }},
        { multi: true }
    )
    .then(()=>{
        console.log('Project Deleted Successfully !');
    })
    .catch(function(err){
        console.log("Error :",err);
    });

    
});

// Plans
app.get("/plan",redirectLogin,function(request,response){
    const email = request.session.Email;

    //USING DB :
    User.findOne({email : email})
    .then(function(person){

        //Check for the user's free plan usage
            if(person.Freeplan_usage === "Yes"){
                return response.render("updatePlan",{
                    usage : "YES"
                }); 
            }else{
                response.render("updatePlan",{
                    usage : "NO"
                });
            };

    })
    .catch(function(err){
        console.log("Error :",err);
    });

    //USING ARRAYS :
    // //Get Index of user
    // const getIndex = users.findIndex((user)=>user.email === email);


    // if(users[getIndex].Freeplan_usage === "Yes"){
    //     return response.render("updatePlan",{
    //          usage : "YES"
    //      }); 
    // };

    // response.render("updatePlan",{
    //     usage : "NO"
    // });

});

app.post("/updatePlan",function(request,response){
    console.log(request.session);
    const email = request.session.Email;
    const {plan } = request.body;
    let today = new Date().toLocaleString().split(",")[0];
    console.log("Plan :",plan);

    // USING DB :
    User.findOne({email : email}).then(function(person){
        User.updateOne(
            {email : email,'usage.date' : today},
            {$set : {'plan' : plan,'usage.$.count' : 0}}
        )
        .then(()=>{
            console.log('Plan updated Successfully !');
        })
        .catch(function(err){
            console.log("Error :",err);
        });

    }).catch(function(err){
        console.log("Error : ",err);
    });

    //USING ARRAYS :
    // //Find index of that user
    // const getIndex = users.findIndex((user)=>user.email === email);

    // // console.log(getIndex);
    // users[getIndex].plan = plan;

    // // Reset Count
    // let today = new Date().toLocaleString().split(",")[0];
    // const usageIndex = users[getIndex].usage.findIndex((user)=>user.date === today);

    // if(usageIndex >= 0){
    //     users[getIndex].usage[usageIndex].count = 0;
    // };

    // console.log(users);
})

// Login
app.get("/login",redirectProfile,function(request,response){
    response.render("login");
});

app.post("/loginDetails",function(request,response){
    // const email = request.body.email;
    // const password = request.body.password;

    const {email, password} = request.body;

    console.log("Email :",email);
    console.log("Password :",password);

    // Using DB :
    User.findOne({email : email})
    .then(function(person){
        if(!person){
            response.json({
                "err"  : "User doesn't exists !"
            });
        }else{

        //User exists !
        //Password matching
        if(person.password === password){

        console.log("Logged In !");
         //Store data into cookie🍪
        request.session.Email = person.email;
        request.session.Password = person.password;
        request.session.key = person.api_key;

        console.log(request.session);

        response.redirect("/addnewproject");
        }else{
            response.send("Error :Password Incorrect !❌");
        } 
        
        };
    })
    .catch(function(err){
        console.log("Error :",err);
    });


    //Using Arrays :
    // //Login logic
    // //x[]Search users array and check whether user exists or not !
    // //x[] If user doesn't exists then send error message

    // const getIndex = users.findIndex((user)=>user.email === email);
    // console.log("Index :",getIndex);

    // if(getIndex < 0){
    //     response.send("Error : User doesn't exists !😥");
    // }else{
    //     //User exists !
    //     //Password matching
    //     if(users[getIndex].password === password){
    //         // response.send("Success : Logged In !🎉");

    //      //Store data into cookie🍪
    //     request.session.Email = users[getIndex].email;
    //     request.session.Password = users[getIndex].password;
    //     request.session.key = users[getIndex].api_key;

    //     console.log(request.session);

    //     response.redirect("/addnewproject");
    //     }else{
    //         response.send("Error :Password Incorrect !❌");
    //     }
    // }

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

    // USING DATABASE
        User.findOneAndUpdate({
            email : email
        },{
            $push : {
                // projectTitle : title,
                // ips : ip,
                // pinNumber : pinNumber,
                // projectDescription : description
                //Idea to be executed
                projectData : {
                        projectTitle : title,
                        ips : ip,
                        pinNumber : pinNumber,
                        projectDescription : description
                }
            }
        },
        {
            new :  true
        }
        )
        .then(function(){
            console.log("Updated successfully !");
            response.json({
            "message" : "Data stored successfully !"
            });
        })
        .catch(function(err){
            console.log(err);
        })


    // USING ARRAYS:

    // //Steps to push details
    // //Find location of user in array
    // const getIndex = users.findIndex((user)=>user.email === email);

    // console.log("Index :",getIndex);

    // //Push details
    // users[getIndex].projectTitle.push(title);
    // users[getIndex].ips.push(ip);
    // users[getIndex].pinNumber.push(pinNumber);
    // users[getIndex].projectDescription.push(description);

    // console.log("Titles :",users[getIndex].projectTitle);
    // console.log("IPs :",users[getIndex].ips);
    // console.log("Pin Number :",users[getIndex].pinNumber);
    // console.log("description :",users[getIndex].projectDescription);


    // response.json({
    //     "message" : "Data stored successfully !"
    // });

});


app.get("/deviceping/:key&:email&:title",validateKey,function(request,response){
    console.log("Device is connected with me !");

    const key = request.params.key;
    const title = request.params.title;

    console.log("Key :",key);

    //USING DB :
    Data.findOne({key : key})
    .then(function(person){
        if(person){
                ////Check project name repetition
    //     const titleIndex = userData[getIndex].projectName.findIndex((projectTitle)=> projectTitle === title);
        
    //     if(titleIndex < 0){
    //         userData[getIndex].projectName.push(title);
    //         userData[getIndex].data.push({ deviceData : []});
    //     };

    //     console.log(userData);

        const titleIndex = person.projectName.findIndex((projectTitle)=> projectTitle === title);
        if(titleIndex < 0){
            // userData[getIndex].projectName.push(title);
            // userData[getIndex].data.push({title: title, deviceData : []});
            Data.findOneAndUpdate({
                key : key
            },{
                $push : {projectName :  title,data : {title : title,deviceData : []}}
            },
            {
                new :  true
            })
            .then(()=>{
            response.status(200).json({
                        "success": "Connected Successfully !"
            });
            })
            .catch(function(err){
                console.log(err);
            });
        }else{

            response.status(200).json({
                "success": "Connected Successfully !"
            });  

        };

        }else{
            //If person's data doesn't exists !
            const data_object = {
                key : key,
                projectName : [title],
                data :[{
                    title : title,
                    deviceData : []
                }]
            };

            new Data(data_object).save()
            .then(()=>{
                response.status(200).json({
                    "success": "Connected Successfully !"
                });
            })
            .catch(function(err){
                console.log(err);
            })
        }
    })
    .catch(function(err){
        console.log(err);
    });

    //USING ARRAYS :

    // const getIndex = userData.findIndex((user)=>user.key === key);

    // if(getIndex < 0){
    //     //Push 
    //     const data_object = {
    //         key : key,
    //         projectName : [title],
    //         data :[{
    //             deviceData : []
    //         }]
    //     };

    //     // projectName : ['Sensor','Led Blink','Motor','xyz']
    //     // data : [{
    //     //     deviceData: []
    //     // },{
    //     //     deviceData: []
    //     // },{
    //     //     deviceData: []
    //     // }]

    //     userData.push(data_object);
    //     console.log(userData);
    // }else{

    //     //Check project name repetition
    //     const titleIndex = userData[getIndex].projectName.findIndex((projectTitle)=> projectTitle === title);
        
    //     if(titleIndex < 0){
    //         userData[getIndex].projectName.push(title);
    //         userData[getIndex].data.push({ deviceData : []});
    //     };

    //     console.log(userData);
    // };

    // console.log("Data Array :",userData);

    // response.status(200).json({
    //     "success": "Connected Successfully !"
    // });
});


//Collect User data !
app.post("/device/data/:api_key&:title",function(request,response){
    // console.log(request.body);

    //Collect properties (Normal way)
    // const distance = request.body.distance;
    // const reading = request.body.reading;
    // const status = request.body.status;
    // const time = request.body.time;

    // Alternative way to collect properties
    const { distance, reading, status, time} = request.body;
    const key = request.params.api_key;
    const projectTitle = request.params.title;

    Data.findOne({key : key})
    .then(function(person){
            console.log(person);

            const device_data = {
                distance : distance,
                reading : reading,
                status : status,
                time : time
            };

            Data.updateOne(
                { key: key, "data.title": projectTitle },
                { $push: { "data.$.deviceData" : device_data } }
            )
            .then(()=>{
                console.log("Device Data updated !");
                response.json({
                    "success" : "Data collected successfully !"
                });
            })
            .catch(function(err){
                console.log(err);
            });

    })
    .catch(err=>console.log(err));

    // // Get index && we are checking if user sends data or not !
    // const getIndex = userData.findIndex((user)=> user.key === key);
    
    // //Check project title location for appropriate storage of data corresponding to its title
    // const titleIndex = userData[getIndex].projectName.findIndex((projTitle)=> projTitle === projectTitle);

    //     const device_data = {
    //         distance : distance,
    //         reading : reading,
    //         status : status,
    //         time : time
    //     };

    //     userData[getIndex].data[titleIndex].deviceData.push(device_data);

    //     console.log(userData[getIndex].data[titleIndex].deviceData);
        


    // // const device_data = {
    // //     distance : distance,
    // //     reading : reading,
    // //     status : status,
    // //     time : time
    // // };

    // // userData[getIndex].data.push(device_data);

    // // console.log("Data :",userData[getIndex].data);
    // // console.log("Data Array :",userData);

    // response.json({
    //     "success" : "Data collected successfully !"
    // });

});

app.get("/graph/:title",redirectLogin,function(request,response){

    const key = request.session.key;
    const title = request.params.title;

    // USING DB :
    Data.findOne({key :  key})
    .then(function(person){
        // Check is person is registered in data table or not !
        if(person){
            const titleIndex = person.projectName.findIndex((projectTitle)=> projectTitle === title);

            if(titleIndex >= 0){
                const dataArray = person.data[titleIndex].deviceData;

                     let reading = [];
                     let date = [];

                    dataArray.forEach(data => {
                        //Seperate reading and store in reading array
                        reading.push(data.reading);

                        //Seperate time and store in date array
                        date.push(data.time);
                    });

                    console.log("Readings Array :",reading);
                    console.log("Date Array :",date);
                    
                    response.render("graph",{
                        readings : reading,
                        date : date
                    });
        }else{
            //This else is for if project title doesn't exists
            response.send(`Given project doesn't exists.. Create one <a href="/addnewproject">Create New Project</a>`);
        }
        }else{
            //THis else is for if whhole user doesn't exists or he/she not registered their first project !
            response.send("No data yet !");
        }
    })
    .catch(function(err){
        console.log("Error : ",err);
    });


    //USING ARRAYS :
    // //Check if account exists or not
    // const user_accountIndex = userData.findIndex((user)=>user.key === key);

    // if(user_accountIndex >= 0){ 

    //     const titleIndex = userData[user_accountIndex].projectName.findIndex((projectTitle)=> projectTitle === title);

    //     if(titleIndex >= 0){
    //        const dataArray =  userData[user_accountIndex].data[titleIndex].deviceData;

    //     let reading = [];
    //     let date = [];

    //     dataArray.forEach(data => {
    //         //Seperate reading and store in reading array
    //         reading.push(data.reading);

    //         //Seperate time and store in date array
    //         date.push(data.time);
    //     });

    //     console.log("Readings Array :",reading);
    //     console.log("Date Array :",date);
        
    //     response.render("graph",{
    //         readings : reading,
    //         date : date
    //     });

    //     }else{
    //         response.send(`Given project doesn't exists.. Create one <a href="/addnewproject">Create New Project</a>`);
    //     }
    // }else{
    //     response.send("No data yet !");
    // }


});


app.get("/logout",function(request,response){
    request.session.destroy(function(err){
        if(err){
            response.redirect("/profile");
        };

        response.redirect("/login");
    })
});

app.listen(port,host,function(){
    console.log("Server is running !");
});