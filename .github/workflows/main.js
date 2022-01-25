//requiring path and fs modules
const path = require("path");
const fs = require("fs");
var axios = require("axios");

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
   };
})();
let urlFB = "https://ohau21ngrok0406-goauth2-default-rtdb.firebaseio.com/0EditTime.json?auth=kL2ehbr32dbpaRmLHwjRR13uXyg1rdalJxCpuL51";
let urlGithub = "https://github.com/o-ngtrieuhau861gmailcom/oLibraries.meta/blob/main/OTH.TestBuildEvent.dll.libraryfile.json?raw=true";
oAxios.Fetch({ url: urlGithub, responseType: "arraybuffer" }).then((data) => {
   console.log(data);
   console.log(data.toString("utf8"));
});
// var oAxios1 = (function () {
//    const baseConfig = (method = "GET", url = "", data = undefined, auth = "", headers = undefined, auth, responseType = undefined) => {
//       let resultConfig = {
//          method: method,
//          url: url,
//          headers: headers,
//          maxContentLength: Infinity,
//          maxBodyLength: Infinity,
//          // validateStatus: function (status) {
//          //    return status < 500; // Resolve only if the status code is less than 500
//          // },
//       };

//       //Xử lý headers
//       if (typeof resultConfig.headers === "undefined") resultConfig.headers = {};
//       if (!("content-type" in resultConfig.headers)) resultConfig.headers["content-type"] = "application/json";
//       if ((url + "").toLowerCase().startsWith("https://api.heroku.com") === true) {
//          resultConfig.headers.Accept = "application/vnd.heroku+json; version=3";
//       }
//       //Xử lý Authorization
//       if (typeof auth === "string" && auth !== "") resultConfig.headers.Authorization = auth;
//       //Xử lý body
//       if (typeof data === "object") resultConfig.data = data;
//       if (typeof data === "string" && data + "" !== "") resultConfig.data = JSON.stringify(data);
//       if (typeof responseType !== undefined) resultConfig.responseType = responseType;
//       return resultConfig;
//    };
//    const baseFetchByConfig = (config) => {
//       return axios(config)
//          .then((res) => Promise.resolve(res.data))
//          .catch((err) => Promise.reject(err));
//    };
//    const baseFetch = (method = "GET", url = "", data = undefined, auth = "", headers = undefined, responseType = undefined) => {
//       return baseFetchByConfig(baseConfig(method, url, data, auth, headers, responseType));
//    };
//    return {
//       config: baseConfig.bind(null),
//       configGET: baseConfig.bind(null, "GET"),
//       configPOST: baseConfig.bind(null, "POST"),
//       configPATCH: baseConfig.bind(null, "PATCH"),
//       configPUT: baseConfig.bind(null, "PUT"),
//       fetchDataByConfig: baseFetchByConfig.bind(null),
//       fetchData: baseFetch.bind(null),
//       getData: baseFetch.bind(null, "GET"),
//       postData: baseFetch.bind(null, "POST"),
//       patchData: baseFetch.bind(null, "PATCH"),
//       putData: baseFetch.bind(null, "PUT"),
//    };
// })();
// oAxios.getData("https://ohau21ngrok0406-goauth2-default-rtdb.firebaseio.com/0EditTime.json?auth=kL2ehbr32dbpaRmLHwjRR13uXyg1rdalJxCpuL51").then((data) => console.log(data));
console.info("BẮT ĐẦU THỰC HIỆN");
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
                  var url = "https://github.com/o-ngtrieuhau861gmailcom/oLibraries.meta/blob/main/OTH.TestBuildEvent.dll.libraryfile.json?raw=true";
                  // oAxios.getData(url, (responseType = "arraybuffer")).then((data) => {
                  //    console.log(data);
                  // });
               }
            });
         }
      });
   }
);
