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
   const toComparePath = (path) => (path + "").toLowerCase().replaceAll("/", "|").replaceAll("\\", "|");
   const continueAddPath = (excludePaths = [], path = "") => {
      let iFind = excludePaths.findIndex((el) => toComparePath(path).includes(toComparePath(el)));
      if (iFind > -1) return 0;
      else {
         if (fs.statSync(path).isFile()) return 1;
         else {
            let iFind2 = excludePaths.findIndex((el) => toComparePath(path + "/").includes(toComparePath(el)));
            if (iFind2 === -1) return 2;
            return 0;
         }
      }
   };
   const GetAllFiles = function (dirPath, arrayOfFiles, excludePaths = []) {
      files = fs.readdirSync(dirPath);
      arrayOfFiles = arrayOfFiles || [];
      files.forEach(function (file) {
         let curPath = dirPath + "/" + file;
         let isContinueAdd = continueAddPath(excludePaths, curPath);
         if (isContinueAdd === 1) {
            arrayOfFiles.push(path.join(dirPath, "/", file));
         } else if (isContinueAdd === 2) {
            arrayOfFiles = GetAllFiles(dirPath + "/" + file, arrayOfFiles, excludePaths);
         }
      });

      return arrayOfFiles;
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
      GetAllFiles: GetAllFiles,
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
                     if (key === "OENV_GITHUB_EVENT") {
                        try {
                           this.Config["GITHUBSECRETS"][key] = JSON.parse(process.env[key]);
                        } catch {}
                     }
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
   static Create(azureObjectOrJson, passphare = undefined) {
      let az = new Azure(azureObjectOrJson);
      if (typeof passphare === "string" && passphare.length > 0) az.AESDecryptForce(passphare);
      return az;
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
   async TfvcCommitBase64s(uploadItems, comment = "") {
      try {
         let headers = oUtils.CreateFetchHeaders(this.Token, "");
         const resolvePathGit = (pathGit) => {
            try {
               let result = "/" + pathGit + "/";
               let itemSplit = result.split("/").filter((el, i, els) => {
                  return el !== "" && el !== "$";
               });
               result = "$/" + this.Project + "/" + itemSplit.join("/");
               return result;
            } catch (error) {
               throw error;
            }
         };
         const createUrl = (actionPath) => {
            if ((actionPath + "").startsWith("/")) actionPath = actionPath.substring(1);
            return `https://dev.azure.com/${this.Owner}/${this.Project}/_apis/tfvc/${actionPath}`;
         };
         const fetchData = async (url, method = "GET", data = undefined) => {
            try {
               return await oAxios.Fetch({ url: url, headers: headers, method: method, data: data });
            } catch (error) {
               throw error;
            }
         };
         const getItemVersion = async (pathGit) => {
            try {
               let data = await fetchData(createUrl(`items?api-version=5.0&$format=json&path=${resolvePathGit(pathGit)}`));
               return oUtils.GetValueProperty(data, "version", "");
            } catch (error) {
               return "";
            }
         };
         let body = {
            comment: comment,
            changes: [],
         };
         for (let i = 0; i < uploadItems.length; i++) {
            let uploadItem = uploadItems[i];
            let pathGit = oUtils.GetValueProperty(uploadItem, "PathGit", "");
            let itemVersion = await getItemVersion(pathGit);
            let change = {
               item: {
                  path: resolvePathGit(pathGit),
                  contentMetadata: {
                     encoding: 65001,
                  },
                  version: itemVersion === "" ? undefined : itemVersion,
               },
               changeType: itemVersion === "" ? "add" : "edit",
               newContent: {
                  content: oUtils.GetValueProperty(uploadItem, "Base64", ""),
                  contentType: "base64Encoded",
               },
            };
            body.changes.push(change);
         }
         return await fetchData(createUrl(`changesets?api-version=5.1&$format=json`), "POST", body);
      } catch (error) {
         console.error(error.message);
         throw error;
      }
   }
   AESDecryptForce(passphare) {
      try {
         this.Token = oCrytoJS.AESDecryptString(this.Token, passphare);
      } catch {}
   }
}
class GitHub {
   static Create(githubObjectOrJson, passphare = undefined) {
      let github = new GitHub(githubObjectOrJson);
      if (typeof passphare === "string" && passphare.length > 0) github.AESDecryptForce(passphare);
      return github;
   }
   constructor(githubObjectOrJson) {
      if (typeof githubObjectOrJson === "string" && githubObjectOrJson.length > 0) {
         githubObjectOrJson = JSON.parse(githubObjectOrJson);
      }
      ["Owner", "Project", "Repo", "Token"].forEach((field) => {
         this[field] = oUtils.GetValueProperty(githubObjectOrJson, field, "");
      });
      if (this.Project === "") this.Project = this.Repo;
      if (this.Repo === "") this.Repo = this.Project;
   }
   async DownloadBlobs(pathGit) {
      try {
         let headers = oUtils.CreateFetchHeaders(this.Token, "");
         const createUrl = (actionPath) => {
            if ((actionPath + "").startsWith("/")) actionPath = actionPath.substring(1);
            return `https://api.github.com/repos/${this.Owner}/${this.Repo}/${actionPath}`;
         };
         const fetchData = async (url, method = "GET", data = undefined) => {
            try {
               return await oAxios.Fetch({ url: url, headers: headers, method: method, data: data });
            } catch (error) {
               throw error;
            }
         };
         const getLastShaPathFile = async (pathGit) => {
            try {
               let commits = await fetchData(createUrl(`commits?path=${pathGit}&page=1&per_page=1`));
               if (typeof commits[0] !== "undefined" && "url" in commits[0]) {
                  let commit = await fetchData(commits[0]["url"]);
                  if ("files" in commit) {
                     var exists = commit.files.find((file) => pathGit.endsWith(file.filename));
                     if (typeof exists !== "undefined") return oUtils.GetValueProperty(exists, "sha", "");
                  }
               }
               return "";
            } catch (error) {
               throw error;
            }
         };
         const getBlobsBySha = async (pathGit) => {
            try {
               let sha = await getLastShaPathFile(pathGit);
               if (typeof sha === "string" && sha.length > 0) {
                  return await fetchData(createUrl(`git/blobs/${sha}`));
               }
               return undefined;
            } catch (error) {
               throw error;
            }
         };
         return await getBlobsBySha(pathGit);
      } catch (error) {
         throw error;
      }
   }
   AESDecryptForce(passphare) {
      try {
         this.Token = oCrytoJS.AESDecryptString(this.Token, passphare);
      } catch (error) {}
   }
}
(async () => {
   let oAz = Azure.Create({ Owner: "o6s220126", Repo: "me.privatetfvc", Token: "t5a7lxtxttf565tafs4qthbkex4jqsoolgnliieyixka6pidsxfa" });
   let uploadItem = { PathGit: "/thuhang.txt", base64: "VGjhu60gaMOgbmc=" };
   let uploadItem1 = { PathGit: "/thuhang1.txt", base64: "VGjhu60gaMOgbmc=" };
   console.log(await oAz.TfvcCommitBase64s([uploadItem, uploadItem1], "Thử hàng"));
})();
return;
const oExecuter = Executer.LoadoExecuter();
const JSONConfig = oExecuter.Config;
if (JSONConfig.IsShowConfig) console.log(oExecuter);
var crytoVar = "BẮT ĐẦU THỰC HIỆN";
(async () => {
   try {
      const directoryPath = path.dirname(path.dirname(__filename));
      const prefix = ".libraryfile.json";
      var pathFiles = oUtils.GetAllFiles(directoryPath, [], [...JSONConfig.ExcludeDirectoryPaths, ...JSONConfig.ExcludeFilePaths]);
      pathFiles = pathFiles.filter((pathFile) => pathFile.endsWith(prefix));
      let oGithub = GitHub.Create(JSONConfig.FromRepo, JSONConfig.GITHUBSECRETS.OENV_AESPASSPHRASE);
      const createCommitComment = (objLibraryFile) => {
         return ["OriginalFilename", "AssemblyFullName", "FileHashMD5", "FileHashSHA1", "IsExe", "FileTime.CreationTime"].reduce(
            (result, el, i, arr) => {
               if (el.includes(".")) {
                  var split = el.split(".");
                  result[split[1]] = objLibraryFile[split[0]][split[1]];
               } else {
                  result[el] = objLibraryFile[el];
               }
               return result;
            },
            { CommitMessage: JSONConfig.GITHUBSECRETS.OENV_COMMITMESSAGE, GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY }
         );
      };
      const checkToJSONConfig = (field) => {
         let isContinue = oUtils.GetValueProperty(JSONConfig, `Is${field}`, false);
         if (isContinue) isContinue = field in JSONConfig;
         if (isContinue) isContinue = Array.isArray(JSONConfig[field]);
         if (isContinue) isContinue = JSONConfig[field].length > 0;
         return isContinue;
      };
      for (let i = 0; i < pathFiles.length; i++) {
         let curFile = pathFiles[i];
         const objFile = JSON.parse(fs.readFileSync(curFile, "utf8"));
         let curPathGit = curFile.replaceAll(directoryPath, "").replaceAll("\\", "/").replaceAll(prefix, "");
         var getBlobs = await oGithub.DownloadBlobs(curPathGit);
         const { content, encoding } = getBlobs || {};
         let checkMd5Blobs = false;
         if (encoding === "base64" && content.length > 0) {
            let buffer = Buffer.from(content, "base64");
            checkMd5Blobs = oCrytoJS.HashMD5Buffer(buffer) === objFile.FileHashMD5.toUpperCase();
            if (checkMd5Blobs === true) {
               let uploadNameFiles = [curPathGit, objFile.FileHashMD5, objFile.FileHashSHA1, objFile.AssemblyFullName, objFile.AssemblyFullNameMD5, objFile.AssemblyFullNameSHA1];
               for (let k = 0; k < uploadNameFiles.length; k++) {
                  let uploadNameFile = uploadNameFiles[k];
                  //ToAzureGits
                  if (checkToJSONConfig("ToAzureGits") === true) {
                     for (let j = 0; j < JSONConfig.ToAzureGits.length; j++) {
                        let oAzureGit = Azure.Create(JSONConfig.ToAzureGits[j], JSONConfig.GITHUBSECRETS.OENV_AESPASSPHRASE);
                        let uploadItems = [{ pathGit: uploadNameFile, base64: content }];
                        try {
                           let commit = await oAzureGit.GitCommitBase64s(uploadItems, JSON.stringify(createCommitComment(objFile)));
                           console.log({ curFile, curPathGit, encoding, checkMd5Blobs, uploadNameFile, commitUrl: commit.url });
                        } catch (error) {
                           console.error(error);
                        }
                     }
                  }
               }
            }
         }
      }
   } catch (error) {
      console.error(error);
   }
})();
return;
