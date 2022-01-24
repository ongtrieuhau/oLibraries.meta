//requiring path and fs modules
const path = require("path");
const fs = require("fs");

console.info("BẮT ĐẦU THỰC HIỆN");
//joining path of directory
const directoryPath = ".\\";
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
   //handling error
   if (err) {
      return console.log("Unable to scan directory: " + err);
   }
   //listing all files using forEach
   files.forEach(function (file) {
      // Do whatever you want to do with the file
      console.log(file);
      console.log(JSON.stringify(file));
   });
});
