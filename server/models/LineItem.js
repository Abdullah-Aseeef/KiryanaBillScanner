const mongoose = require('mongoose');

const lineItemSchema = mongoose.Schema(
  {
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Bill',
    },
    item: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const LineItem = mongoose.model('LineItem', lineItemSchema);

module.exports = LineItem;
