const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    meme: {
      type: Schema.Types.ObjectId,
      ref: 'Meme',
      required: [true, 'Select meme to add comment'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Register or login to add comment'],
    },
    text: {
      type: String,
      trim: true,
      required: [true, 'Add comment'],
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
