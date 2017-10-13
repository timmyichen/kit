const axios = require('axios');

function getPendingRequests() {
  return new Promise((resolve, reject) => {
    axios.get('/api/user/pending-requests')
      .then(res => {
        if (res.data.error) {
          resolve(null);
        } else {
          resolve(res.data);
        }
      })
      .catch(err => {
        reject(`ERROR getting pending requests: ${err}`);
      });
  });
}

export default getPendingRequests;