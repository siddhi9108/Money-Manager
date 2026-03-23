const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

/**
 * Middleware: Authentication
 * - Extracts JWT token from Authorization header
 * - Verifies token and attaches userId to request
 */
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.userId = decoded.id; // Attach user ID to request for downstream use
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * GET /
 * Fetch all transactions for the logged-in user
 * - Sorted by most recent (created_at DESC)
 */
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.userId })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * POST /
 * Add a new transaction
 * - Inserts transaction into DB
 * - Updates corresponding account balance
 *   (income adds, expense subtracts)
 */
router.post('/', auth, async (req, res) => {
  const { type, amount, category, division, description, account } = req.body;

  try {
    const transaction = new Transaction({
      user_id: req.userId,
      type,
      amount,
      category,
      division: division || 'Personal',
      description,
      account
    });

    await transaction.save();

    // Determine how this transaction affects account balance
    const balanceChange = type === 'income' ? parseFloat(amount) : -parseFloat(amount);

    // Update the associated account balance
    await Account.findOneAndUpdate(
      { user_id: req.userId, name: account },
      { $inc: { balance: balanceChange } }
    );

    res.status(201).json({
      id: transaction._id,
      message: 'Transaction created'
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * PUT /:id
 * Update an existing transaction
 * - Only updates fields (amount, category, division, description)
 * - Does NOT adjust account balance (important limitation)
 */
router.put('/:id', auth, async (req, res) => {
  const { amount, category, division, description } = req.body;

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { amount, category, division, description },
      { new: true }
    );

    if (!transaction)
      return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /summary/:view
 * Generate transaction summaries by type (income vs expense)
 * - Supports:
 *   weekly  → last 7 days
 *   monthly → last 30 days
 *   yearly  → last 365 days
 */
router.get('/summary/:view', auth, async (req, res) => {
  try {
    let dateFilter = {};
    const now = new Date();

    if (req.params.view === 'weekly') {
      dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
    } else if (req.params.view === 'monthly') {
      dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
    } else if (req.params.view === 'yearly') {
      dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 365)) } };
    }

    const results = await Transaction.aggregate([
      { $match: { user_id: req.userId, ...dateFilter } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
      { $project: { type: '$_id', total: 1, _id: 0 } }
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /summary/category
 * Generate expense breakdown by category
 * - Only considers transactions of type 'expense'
 */
router.get('/summary/category', auth, async (req, res) => {
  try {
    const results = await Transaction.aggregate([
      { $match: { user_id: req.userId, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { category: '$_id', total: 1, _id: 0 } }
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /accounts
 * Fetch all accounts for the user
 * - Includes current balances
 */
router.get('/accounts', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ user_id: req.userId });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * POST /accounts
 * Create a new account
 * - Requires account name
 * - Defaults balance to 0 if not provided
 */
router.post('/accounts', auth, async (req, res) => {
  const { name, balance } = req.body;

  if (!name)
    return res.status(400).json({ error: 'Account name required' });

  try {
    const account = new Account({
      user_id: req.userId,
      name,
      balance: balance || 0
    });

    await account.save();

    res.status(201).json({
      id: account._id,
      message: 'Account created'
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
