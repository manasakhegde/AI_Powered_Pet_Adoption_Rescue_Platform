const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email });
        if (!customer) return res.status(404).json({ error: 'User not found' });
        
        const isMatch = await bcrypt.compare(password, customer.password).catch(() => false) || (customer.password === password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: customer._id, role: 'CUSTOMER' }, process.env.JWT_SECRET);
        res.json({
            token,
            id: customer._id.toString(),
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone || '',
            city: customer.city || '',
            address: customer.address || '',
            role: 'CUSTOMER'
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ error: 'Admin not found' });

        const isMatch = await bcrypt.compare(password, admin.password).catch(() => false) || (admin.password === password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: admin._id, role: 'ADMIN' }, process.env.JWT_SECRET);
        res.json({
            token,
            id: admin._id.toString(),
            email: admin.email,
            firstName: admin.firstName || 'Admin',
            lastName: admin.lastName || 'User',
            role: 'ADMIN'
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/register', async (req, res) => {
    try {
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const customer = new Customer({
            ...req.body,
            password: hashedPassword
        });
        await customer.save();

        const token = jwt.sign({ id: customer._id, role: 'CUSTOMER' }, process.env.JWT_SECRET);
        res.json({
            token,
            id: customer._id.toString(),
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone || '',
            city: customer.city || '',
            address: customer.address || '',
            role: 'CUSTOMER'
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;