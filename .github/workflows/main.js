//requiring path and fs modules
const path = require("path");
const fs = require("fs");
var axios = require("axios");
var CryptoJS = require("crypto-js");
const core = require("@actions/core");
const github = require("@actions/github");
const { url } = require("inspector");

var oAxios = (() => {
   const checkConfig = (paraConfig) => {
      var { auth, data, GithubToken } = paraConfig;
      if (typeof GithubToken === "string" && GithubToken !== "") {
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
   const fetchByConfig = (config) => {
      console.log(config);
      return axios(checkConfig(config))
         .then((res) => Promise.resolve(res.data))
         .catch((err) => Promise.reject(err));
   };
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
      PostData: (paraConfig) => {
         return fetchByConfig({
            ...paraConfig,
            method: "POST",
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
var oUtils = (() => {
   const CreateAuthorization = (basicToken, access_token) => {
      if (typeof basicToken === "string" && basicToken.length > 0) return "Basic " + Buffer.from(":" + basicToken).toString("base64");
      else return `Bearer ${access_token}`;
   };
   return {
      GetValueProperty: (obj, field, defaultValue = undefined) => {
         let existsField = Object.keys(obj).find((key) => key.toLowerCase() === field.toLowerCase());
         if (typeof existsField !== "undefined") return obj[existsField];
         else return defaultValue;
      },
      CreateAuthorization: CreateAuthorization,
      CreateFetchHeaders: (basicToken, access_token) => {
         return {
            Authorization: CreateAuthorization(basicToken, access_token),
         };
      },
   };
})();

class Executer {
   static LoadoExecuter = () => {
      return new Executer();
   };
   constructor() {
      this.__dirname = __dirname;
      this.__filename = __filename;
      this.env = process.env;
      this.Config = {};
      this.LoadConfig();
   }
   LoadConfig() {
      let executeFileName = path.parse(this.__filename).name;
      let executePathDirectory = path.dirname(this.__filename);
      let files = fs.readdirSync(executePathDirectory);
      for (var i = 0; i < files.length; i++) {
         let file = files[i].toLowerCase();
         if (files[i].startsWith(executeFileName.toLowerCase()) && files[i].endsWith(".action.config.json")) {
            this.Config = JSON.parse(fs.readFileSync(path.join(executePathDirectory, files[i])).toString());
            if (!("GITHUBSECRETS" in this.Config)) {
               this.Config["GITHUBSECRETS"] = {};
               let keys = Object.keys(process.env);
               for (let i = 0; i < keys.length; i++) {
                  let key = keys[i];
                  if (key.startsWith("OENV_")) {
                     this.Config["GITHUBSECRETS"][key] = process.env[key];
                  }
               }
            }
            return this.Config;
            break;
         }
      }
      return {};
   }
}
class Azure {
   static Create(azureObjectOrJson) {
      return new Azure(azureObjectOrJson);
   }
   constructor(azureObjectOrJson) {
      if (typeof azureObjectOrJson === "string" && azureObjectOrJson.length > 0) {
         azureObjectOrJson = JSON.parse(azureObjectOrJson);
      }
      ["Owner", "Project", "Repo", "Token"].forEach((field) => {
         this[field] = oUtils.GetValueProperty(azureObjectOrJson, field, "");
      });
      if (this.Project === "") this.Project = this.Repo;
      if (this.Repo === "") this.Repo = this.Project;
   }
   async GitCommitBase64s(uploadItems, comment = "") {
      try {
         comment = `${process.env.GITHUB_REPOSITORY};${comment}`;
         let headers = oUtils.CreateFetchHeaders(this.Token, "");
         const baseUrl = () => "https://dev.azure.com/" + this.Owner + "/" + this.Project + "/_apis/git/repositories/" + this.Repo + "/";
         const createUrl = (actionPath) =>
            `${baseUrl()}${("/" + actionPath + "/")
               .split("/")
               .filter((el) => el !== "" && el !== "$")
               .join("/")}`;
         const fetchData = async (url, method = "GET", data = undefined) => {
            try {
               return await oAxios.Fetch({ url: url, headers: headers, method: method, data: data });
            } catch (error) {
               throw error;
            }
         };
         const getOldCommit = async () => {
            try {
               let data = await fetchData(createUrl(`refs?api-version=5.1`));
               return {
                  name: data.value[0].name,
                  oldObjectId: data.value[0].objectId,
               };
            } catch (error) {
               return {
                  name: "refs/heads/main",
                  oldObjectId: "0000000000000000000000000000000000000000",
               };
            }
         };
         const getChangeTypeItem = async (pathGit) => {
            try {
               let data = await fetchData(createUrl(`items?api-version=5.1&$format=json&path=${pathGit}`));
               if ("objectId" in data) return "edit";
               return "add";
            } catch (error) {
               return "add";
            }
         };
         let bodyPush = {
            refUpdates: [await getOldCommit()],
         };
         let commit = { comment: comment, changes: [] };
         for (let i = 0; i < uploadItems.length; i++) {
            let uploadItem = uploadItems[i];
            let pathGit = oUtils.GetValueProperty(uploadItem, "PathGit", "");
            commit.changes.push({
               changeType: await getChangeTypeItem(pathGit),
               item: {
                  path: pathGit,
               },
               newContent: {
                  content: oUtils.GetValueProperty(uploadItem, "Base64", ""),
                  contentType: "base64encoded",
               },
            });
         }
         bodyPush.commits = [commit];
         return await fetchData(createUrl(`pushes?api-version=5.1`), "POST", bodyPush);
      } catch (error) {
         throw error;
      }
   }
}
// let oAz = Azure.Create(JSON.stringify({ Owner: "o6s220126", Project: "test.privategit", token: "t5a7lxtxttf565tafs4qthbkex4jqsoolgnliieyixka6pidsxfa" }));
// (async () => {
//    console.log(
//       JSON.stringify(
//          await oAz.GitCommitBase64s(
//             [
//                {
//                   pathGit: "/thu/thu1.txt",
//                   base64: "VGjhu60gaMOgbmc=",
//                },
//                {
//                   pathGit: "/README.md",
//                   base64: "VGjhu60gaMOgbmc=",
//                },
//             ],
//             "thử commane"
//          )
//       )
//    );
// })();
// return;
const oExecuter = Executer.LoadoExecuter();
console.log(oExecuter);
var crytoVar = "BẮT ĐẦU THỰC HIỆN";
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

                  let githubToken = oCrytoJS.AESDecryptString(oExecuter.Config.MainLibraryRepo.GithubToken, oExecuter.Config.GITHUBSECRETS.OENV_AESPASSPHRASE);
                  let oAz = Azure.Create(JSON.stringify({ Owner: "o6s220126", Project: "test.privategit", token: "t5a7lxtxttf565tafs4qthbkex4jqsoolgnliieyixka6pidsxfa" }));
                  oAxios.GetData({ url: url, GithubToken: githubToken }).then((data) => {
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
                           oAz.GitCommitBase64s([{ pathGit: "/OTH.TestBuildEvent.dll", base64: content }], "tranfers to Az");
                        }
                     }
                  });
               }
            });
         }
      });
   }
);
