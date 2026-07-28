const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    phone: String,
    address: String,
    role: { type: String, default: 'CUSTOMER' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Customer', customerSchema, 'customers');