const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Meme = require('../models/meme.js');
const multerConfig = require('../utils/multerConfig.js');
const upload = multerConfig('memes');
const deleteMemeImage = require('../utils/deleteMemeImage');

router.get('/', (req, res, next) => {
  let sort = '';
  switch (req.query.sort) {
    case 'newest':
      sort = '-createdAt';
      break;
    case 'oldest':
      sort = 'createdAt';
      break;
    case 'top':
      sort = '-likes.likesCount -createdAt';
      break;
    default:
      sort = '-createdAt';
  }
  Meme.find()
    .populate('author', 'username')
    .sort(sort)
    .skip(parseInt(req.query.skip, 10))
    .limit(parseInt(req.query.limit, 10))
    .exec((err, memes) => {
      if (err) return next(err);
      res.json(memes);
    });
});

router.get('/meme/:id', (req, res, next) => {
  Meme.findById(req.params.id)
    .populate('author', 'username')
    .exec((err, meme) => {
      if (err) return next(err);
      res.json(meme);
    });
});

router.get('/random', (req, res, next) => {
  Meme.aggregate()
    .sample(1)
    .lookup({
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
    })
    .unwind('author')
    .project({
      author: '$author.username',
      text: 1,
      image: 1,
      topTitle: 1,
      bottomTitle: 1,
      comments: 1,
      likes: 1,
      dislikes: 1,
      createdAt: 1,
    })
    .exec((err, meme) => {
      if (err) return next(err);
      res.json(meme[0]);
    });
});

router.get('/count', (req, res, next) => {
  Meme.countDocuments().exec((err, count) => {
    if (err) return next(err);
    res.json(count);
  });
});

router.post('/add', upload.single('imageFile'), (req, res, next) => {
  if (!req.file) {
    throw new Error('Image Is Required');
  }
  Meme.create({
    image: req.file.filename,
    author: req.user._id,
    comments: [],
    ...req.body,
  })
    .then((response) => {
      res.json({
        succes: true,
        message: 'Meme added successfully.',
        response: response,
      });
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  Meme.findById(req.params.id).exec((err, meme) => {
    if (err) return next(err);
    if (
      !(
        req.user.role === 'admin' ||
        String(req.user._id) === String(meme.author)
      )
    ) {
      next(new Error("You aren't allowed to delete this meme"));
    }
    Meme.findByIdAndDelete(req.params.id).exec((err, meme) => {
      if (err) return next(err);
      deleteMemeImage(meme.image);
      res.json({
        succes: true,
        message: 'Meme deleted.',
      });
    });
  });
});

//LIKE
router.patch('/like/:id', (req, res, next) => {
  //if meme previously was disliked remove dislike
  Meme.findOneAndUpdate(
    {
      _id: req.params.id,
      'likes.likes': {
        $ne: mongoose.Types.ObjectId(req.user._id),
      },
      'dislikes.dislikes': {
        $in: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $inc: { 'dislikes.dislikesCount': -1 },
      $pull: { 'dislikes.dislikes': mongoose.Types.ObjectId(req.user._id) },
    },

    { new: true }
  ).exec((err, meme) => {
    if (err) return next(err);
    if (meme) {
      res.json({
        likes: meme.likes.likesCount,
        dislikes: meme.dislikes.dislikesCount,
      });
    }
    if (meme === null) {
      //If meme was nor liked nor disliked give like
      Meme.findOneAndUpdate(
        {
          _id: req.params.id,
          'likes.likes': {
            $ne: mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $inc: { 'likes.likesCount': 1 },
          $push: { 'likes.likes': mongoose.Types.ObjectId(req.user._id) },
        },

        { new: true }
      ).exec((err, meme) => {
        if (err) return next(err);
        if (meme) {
          res.json({
            likes: meme.likes.likesCount,
            dislikes: meme.dislikes.dislikesCount,
          });
        }
        if (meme === null) {
          //If meme was previously liked remove like
          Meme.findOneAndUpdate(
            {
              _id: req.params.id,
            },
            {
              $inc: { 'likes.likesCount': -1 },
              $pull: { 'likes.likes': mongoose.Types.ObjectId(req.user._id) },
            },

            { new: true }
          ).exec((err, meme) => {
            if (err) return next(err);
            if (meme) {
              res.json({
                likes: meme.likes.likesCount,
                dislikes: meme.dislikes.dislikesCount,
              });
            }
          });
        }
      });
    }
  });
});
//DISLIKE
router.patch('/dislike/:id', (req, res, next) => {
  //if meme previously was liked remove like
  Meme.findOneAndUpdate(
    {
      _id: req.params.id,
      'dislikes.dislikes': {
        $ne: mongoose.Types.ObjectId(req.user._id),
      },
      'likes.likes': {
        $in: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $inc: { 'likes.likesCount': -1 },
      $pull: { 'likes.likes': mongoose.Types.ObjectId(req.user._id) },
    },

    { new: true }
  ).exec((err, meme) => {
    if (err) return next(err);
    if (meme) {
      res.json({
        likes: meme.likes.likesCount,
        dislikes: meme.dislikes.dislikesCount,
      });
    }
    if (meme === null) {
      //If meme was nor disliked nor liked give dislike
      Meme.findOneAndUpdate(
        {
          _id: req.params.id,
          'dislikes.dislikes': {
            $ne: mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $inc: { 'dislikes.dislikesCount': 1 },
          $push: { 'dislikes.dislikes': mongoose.Types.ObjectId(req.user._id) },
        },

        { new: true }
      ).exec((err, meme) => {
        if (err) return next(err);
        if (meme) {
          res.json({
            likes: meme.likes.likesCount,
            dislikes: meme.dislikes.dislikesCount,
          });
        }
        if (meme === null) {
          //If meme was previously disliked remove dislike
          Meme.findOneAndUpdate(
            {
              _id: req.params.id,
            },
            {
              $inc: { 'dislikes.dislikesCount': -1 },
              $pull: {
                'dislikes.dislikes': mongoose.Types.ObjectId(req.user._id),
              },
            },

            { new: true }
          ).exec((err, meme) => {
            if (err) return next(err);
            if (meme) {
              res.json({
                likes: meme.likes.likesCount,
                dislikes: meme.dislikes.dislikesCount,
              });
            }
          });
        }
      });
    }
  });
});

module.exports = router;
