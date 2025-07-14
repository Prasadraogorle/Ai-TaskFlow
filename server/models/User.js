const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'email';
    }
  },
  profilePicture: {
    type: String,
    default: null
  },
  firebaseUid: {
    type: String,
    default: null,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;