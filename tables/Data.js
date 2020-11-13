const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dataSchema = new schema({
    key : {
        type: String,
        required : true
    },
    projectName : {
        type : Array,
        required : true
    },
    data :[
        {
            title :{
                type : String,
                required: true
            },
            deviceData :{
                type : [Object],
                required :  true
            }
        }
    ]
});

module.exports = Data = mongoose.model("myData",dataSchema);