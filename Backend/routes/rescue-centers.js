const express = require('express');
const router = express.Router();
const RescueCenter = require('../models/RescueCenter');

router.get('/', async (req, res) => {
    const items = await RescueCenter.find();
    res.json(items.map(p => ({ ...p.toObject(), id: p._id.toString() })));
});
router.get('/admin/all', async (req, res) => {
    const items = await RescueCenter.find();
    res.json(items.map(p => ({ ...p.toObject(), id: p._id.toString() })));
});
router.post('/', async (req, res) => {
    const rc = new RescueCenter(req.body);
    await rc.save();
    res.status(201).json({ ...rc.toObject(), id: rc._id.toString() });
});
router.put('/:id', async (req, res) => {
    try {
        const rc = await RescueCenter.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!rc) return res.status(404).json({ error: 'Rescue center not found' });
        res.json({ ...rc.toObject(), id: rc._id.toString() });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/verify', async (req, res) => {
    try {
        const rc = await RescueCenter.findByIdAndUpdate(req.params.id, { verificationStatus: 'Verified' }, { new: true });
        if (!rc) return res.status(404).json({ error: 'Rescue center not found' });
        res.json({ ...rc.toObject(), id: rc._id.toString() });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const rc = await RescueCenter.findByIdAndDelete(req.params.id);
        if (!rc) return res.status(404).json({ error: 'Rescue center not found' });
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;