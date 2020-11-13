const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    email : {
        type: String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    plan : {
        type : String,
        required : true
    },
    Freeplan_usage :{
        type : String,
        required : true
    },
    api_key :{
        type : String,
        required : true
    },
    usage :[
        {
            date :{
                type : String,
                required: true
            },
            count :{
                type : Number,
                required :  true
            }
        }
    ],
    //Idea to be executed
    // projectData : [
    //     {
    //         projectTitle :{

    //         },
    //         ips : {

    //         },
    //         pinNumber : {

    //         },
    //         projectDescription: {

    //         }
    //     }
    // ]
    projectTitle :{
        type : Array,
        required :  true
    },
    ips :{
        type : Array,
        required :  true
    },
    pinNumber :{
        type : Array,
        required :  true
    },
    projectDescription :{
        type : Array,
        required :  true
    }
});

module.exports = User = mongoose.model("myUser",userSchema);