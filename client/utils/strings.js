function pluralize(number, string) {
  if (number === 0) {
    return `${number} ${string}`;
  } else {
    return `${number} ${string}s`;
  }
}

module.exports = {
  pluralize,
};