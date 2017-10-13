const axios = require('axios');

function getUser() {
  return new Promise((resolve, reject) => {
    axios.get('/api/current_user')
      .then(res => {
        if (res.data.error) {
          resolve(null);
        } else {
          resolve(res.data);
        }
      })
      .catch(err => {
        reject(`ERROR getting current user: ${err}`);
      });
  });
}

export default getUser;