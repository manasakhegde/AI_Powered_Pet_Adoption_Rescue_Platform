const express = require('express');
const router = express.Router();
const RescueReport = require('../models/RescueReport');

router.get('/', async (req, res) => {
    const items = await RescueReport.find();
    res.json(items.map(p => ({ ...p.toObject(), id: p._id.toString() })));
});
router.post('/', async (req, res) => {
    const rr = new RescueReport(req.body);
    await rr.save();
    res.status(201).json({ ...rr.toObject(), id: rr._id.toString() });
});
router.put('/:id/status', async (req, res) => {
    const rr = await RescueReport.findByIdAndUpdate(req.params.id, { status: req.query.status || req.body.status }, { new: true });
    res.json({ ...rr.toObject(), id: rr._id.toString() });
});
module.exports = router;