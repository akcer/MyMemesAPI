const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, 'Username is required'],
      minlength: [3, 'Username must be min 3 characters long'],
      maxlength: [30, 'Username must be max 30 characters long'],
      validate: {
        validator: function (v) {
          return this.model('User')
            .findOne({ user: v })
            .then((user) => !user);
        },
        message: 'Username is already used by another user',
      },
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be min 6 characters long'],
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required'],
      match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Invalid email format'],
      validate: {
        validator: function (v) {
          return this.model('User')
            .findOne({ email: v })
            .then((email) => !email);
        },
        message: 'Email is already used by another user',
      },
    },
    avatar: {
      type: String,
      required: [true, 'Avatar is required'],
      default: 'default-avatar.png',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    user.verify = hash;
    next();
  });
});

const User = mongoose.model('User', userSchema);
module.exports = User;


