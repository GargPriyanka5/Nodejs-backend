const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true, trim: true },
  accessModules: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

RoleSchema.pre('save', function(next) {
  if (this.accessModules && this.accessModules.length) {
    this.accessModules = [...new Set(this.accessModules.map(m => m.trim()))];
  }
  next();
});

module.exports = mongoose.model('Role', RoleSchema);