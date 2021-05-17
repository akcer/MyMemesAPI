require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Memes = require('./routes/memes.js');
const Users = require('./routes/users.js');
const Comments = require('./routes/comments.js');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const port = process.env.PORT || 3001;
const app = express();

mongoose
  .connect(process.env.MONGODB_HOST, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .catch((err) => console.log(err.message));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("we're connected!");
});
app.use(morgan('tiny'));
app.use(
  cors({
    credentials: true,
    origin: [
      `${process.env.CLIENT_HOST}`,
      `${process.env.MOBILE_APP_HOST}`,
      `${process.env.LOCAL_MACHINE_HOST}`,
    ],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: 'secret',
    store: new MongoStore({ mongooseConnection: db }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('/memes', Memes);
app.use('/users', Users);
app.use('/comments', Comments);
app.use(express.static('uploads'));

//error-handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: 'Error',
    stack: err.stack,
    message: err.message,
  });
});

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server ready on port ${port}`);
});
