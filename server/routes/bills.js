const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const LineItem = require('../models/LineItem');

// GET /api/bills — List all bills (newest first)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bills = await Bill.find(filter)
      .populate('items')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bills/:id — Get a single bill with items
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('items');
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/bills/:id — Update bill and its items (for editable review panel)
router.put('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const { items, totalAmount } = req.body;

    if (items && Array.isArray(items)) {
      await LineItem.deleteMany({ billId: bill._id });

      const newItemIds = [];
      for (const it of items) {
        const quantity = Number(it.quantity) || 0;
        const price = Number(it.price) || 0;
        const lineItem = await LineItem.create({
          billId: bill._id,
          item: it.item,
          quantity,
          price,
          subtotal: quantity * price,
        });
        newItemIds.push(lineItem._id);
      }
      bill.items = newItemIds;
    }

    if (totalAmount !== undefined) {
      bill.totalAmount = totalAmount;
    } else if (items) {
      const allItems = await LineItem.find({ billId: bill._id });
      bill.totalAmount = allItems.reduce((sum, li) => sum + li.subtotal, 0);
    }

    await bill.save();

    const populatedBill = await Bill.findById(bill._id).populate('items');
    res.json(populatedBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/bills/:id/verify — Set status to verified
router.put('/:id/verify', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const { items, totalAmount } = req.body;

    if (items && Array.isArray(items)) {
      await LineItem.deleteMany({ billId: bill._id });
      const newItemIds = [];
      for (const it of items) {
        const quantity = Number(it.quantity) || 0;
        const price = Number(it.price) || 0;
        const lineItem = await LineItem.create({
          billId: bill._id,
          item: it.item,
          quantity,
          price,
          subtotal: quantity * price,
        });
        newItemIds.push(lineItem._id);
      }
      bill.items = newItemIds;
    }

    if (totalAmount !== undefined) {
      bill.totalAmount = totalAmount;
    } else {
      const allItems = await LineItem.find({ billId: bill._id });
      bill.totalAmount = allItems.reduce((sum, li) => sum + li.subtotal, 0);
    }

    bill.status = 'verified';
    await bill.save();

    const populatedBill = await Bill.findById(bill._id).populate('items');
    res.json(populatedBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
