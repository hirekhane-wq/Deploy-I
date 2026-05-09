const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['SEND', 'RECEIVE', 'BONUS', 'DEPOSIT'], required: true },
  amount: { type: Number, required: true },
  recipient: String,
  sender: String,
  date: { type: Date, default: Date.now },
  method: String,
  message: String,
  international: { type: Boolean, default: false },
  targetCurrency: String,
  convertedAmount: Number,
  convertedCurrency: String,
  stripeSessionId: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
