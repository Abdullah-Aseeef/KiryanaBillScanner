const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      enum: ['web', 'whatsapp'],
    },
    senderWaId: {
      type: String,
    },
    mediaId: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LineItem',
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['unverified', 'verified'],
      default: 'unverified',
    },
    confidence: {
      type: Number,
      default: 0.0,
    },
    rawText: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
