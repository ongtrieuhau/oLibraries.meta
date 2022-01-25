//requiring path and fs modules
const path = require("path");
const fs = require("fs");
const https = require("https");
const download = (url, dest, cb) => {
   const file = fs.createWriteStream(dest);

   const request = https.get(url, (response) => {
      // check if response is success
      if (response.statusCode !== 200) {
         return cb("Response status was " + response.statusCode);
      }

      response.pipe(file);
   });

   // close() is async, call cb after close completes
   file.on("finish", () => file.close(cb));

   // check for request error too
   request.on("error", (err) => {
      fs.unlink(dest);
      return cb(err.message);
   });

   file.on("error", (err) => {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      return cb(err.message);
   });
};
var axios = require("axios");

var config = {
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
   });
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
