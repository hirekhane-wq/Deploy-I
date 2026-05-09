const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true },
  age: { type: Number, required: true },
  balance: { type: Number, default: 0 },
  role: { type: String, default: 'Standard' },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  kycStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  idDocumentUrl: { type: String },
  password: { type: String, required: true }
});

// NOTE: Password hashing is handled explicitly in auth.js routes.
// Do NOT add a pre('save') hook here to avoid double-hashing.

module.exports = mongoose.model('User', userSchema);
