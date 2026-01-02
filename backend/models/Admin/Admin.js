const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const AdminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true},
  phoneNo: { type: String, required: true, match: [/^[0-9]{10}$/, "Invalid phone number"] },
  password: { type: String, required: true },
}, { timestamps: true });

// Hash password
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


AdminSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
