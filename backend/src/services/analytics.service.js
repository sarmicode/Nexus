/**
 * Analytics service (Phase 07) — aggregate dashboards for farmers, buyers, admin.
 */
const CropListing = require('../models/crop-listing.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Lead = require('../models/lead.model');
const priceService = require('./mandi/priceService');

async function getFarmerAnalytics(user) {
  const [listingAgg, orderAgg, leadAgg] = await Promise.all([
    CropListing.aggregate([
      { $match: { farmerId: user._id, deletedAt: null } },
      {
        $group: {
          _id: null,
          totalListings: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          sold: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, '$pricePerUnit', 0] },
          },
          avgPrice: { $avg: '$pricePerUnit' },
        },
      },
    ]),
    Order.aggregate([
      { $match: { farmerId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]),
    Lead.aggregate([
      {
        $match: {
          listingId: {
            $in: await CropListing.find({ farmerId: user._id }).select('_id'),
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stats = listingAgg[0] || {};
  const orderStats = {};
  let totalOrderRevenue = 0;
  for (const o of orderAgg) {
    orderStats[o._id] = o.count;
    totalOrderRevenue += o.revenue;
  }
  const leadStats = {};
  for (const l of leadAgg) {
    leadStats[l._id] = l.count;
  }

  return {
    listings: {
      total: stats.totalListings || 0,
      active: stats.active || 0,
      sold: stats.sold || 0,
      draft: stats.draft || 0,
      expired: stats.expired || 0,
      avgPrice: Math.round((stats.avgPrice || 0) * 100) / 100,
    },
    orders: {
      ...orderStats,
      totalRevenue: totalOrderRevenue,
    },
    leads: leadStats,
  };
}

async function getBuyerAnalytics(user) {
  const orderAgg = await Order.aggregate([
    { $match: { buyerId: user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpend: { $sum: '$total' },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        active: {
          $sum: {
            $cond: [
              { $in: ['$status', ['created', 'confirmed', 'dispatched', 'delivered']] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const topCrops = await Order.aggregate([
    { $match: { buyerId: user._id } },
    {
      $lookup: {
        from: 'croplistings',
        localField: 'listingId',
        foreignField: '_id',
        as: 'listing',
      },
    },
    { $unwind: '$listing' },
    {
      $group: {
        _id: '$listing.crop',
        count: { $sum: 1 },
        spend: { $sum: '$total' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const stats = orderAgg[0] || {};
  return {
    orders: {
      total: stats.totalOrders || 0,
      completed: stats.completed || 0,
      active: stats.active || 0,
      totalSpend: stats.totalSpend || 0,
    },
    topCrops: topCrops.map((c) => ({
      crop: c._id,
      orderCount: c.count,
      spend: c.spend,
    })),
  };
}

async function getAdminOverview() {
  const [userStats, orderStats, listingStats, disputeAgg] = await Promise.all([
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]),
    CropListing.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: 'disputed' } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]),
  ]);

  const usersByRole = {};
  let totalUsers = 0;
  for (const u of userStats) {
    usersByRole[u._id] = u.count;
    totalUsers += u.count;
  }

  const ordersByStatus = {};
  let gmv = 0;
  for (const o of orderStats) {
    ordersByStatus[o._id] = o.count;
    gmv += o.revenue;
  }

  const listingsByStatus = {};
  for (const l of listingStats) {
    listingsByStatus[l._id] = l.count;
  }

  const topDistricts = await CropListing.aggregate([
    { $match: { deletedAt: null, status: 'active' } },
    { $group: { _id: '$location.district', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const totalOrders = Object.values(ordersByStatus).reduce((a, b) => a + b, 0);
  const disputeCount = disputeAgg[0]?.count || 0;

  return {
    users: { total: totalUsers, byRole: usersByRole },
    orders: { total: totalOrders, byStatus: ordersByStatus, gmv },
    listings: listingsByStatus,
    topDistricts: topDistricts.map((d) => ({ district: d._id, count: d.count })),
    disputeRate:
      totalOrders > 0 ? Math.round((disputeCount / totalOrders) * 10000) / 100 : 0,
  };
}

module.exports = {
  getFarmerAnalytics,
  getBuyerAnalytics,
  getAdminOverview,
};
