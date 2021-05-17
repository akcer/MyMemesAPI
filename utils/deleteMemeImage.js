const fs = require('fs');
const path = require('path');

const deleteMemeImage  = (imageId) => {
  const imagePath = path.join(__dirname, '../uploads/memes/', imageId);
  fs.unlink(imagePath, (err) => {
    if (err) throw err;
  });
};
module.exports = deleteMemeImage ;
