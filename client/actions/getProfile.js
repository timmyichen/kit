const axios = require('axios');

function getProfile(username) {
  return new Promise((resolve, reject) => {
    axios.get(`/api/user/profile/${username}`)
      .then(res => {
        if (res.data.error) {
          resolve(null);
        } else {
          resolve(res.data);
        }
      })
      .catch(err => {
        reject(`ERROR getting profile for ${username}: ${err}`);
      });
  });
}

export default getProfile;