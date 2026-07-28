const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'ADMIN' },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Admin', adminSchema, 'admins');