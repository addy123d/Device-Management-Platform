//This file is just for practice purpose !
//Create object
// const arr = [1,2,3,4,5];

// for(var i = 0 ; i < arr.length; i++){
//     console.log(arr[i])
// }

//Generate ID
// const id = Math.random();

// console.log("Number :",id);

//String Conversion
// console.log("String :",id.toString());

//After splitting at .
// console.log("Array :",id.toString().split("."));

//Final string
// console.log("Final ID :",id.toString().split(".")[1]);


//Generate API KEY
// const api_key = Math.random();

// console.log("API :",api_key);
// const apiNumber = api_key;

//STRING CONVERSION
// const apiString = apiNumber.toString(16);
// console.log("API STR :",apiString.split(".")[1]);

//Generate Time
const time = new Date().toLocaleString().split(",")[0];
console.log(time);