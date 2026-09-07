/**
 * Demo seeder (Phase 08) — populates the DB with realistic demo data.
 * Run: cd backend && node src/scripts/seedDemo.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/user.model');
const CropListing = require('../models/crop-listing.model');
const Fpo = require('../models/fpo.model');
const Order = require('../models/order.model');

async function seedDemo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[seed-demo] Connected');

  // Create demo users.
  const users = await User.insertMany([
    { name: 'Demo Farmer 1', phone: '9000000001', passwordHash: 'demo1234', role: 'farmer', location: { district: 'Nadia', state: 'West Bengal', village: 'Krishnanagar' } },
    { name: 'Demo Farmer 2', phone: '9000000002', passwordHash: 'demo1234', role: 'farmer', location: { district: 'Bardhaman', state: 'West Bengal', village: 'Burdwan' }, isFpoMember: true },
    { name: 'Demo Buyer Wholesale', phone: '9000000003', passwordHash: 'demo1234', role: 'buyer', location: { district: 'Kolkata', state: 'West Bengal' } },
    { name: 'Demo Buyer Processor', phone: '9000000004', passwordHash: 'demo1234', role: 'buyer', location: { district: 'Howrah', state: 'West Bengal' } },
  ]).catch(() => []);

  if (users.length === 0) {
    console.log('[seed-demo] Users already exist, skipping');
    await mongoose.disconnect();
    return;
  }

  const [farmer1, farmer2, buyer1, buyer2] = users;

  // Create FPO.
  const fpo = await Fpo.create({
    name: 'Krishnanagar Farmers Cooperative',
    registrationNo: 'WB/FPO/2025/001',
    district: 'Nadia',
    state: 'West Bengal',
    memberCount: 120,
    createdBy: farmer2._id,
    verified: true,
  });

  // Create 12 listings.
  const crops = ['tomato', 'potato', 'rice (paddy)', 'onion', 'cauliflower', 'mustard'];
  const listings = [];
  for (let i = 0; i < 12; i++) {
    const farmer = i < 6 ? farmer1 : farmer2;
    const crop = crops[i % crops.length];
    listings.push(
      await CropListing.create({
        farmerId: farmer._id,
        fpoId: i >= 6 ? fpo._id : undefined,
        crop,
        grade: ['A', 'B', 'C'][i % 3],
        organic: i % 4 === 0,
        quantity: { value: 10 + i * 5, unit: 'quintal' },
        priceType: i % 3 === 0 ? 'negotiable' : 'fixed',
        pricePerUnit: 1500 + i * 200,
        location: {
          district: farmer.location.district,
          state: 'West Bengal',
          village: farmer.location.village,
          geo: [22.5 + Math.random() * 2, 88.0 + Math.random()],
        },
        status: i < 10 ? 'active' : 'sold',
      })
    );
  }

  // Create 3 orders in different states.
  for (let i = 0; i < 3; i++) {
    const listing = listings[i];
    const order = await Order.create({
      listingId: listing._id,
      farmerId: listing.farmerId,
      buyerId: buyer1._id,
      quantity: listing.quantity,
      pricePerUnit: listing.pricePerUnit,
      total: listing.pricePerUnit * listing.quantity.value,
      status: ['created', 'dispatched', 'completed'][i],
      payment: { provider: 'stub', status: i === 2 ? 'captured' : 'pending' },
      timeline: [{ status: 'created', note: 'Demo order' }],
    });
    if (i >= 1) {
      order.timeline.push({ status: 'confirmed', note: 'Demo' });
      if (i >= 1) order.timeline.push({ status: 'dispatched', note: 'Demo' });
      if (i >= 2) order.timeline.push({ status: 'delivered', note: 'Demo' }, { status: 'completed', note: 'Demo' });
      await order.save();
    }
  }

  console.log('[seed-demo] Created:');
  console.log(`  ${users.length} users`);
  console.log(`  1 FPO`);
  console.log(`  ${listings.length} listings`);
  console.log(`  3 orders`);
  console.log('\nDemo credentials:');
  console.log('  Farmer: 9000000001 / demo1234');
  console.log('  Buyer:  9000000003 / demo1234');

  await mongoose.disconnect();
  console.log('[seed-demo] Done');
}

seedDemo().catch((err) => {
  console.error('[seed-demo] Error:', err);
  process.exit(1);
});
