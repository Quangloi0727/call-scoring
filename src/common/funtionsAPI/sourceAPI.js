const axios = require('axios');
module.exports = {

  requestSource: async function (data, config) {
    return new Promise(async (resolve, reject) => {
      var _data = JSON.stringify(data);
      if (data) config.data = _data
      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          resolve(response.data)
        })
        .catch(function (error) {
          console.log(error);
          reject(error)
        });
    })
  }

}