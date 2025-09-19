const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// signup
exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName = '', email, password, role } = req.body;
    if (!firstName || !email || !password) return res.status(400).json({ success: false, message: 'firstName, email, password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
    const user = await User.create({ firstName, lastName, email, password, role });
    const populatedUser = await User.findById(user._id).populate({ path: 'role', select: 'accessModules' }).lean();
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, firstName: user.firstName } });
  } catch (err) {
    next(err);
  }
};

// list users (populate roleName and accessModules only)
exports.listUsers = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const query = { };
    if (q) {
      // search across firstName, lastName, email (case-insensitive partial)
      const regex = new RegExp(q, 'i');
      query.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }
    const users = await User.find(query)
      .populate({ path: 'role', select: 'accessModules roleName' })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate({ path: 'role', select: 'roleName accessModules' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// update user
exports.updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.password) delete updates.password; // avoid password update here (could create separate)
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate({ path: 'role', select: 'roleName accessModules' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// check whether user has access to particular module
exports.checkUserAccess = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { module } = req.query;
    if (!module) return res.status(400).json({ success: false, message: 'module query param is required' });
    const user = await User.findById(userId).populate('role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.role) return res.json({ success: true, hasAccess: false });
    const hasAccess = (user.role.accessModules || []).includes(module);
    res.json({ success: true, hasAccess });
  } catch (err) {
    next(err);
  }
};

// update many users with same data - example: set lastName to "ABC" for all matched
exports.bulkUpdateSame = async (req, res, next) => {
  try {
    const { filter = {}, update = {} } = req.body; // e.g. filter: {}, update: { lastName: "ABC" }
    const result = await User.updateMany(filter, { $set: update });
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

// update many users with different data using bulkWrite
exports.bulkUpdateDifferent = async (req, res, next) => {
  try {
    const { operations } = req.body; // operations: [{ _id: "<id1>", update: {firstName:"X"} }, ...]
    if (!Array.isArray(operations)) return res.status(400).json({ success: false, message: 'operations array required' });
    const bulkOps = operations.map(op => ({
      updateOne: {
        filter: { _id: mongoose.Types.ObjectId(op._id) },
        update: { $set: op.update }
      }
    }));
    const result = await User.bulkWrite(bulkOps);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};
