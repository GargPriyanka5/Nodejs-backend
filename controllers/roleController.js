const Role = require('../models/Role');
const User = require('../models/User');

// Create Role
exports.createRole = async (req, res, next) => {
  try {
    const { roleName, accessModules = [], active = true } = req.body;
    const role = await Role.create({ roleName, accessModules, active });
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

// Get list with search & pagination
exports.listRoles = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const query = {};
    if (q) {
      query.roleName = { $regex: q, $options: 'i' };
    }
    const roles = await Role.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    res.json({ success: true, count: roles.length, data: roles });
  } catch (err) {
    next(err);
  }
};

// Get single role
exports.getRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

// Update role
exports.updateRole = async (req, res, next) => {
  try {
    const { accessModules, ...otherUpdates } = req.body;

    let updateQuery = { ...otherUpdates };

    if (accessModules && accessModules.length > 0) {
      updateQuery.$addToSet = {
        accessModules: { $each: accessModules.map(a => a.trim()) }
      };
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true, runValidators: true } // return updated doc
    );

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};


// Delete role
exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    // Optionally unset role from users
    await User.updateMany({ role: role._id }, { $unset: { role: "" } });
    res.json({ success: true, message: 'Role deleted' });
  } catch (err) {
    next(err);
  }
};

// Add access module (unique)
exports.addAccessModule = async (req, res, next) => {
  try {
    const { module } = req.body;
    if (!module) return res.status(400).json({ success: false, message: 'module is required' });
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (!role.accessModules.includes(module)) {
      role.accessModules.push(module);
      role.accessModules = [...new Set(role.accessModules.map(m => m.trim()))];
      await role.save();
    }
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

// Remove single access module
exports.removeAccessModule = async (req, res, next) => {
  try {
    const { module } = req.body;
    if (!module) return res.status(400).json({ success: false, message: 'module is required' });
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    role.accessModules = role.accessModules.filter(m => m !== module);
    await role.save();
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};
