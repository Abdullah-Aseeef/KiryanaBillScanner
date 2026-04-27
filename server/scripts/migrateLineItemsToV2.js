/**
 * Migrates LineItem documents from legacy schema (standardName/rawName/qty/unit)
 * to v2 schema (item/quantity). Run once against the target DB.
 *
 * Usage: node scripts/migrateLineItemsToV2.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../..', '.env') });

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const collection = db.collection('lineitems');

  // Count legacy documents (those with standardName or qty field present)
  const legacyCount = await collection.countDocuments({
    $or: [{ standardName: { $exists: true } }, { qty: { $exists: true } }],
  });
  console.log(`Found ${legacyCount} legacy LineItem documents to migrate`);

  if (legacyCount === 0) {
    console.log('Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  const cursor = collection.find({
    $or: [{ standardName: { $exists: true } }, { qty: { $exists: true } }],
  });

  let migrated = 0;
  let errors = 0;

  for await (const doc of cursor) {
    try {
      const item = doc.standardName || doc.rawName || 'Unknown';
      const quantity = doc.qty != null ? Number(doc.qty) : 1;
      const price = Number(doc.price) || 0;
      const subtotal =
        doc.subtotal != null && Number(doc.subtotal) > 0
          ? Number(doc.subtotal)
          : quantity * price;

      await collection.updateOne(
        { _id: doc._id },
        {
          $set: { item, quantity, price, subtotal },
          $unset: { standardName: '', rawName: '', qty: '', unit: '' },
        }
      );
      migrated++;
    } catch (err) {
      console.error(`Failed to migrate doc ${doc._id}:`, err.message);
      errors++;
    }
  }

  console.log(`Migration complete: ${migrated} migrated, ${errors} errors`);

  // Verify no legacy fields remain
  const remaining = await collection.countDocuments({
    $or: [{ standardName: { $exists: true } }, { qty: { $exists: true } }],
  });
  console.log(`Legacy field check: ${remaining} documents still have legacy fields`);

  await mongoose.disconnect();
  console.log('Disconnected');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
