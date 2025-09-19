const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim:true },
  lastName: { type: String, trim:true, default: '' },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);