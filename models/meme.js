const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memeSchema = new mongoose.Schema(
  {
    image: { type: String, trim: true, required: [true, 'Image is required'] },
    topTitle: {
      type: String,
      trim: true,
      required: [true, 'Top Title is required'],
    },
    bottomTitle: {
      type: String,
      trim: true,
      required: [true, 'Bottom Title is required'],
    },
    text: { type: String, trim: true, required: [true, 'Text is required'] },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Register or login to add meme'],
    },
    likes: {
      likesCount: { type: Number, default: 0 },
      likes: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: [true, 'Register or login to like'],
      },
    },
    dislikes: {
      dislikesCount: { type: Number, default: 0 },
      dislikes: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: [true, 'Register or login to dislike'],
      },
    },
  },
  {
    timestamps: true,
  }
);
memeSchema.index({ createdAt: 1 });

const Meme = mongoose.model('Meme', memeSchema);
module.exports = Meme;
