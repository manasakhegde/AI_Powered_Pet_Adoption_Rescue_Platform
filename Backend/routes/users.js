const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

router.get('/', async (req, res) => {
    const items = await Customer.find();
    res.json(items.map(p => ({ ...p.toObject(), id: p._id.toString() })));
});

router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'User not found' });
        res.json({
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