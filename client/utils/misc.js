function getCsrfToken() {
  return document.querySelector('#_token').value;
}

function getCsrfPostHeader() {
  return { headers: { 'csrf-token' : getCsrfToken() } };
}

module.exports = {
  getCsrfToken,
  getCsrfPostHeader,
};