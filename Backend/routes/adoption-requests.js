const express = require('express');
const router = express.Router();
const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');

router.get('/', async (req, res) => {
    const reqs = await Adoption.find();
    res.json(reqs.map(p => ({ ...p.toObject(), id: p._id.toString() })));
});

router.post('/', async (req, res) => {
    const adopt = new Adoption(req.body);
    await adopt.save();
    
    // Automatically set pet status to 'Pending' (or keep available until approved)
    // Actually, when a user submits an adoption request, it starts as 'Pending' in localStorage, but in DB we can keep it as 'Available' or 'Pending'
    res.status(201).json({ ...adopt.toObject(), id: adopt._id.toString() });
});

const handleStatusChange = async (req, res) => {
    try {
        const status = req.query.status || req.body.status;
        const adopt = await Adoption.findByIdAndUpdate(req.params.id, { status, applicationStatus: status, resolvedAt: new Date() }, { new: true });
        if (!adopt) return res.status(404).json({ error: 'Adoption request not found' });

        if (adopt.petId) {
            let petStatus = 'Available';
            if (status === 'Approved') {
                petStatus = 'Pending'; // Adoption pending payment
            } else if (status === 'Rejected') {
                petStatus = 'Available';
            }
            await Pet.findByIdAndUpdate(adopt.petId, { adoptionStatus: petStatus });
        }

        res.json({ ...adopt.toObject(), id: adopt._id.toString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

router.put('/:id/status', handleStatusChange);
router.patch('/:id/status', handleStatusChange);

module.exports = router;