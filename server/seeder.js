const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bill = require('./models/Bill');
const LineItem = require('./models/LineItem');

dotenv.config();

const sampleBills = [
  {
    source: 'web',
    status: 'verified',
    items: [
      { item: 'Atta', quantity: 5, price: 160 },
      { item: 'Cheeni', quantity: 1, price: 190 },
    ],
  },
  {
    source: 'whatsapp',
    status: 'verified',
    items: [
      { item: 'Doodh', quantity: 4, price: 170 },
      { item: 'Chai Patti', quantity: 0.5, price: 1200 },
    ],
  },
  {
    source: 'web',
    status: 'verified',
    items: [
      { item: 'Basmati Chawal', quantity: 3, price: 360 },
      { item: 'Masoor Daal', quantity: 2, price: 340 },
    ],
  },
  {
    source: 'whatsapp',
    status: 'unverified',
    items: [
      { item: 'Anday', quantity: 24, price: 28 },
      { item: 'Cooking Oil', quantity: 2, price: 640 },
    ],
  },
  {
    source: 'web',
    status: 'unverified',
    items: [
      { item: 'Sabun', quantity: 3, price: 85 },
      { item: 'Aalu', quantity: 2, price: 60 },
    ],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    await Bill.deleteMany({});
    await LineItem.deleteMany({});
    console.log('Cleared existing data');

    for (const billData of sampleBills) {
      const lineItemIds = [];
      const tempBillId = new mongoose.Types.ObjectId();

      for (const it of billData.items) {
        const quantity = it.quantity;
        const price = it.price;
        const lineItem = await LineItem.create({
          billId: tempBillId,
          item: it.item,
          quantity,
          price,
          subtotal: quantity * price,
        });
        lineItemIds.push(lineItem._id);
      }

      const totalAmount = billData.items.reduce(
        (sum, it) => sum + it.quantity * it.price,
        0
      );

      await Bill.create({
        _id: tempBillId,
        source: billData.source,
        totalAmount,
        items: lineItemIds,
        status: billData.status,
        confidence: 0.92,
        rawText: 'Seeded sample data',
      });
    }

    console.log(
      `Seeded ${sampleBills.length} bills with ${sampleBills.reduce((sum, b) => sum + b.items.length, 0)} line items`
    );
    console.log('\nSample data summary:');
    sampleBills.forEach((bill, i) => {
      const total = bill.items.reduce((s, it) => s + it.quantity * it.price, 0);
      console.log(
        `  Bill ${i + 1}: ${bill.source} | ${bill.status} | Rs. ${total} | ${bill.items.map((it) => it.item).join(', ')}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
};

seedDB();
