const express = require('express');
const router = express.Router();
const Comment = require('../models/comment.js');

router.get('/:id', (req, res, next) => {
  Comment.find({ meme: req.params.id })
    .populate('author', 'username avatar')
    .sort('createdAt')
    .exec((err, comments) => {
      if (err) return next(err);
      res.json(comments);
    });
});

router.post('/add', (req, res, next) => {
  Comment.create({
    author: req.user._id,
    ...req.body,
  })
    .then((response) => {
      res.json({
        succes: true,
        message: 'Comment added successfully.',
        response: response,
      });
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  Comment.findById(req.params.id).exec((err, comment) => {
    if (err) return next(err);
    if (!(req.user.role === 'admin' || req.user._id === comment.author)) {
      next(new Error("You aren't allowed to delete this comment"));
    }
    Comment.findByIdAndDelete(req.params.id).exec((err, comment) => {
      if (err) return next(err);
      res.json({
        succes: true,
        message: 'Comment deleted.',
      });
    });
  });
});

module.exports = router;
