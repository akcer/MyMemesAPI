const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const multerConfig = require('../utils/multerConfig.js');
const upload = multerConfig('avatars');
const passport = require('../utils/authentication');
const deleteUserAvatar = require('../utils/deleteUserAvatar');

router.get('/', (req, res, next) => {
  User.find().exec((err, users) => {
    if (err) {
      return next(err);
    }
    res.json(users);
  });
});

router.get('/user/:user', (req, res, next) => {
  User.findOne(
    { username: req.params.user },
    'avatar role username createdAt'
  ).exec((err, user) => {
    if (err) {
      return next(err);
    }
    res.json(user);
  });
});

router.get('/authenticate', (req, res, next) => {

  if (!req.user) { 
    return res.json({ avatar: null, role: null, username: null });
  }
  User.findById(req.user._id, 'avatar role username createdAt').exec(
    (err, user) => {
      if (err) {
        return next(err);
      }
      res.json(user);
    }
  );
});

router.post(
  '/login/local',
  passport.authenticate('local'),
  (req, res, next) => {
    res.json(req.user);
  }
);

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.json('logout success')
  });
});

router.post('/register', upload.single('avatarFile'), (req, res, next) => {
  if (!req.file) {
    throw new Error('Avatar Is Required');
  }
  if (req.password !== req.confirmPassword) {
    throw new Error('Password confirmation does not match password');
  }

  User.create({
    avatar: req.file.filename,
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  })
    .then((response) => {
      res.json({
        success: true,
        message: 'Added successfully.',
        response: response,
      });
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  User.findById(req.params.id).exec((err, user) => {
    if (err) return next(err);
    if (
      !(req.user.role === 'admin' || String(req.user._id) === String(user._id))
    ) {
      next(new Error("You aren't allowed to delete this user"));
    }

    User.findByIdAndUpdate(req.params.id, {
      username: 'Account removed',
      avatar: 'default-avatar.png',
      password: null,
      email: null,
    }).exec((err, user) => {
      if (err) return next(err);
      //remove Avatar
      deleteUserAvatar(user.avatar);
      //Logout
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('connect.sid');
        res.send('logout success');
      });
      res.json({
        succes: true,
        message: 'User deleted.',
      });
    });
  });
});

module.exports = router;
