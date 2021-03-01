const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
  const addZeroes = (time) => time < 10 ? '0' + time : time;
  const time = new Date();
  const hour = addZeroes(time.getHours());
  const minutes = addZeroes(time.getMinutes());
  const seconds = addZeroes(time.getSeconds());

  const mainTime = `${hour}:${minutes}:${seconds}`;

  const info = `${mainTime}, method: ${req.method}, url: ${req.url}`;

  console.log(info);
  fs.appendFile(path.join(__dirname, '..', 'log.log'), info + '\n', () => {});
  next();
};
