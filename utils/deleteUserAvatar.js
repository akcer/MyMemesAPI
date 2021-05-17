const fs = require('fs');
const path = require('path');

const deleteUserAvatar  = (userAvatarId) => {
  const imagePath = path.join(__dirname, '../uploads/avatars/', userAvatarId);
  fs.unlink(imagePath, (err) => {
    if (err) throw err;
  });
};
module.exports = deleteUserAvatar ;
