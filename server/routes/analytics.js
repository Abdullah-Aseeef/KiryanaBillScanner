const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const LineItem = require('../models/LineItem');

// GET /api/analytics/summary — Dashboard summary data
router.get('/summary', async (req, res) => {
  try {
    // Total revenue from verified bills
    const revenueResult = await Bill.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Bill counts
    const totalBills = await Bill.countDocuments();
    const verifiedBills = await Bill.countDocuments({ status: 'verified' });
    const unverifiedBills = await Bill.countDocuments({ status: 'unverified' });

    // Top selling items — aggregate by item name across all line items
    const topItems = await LineItem.aggregate([
      {
        $group: {
          _id: '$item',
          count: { $sum: 1 },
          totalQty: { $sum: '$quantity' },
          totalRevenue: { $sum: '$subtotal' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          totalQty: { $round: ['$totalQty', 2] },
          totalRevenue: { $round: ['$totalRevenue', 2] },
        },
      },
    ]);

    // Recent bills for quick overview
    const recentBills = await Bill.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('source totalAmount status createdAt');

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalBills,
      verifiedBills,
      unverifiedBills,
      topItems,
      recentBills,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
