//requiring path and fs modules
const path = require("path");
const fs = require("fs");
var axios = require("axios");
var CryptoJS = require("crypto-js");
const core = require("@actions/core");
const github = require("@actions/github");
const oExecuter = {
   __dirname: __dirname,
   __filename: __filename,
   env: process.env,
   ConfigPathFile: () => {
      let executeFileName = path.parse(__filename).name;
      let executePathDirectory = path.dirname(__filename);
      let files = fs.readdirSync(executePathDirectory);
      let result = "";
      for (var i = 0; i < files.length; i++) {
         let file = files[i].toLowerCase();
         if (files[i].startsWith(executeFileName.toLowerCase()) && files[i].endsWith(".action.config.json")) {
            result = path.join(executePathDirectory, files[i]);
            break;
         }
      }
      return result;
   },
};
console.log(oExecuter.ConfigPathFile());
console.log(oExecuter);

var oAxios = (() => {
   const checkConfig = (paraConfig) => {
      var { auth, data, GithubToken } = paraConfig;
      if (typeof GithubToken === "string" && GithubToken !== "") {
         GithubToken = oCrytoJS.AESDecryptString(GithubToken, "123");
         auth = "Basic " + Buffer.from(":" + GithubToken).toString("base64");
      }
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
      //Accept
      let urlLower = (config.url + "").toLowerCase();
      switch (true) {
         case urlLower.startsWith("https://api.heroku.com"):
            config.headers.Accept = "application/vnd.heroku+json; version=3";
            break;
         case urlLower.startsWith("https://api.github.com"):
            config.headers.Accept = "application/vnd.github.v3+json";
            break;
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
      GetData: (paraConfig) => {
         return fetchByConfig({
            ...paraConfig,
            method: "GET",
         });
      },
   };
})();
var oCrytoJS = (() => {
   return {
      HashMD5Buffer: (buffer) =>
         CryptoJS.MD5(CryptoJS.lib.WordArray.create(new Uint8Array(buffer)))
            .toString()
            .toUpperCase(),
      HashSHA1Buffer: (buffer) =>
         CryptoJS.SHA1(CryptoJS.lib.WordArray.create(new Uint8Array(buffer)))
            .toString()
            .toUpperCase(),

      HashMD5String: (text) => CryptoJS.MD5(text).toString().toUpperCase(),
      HashSHA1String: (text) => CryptoJS.SHA1(text).toString().toUpperCase(),

      AESEncryptString: (text, passphare) => CryptoJS.AES.encrypt(text, passphare).toString(),
      AESDecryptString: (text, passphare) => CryptoJS.AES.decrypt(text, passphare).toString(CryptoJS.enc.Utf8),
   };
})();

var crytoVar = "BẮT ĐẦU THỰC HIỆN";

return;
var buffer = Buffer.from(crytoVar);
let encryptVar = oCrytoJS.AESEncryptString(crytoVar, "123");
console.info("AESEncryptString:", encryptVar);
console.info("AESDecryptString:", oCrytoJS.AESDecryptString(encryptVar, "123"));

console.info("HashSHA1Buffer:", oCrytoJS.HashSHA1Buffer(buffer));
console.info("HashMD5Buffer:", oCrytoJS.HashMD5Buffer(buffer));
console.info("hashMd5String:", oCrytoJS.HashMD5String("BẮT ĐẦU THỰC HIỆN"));
console.info("HashSHA1String:", oCrytoJS.HashSHA1String("BẮT ĐẦU THỰC HIỆN"));
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
         if (file.isFile() && file.name.endsWith(".env")) {
            fs.readFile(file.name, "utf8", (err, data) => {
               console.log(data);
            });
         }
         // Do whatever you want to do with the file
         if (file.isFile() === true && file.name.endsWith(".libraryfile.json")) {
            fs.readFile(file.name, "utf8", (err, data) => {
               if (err) {
                  console.error(err);
                  return;
               } else if (data) {
                  let objFile = JSON.parse(data);
                  console.log(objFile);

                  var url = "https://api.github.com/repos/oth-dhghospital/oLibraries/contents/OTH.TestBuildEvent.dll";
                  oAxios.GetData({ url: url, GithubToken: process.env.O6S220125GMAILCOM_GITHUBTOKEN }).then((data) => {
                     const { content, encoding } = data;
                     if (encoding === "base64" && content.length > 0) {
                        let buffer = Buffer.from(content, "base64");
                        let md5Buffer = oCrytoJS.HashMD5Buffer(buffer);
                        let compare = md5Buffer === objFile.FileHashMD5.toUpperCase();
                        console.log("compare:", compare);
                        console.log("md5Buffer:", md5Buffer);
                        console.log("FileHashMD5:", objFile.FileHashMD5);
                        if (compare === true) {
                           console.log(buffer);
                           fs.writeFile("OTH.TestBuildEvent.dll", buffer, (err) => {
                              if (err) throw err;
                           });
                        }
                     }
                  });
               }
            });
         }
      });
   }
);
