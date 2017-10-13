const axios = require('axios');

function getMyInfos() {
  return new Promise((resolve, reject) => {
    axios.get('/api/my-info')
      .then(res => {
        if (res.data.error) {
          resolve(null);
        } else {
          resolve(res.data);
        }
      })
      .catch(err => {
        reject(`ERROR getting contact info: ${err}`);
      });
  });
}

export default getMyInfos;