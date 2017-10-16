const moment = require('moment');

//accepts date in form YYYY-MM-DD and and determines the next occurrence
function getNextDateDifference(nextDate, targetDate) {
  const currentDateUnix = moment(moment().format("MM-DD"));
  const targetDateUnix = moment(targetDate.substring(4));
  const currentYear = moment().format("YYYY");
  
  if (currentDateUnix.unix() > targetDateUnix.unix()) { //if today is past the target date
    return `${currentYear + 1}-${currentDateUnix}`;
  } else {
    return `${currentYear}-${currentDateUnix}`;
  }
}

module.exports = {
  getNextDateDifference,
};