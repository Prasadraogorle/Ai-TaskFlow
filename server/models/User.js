import mongoose from 'mongoose';
import crypto from 'crypto';

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
    unique: true,
    sparse: true,
    default: function() {
      if (this.authProvider === 'email') {
        return `email_${crypto.randomBytes(16).toString('hex')}`;
      }
      return undefined; 
    }
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
   tokenVersion: {              
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  googleTokens: {
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number
},

  otp: {
    code: { type: String },   
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
