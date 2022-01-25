//requiring path and fs modules
const path = require("path");
const fs = require("fs");
const https = require("https");
var axios = require("axios");
var oAxios = require(".\\oAxios");
oAxios.getData("https://ohau21ngrok0406-goauth2-default-rtdb.firebaseio.com/0EditTime.json?auth=kL2ehbr32dbpaRmLHwjRR13uXyg1rdalJxCpuL51").then((data) => console.log(data));

/* var config = {
   method: "get",
   url: "https://ohau21ngrok0406-goauth2-default-rtdb.firebaseio.com/0EditTime.json?auth=kL2ehbr32dbpaRmLHwjRR13uXyg1rdalJxCpuL51",
   headers: {},
};

axios(config)
   .then(function (response) {
      console.log(JSON.stringify(response.data));
   })
   .catch(function (error) {
      console.log(error);
   }); */
console.info("BẮT ĐẦU THỰC HIỆN");
//joining path of directory
const directoryPath = ".\\";
//passsing directoryPath and callback function
// fs.readdir(
//    directoryPath,
//    {
//       withFileTypes: true,
//    },
//    function (err, files) {
//       //handling error
//       if (err) {
//          return console.log("Unable to scan directory: " + err);
//       }
//       //listing all files using forEach
//       files.forEach(function (file) {
//          // Do whatever you want to do with the file
//          if (file.isFile() === true) {
//             fs.readFile(file.name, "utf8", (err, data) => {
//                if (err) {
//                   console.error(err);
//                   return;
//                } else if (data) {
//                   let objFile = JSON.parse(data);
//                   console.log(objFile);
//                   //https://github.com/o-ngtrieuhau861gmailcom/oLibraries.meta/raw/main/OTH.TestBuildEvent.dll.libraryfile.json
//                   var url = "https://github.com/o-ngtrieuhau861gmailcom/oLibraries.meta/blob/main/OTH.TestBuildEvent.dll.libraryfile.json?raw=true";
//                }
//             });
//          }
//       });
//    }
// );
