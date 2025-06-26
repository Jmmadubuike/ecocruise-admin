// controllers/adminController.js

import Transaction from '../models/Transaction.js';
import PayoutTransaction from '../models/PayoutTransaction.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';

export const getAnalytics = async (req, res) => {
  try {
    const { from, to, range } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (range === '7') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      dateFilter.createdAt = { $gte: past };
    } else if (range === 'month') {
      const past = new Date();
      past.setMonth(now.getMonth() - 1);
      dateFilter.createdAt = { $gte: past };
    } else if (from && to) {
      dateFilter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const [
      totalRides,
      totalRevenueAgg,
      activeDrivers,
      driverPayouts,
      customerCount,
      adminCount,
      driverCount,
    ] = await Promise.all([
      Ride.countDocuments(dateFilter),
      Transaction.aggregate([
        { $match: { type: 'debit', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.countDocuments({ role: 'driver', isOnline: true }),
      PayoutTransaction.aggregate([
        { $match: { ...dateFilter } },
        {
          $lookup: {
            from: 'users',
            localField: 'driver',
            foreignField: '_id',
            as: 'driverInfo'
          }
        },
        {
          $unwind: {
            path: '$driverInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$driver',
            name: { $first: '$driverInfo.name' },
            email: { $first: '$driverInfo.email' },
            totalPaid: { $sum: '$amount' },
            lastPaid: { $max: '$createdAt' },
          },
        },
        { $sort: { totalPaid: -1 } }
      ]),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'driver' }),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const totalPaidToDrivers = driverPayouts.reduce(
      (sum, p) => sum + p.totalPaid,
      0
    );

    res.json({
      success: true,
      data: {
        totalRides,
        totalRevenue,
        activeDrivers,
        totalPaidToDrivers,
        driverPayoutBreakdown: driverPayouts,
        customerCount,
        adminCount,
        driverCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analytics computation failed' });
  }
};

// routes/adminRoutes.js

import express from 'express';
import { getAnalytics } from '../controllers/adminController.js';

const router = express.Router();

// GET /admin/analytics
router.get('/analytics', getAnalytics);

export default router;
