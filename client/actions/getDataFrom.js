const axios = require('axios');

function getDataFrom(apiRoute) {
  return new Promise((resolve, reject) => {
    axios.get(apiRoute)
      .then(res => {
        if (res.data.error) {
          resolve(null);
        } else {
          resolve(res.data);
        }
      })
      .catch(err => {
        reject(`ERROR getting info from ${apiRoute}: ${err}`);
      });
  });
}

module.exports = { getDataFrom };