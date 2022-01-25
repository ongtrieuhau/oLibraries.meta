//requiring path and fs modules
const path = require("path");
const fs = require("fs");
var axios = require("axios");
var CryptoJS = require("crypto-js");

var oAxios = (() => {
   const checkConfig = (paraConfig) => {
      const { auth, data } = paraConfig;
      let baseConfig = {
         method: "GET",
         url: "",
         headers: {},
         maxContentLength: Infinity,
         maxBodyLength: Infinity,
      };
      var config = {
         ...baseConfig,
         ...paraConfig,
      };
      if (!("content-type" in config.headers)) config.headers["content-type"] = "application/json";
      if ((config.url + "").toLowerCase().startsWith("https://api.heroku.com") === true) {
         config.headers.Accept = "application/vnd.heroku+json; version=3";
      }
      if (typeof auth === "string" && auth !== "") config.headers.Authorization = auth;
      if (typeof data === "object") config.data = data;
      if (typeof data === "string" && data + "" !== "") config.data = JSON.stringify(data);
      return config;
   };
   const fetchByConfig = (config) =>
      axios(checkConfig(config))
         .then((res) => Promise.resolve(res.data))
         .catch((err) => Promise.reject(err));
   const fetch = (paraConfig) => fetchByConfig(paraConfig);
   return {
      Config: checkConfig,
      Fetch: fetch,
      FetchByConfig: fetchByConfig,
      DownloadBuffer: (paraConfig) => {
         return fetchByConfig({
            ...paraConfig,
            responseType: "arraybuffer",
         });
      },
   };
})();
/* let urlFB = "https://ohau21ngrok0406-goauth2-default-rtdb.firebaseio.com/0EditTime.json?auth=kL2ehbr32dbpaRmLHwjRR13uXyg1rdalJxCpuL51";
let urlGithub = "https://github.com/o-ngtrieuhau861gmailcom/oLibraries.meta/blob/main/OTH.TestBuildEvent.dll.libraryfile.json?raw=true";
oAxios.DownloadBuffer({ url: urlGithub }).then((data) => {
   console.log(data);
   if (Buffer.isBuffer(data)) console.log(data.toString("utf8"));
}); */
console.info("BẮT ĐẦU THỰC HIỆN");
console.info(CryptoJS.SHA1("BẮT ĐẦU THỰC HIỆN").toString());
//joining path of directory
const directoryPath = ".\\";
//passsing directoryPath and callback function
fs.readdir(
   directoryPath,
   {
      withFileTypes: true,
   },
   function (err, files) {
      //handling error
      if (err) {
         return console.log("Unable to scan directory: " + err);
      }
      //listing all files using forEach
      files.forEach(function (file) {
         // Do whatever you want to do with the file
         if (file.isFile() === true && file.name.endsWith(".libraryfile.json")) {
            fs.readFile(file.name, "utf8", (err, data) => {
               if (err) {
                  console.error(err);
                  return;
               } else if (data) {
                  let objFile = JSON.parse(data);
                  console.log(objFile);
                  //https://github.com/o-ngtrieuhau861gmailcom/oLibraries.meta/raw/main/OTH.TestBuildEvent.dll.libraryfile.json
                  var url = "https://github.com/oth-dhghospital/oLibraries/blob/main/OTH.TestBuildEvent.dll?raw=true";
                  oAxios.DownloadBuffer({ url: url }).then((buffer) => {
                     console.log(buffer);
                     fs.writeFile("OTH.TestBuildEvent.dll", buffer, (err) => {
                        if (err) throw err;
                     });
                  });
               }
            });
         }
      });
   }
);
