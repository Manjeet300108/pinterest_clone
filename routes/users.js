const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');


const userSchema = mongoose.Schema({
  username: String,
  password: String,
  fullname: String,
  email: String,
  profileImg: String,
  contact: Number,
  boards: {
    type: Array,
    default: []
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post'
  }]
});

// passport plugin
userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);