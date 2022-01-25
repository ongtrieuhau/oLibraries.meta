var axios = require("axios");
var oAxios = (function () {
   const baseConfig = (method = "GET", url = "", data = undefined, auth = "", headers = undefined) => {
      let resultConfig = {
         method: method,
         url: url,
         headers: headers,
         maxContentLength: Infinity,
         maxBodyLength: Infinity,
         // validateStatus: function (status) {
         //    return status < 500; // Resolve only if the status code is less than 500
         // },
      };
      //Xử lý headers
      if (typeof resultConfig.headers === "undefined") resultConfig.headers = {};
      if (!("content-type" in resultConfig.headers)) resultConfig.headers["content-type"] = "application/json";
      if ((url + "").toLowerCase().startsWith("https://api.heroku.com") === true) {
         resultConfig.headers.Accept = "application/vnd.heroku+json; version=3";
      }
      //Xử lý Authorization
      if (typeof auth === "string" && auth !== "") resultConfig.headers.Authorization = auth;
      //Xử lý body
      if (typeof data === "object") resultConfig.data = data;
      if (typeof data === "string" && data + "" !== "") resultConfig.data = JSON.stringify(data);

      return resultConfig;
   };
   const baseFetchByConfig = (config) => {
      return axios(config)
         .then((res) => Promise.resolve(res.data))
         .catch((err) => Promise.reject(err));
   };
   const baseFetch = (method = "GET", url = "", data = undefined, auth = "", headers = undefined) => {
      return baseFetchByConfig(baseConfig(method, url, data, auth, headers));
   };
   return {
      config: baseConfig.bind(null),
      configGET: baseConfig.bind(null, "GET"),
      configPOST: baseConfig.bind(null, "POST"),
      configPATCH: baseConfig.bind(null, "PATCH"),
      configPUT: baseConfig.bind(null, "PUT"),
      fetchDataByConfig: baseFetchByConfig.bind(null),
      fetchData: baseFetch.bind(null),
      getData: baseFetch.bind(null, "GET"),
      postData: baseFetch.bind(null, "POST"),
      patchData: baseFetch.bind(null, "PATCH"),
      putData: baseFetch.bind(null, "PUT"),
   };
})();
module.exports = oAxios;
