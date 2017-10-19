function pluralize(number, string) {
  if (number === 1) {
    return `${number} ${string}`;
  } else {
    return `${number} ${string}s`;
  }
}

module.exports = {
  pluralize,
};