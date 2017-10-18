const moment = require('moment');

//accepts date in form YYYY-MM-DD and and determines the next occurrence
function getNextDate(targetDate) {
  const target = new Date(targetDate);
  const now = new Date();
  const targetMonth = target.getMonth();
  const targetDay = target.getDate();
  const nowMonth = now.getMonth();
  const nowDate = now.getDate();
  let year = now.getFullYear();
  
  if (targetMonth < nowMonth || (targetMonth === nowMonth && targetDate < nowDate)) {
    year = now.getFullYear() + 1;
  }
  
  const nextDate = moment(`${year}-${targetMonth+1}-${targetDay}`, "YYYY-MM-DD").unix()*1000;
  return nextDate;
}

function getDateDifference(targetDate, formatted=false) {
  const diff = {};
  const target = new Date(targetDate);
  const now = new Date();
  diff.years = target.getFullYear() - now.getFullYear();
  diff.months = target.getMonth() - now.getMonth() + diff.years * 12;
  diff.days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
  return diff;
}

module.exports = {
  getNextDate,
  getDateDifference,
};