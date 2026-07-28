const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');

router.get('/', async (req, res) => {
    const pets = await Pet.find();
    res.json(pets.map(p => ({ ...p.toObject(), id: p._id.toString() })));
});

router.get('/:id', async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Not found' });
    res.json({ ...pet.toObject(), id: pet._id.toString() });
});

router.post('/', async (req, res) => {
    const pet = new Pet(req.body);
    await pet.save();
    res.status(201).json({ ...pet.toObject(), id: pet._id.toString() });
});

router.put('/:id', async (req, res) => {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...pet.toObject(), id: pet._id.toString() });
});

router.delete('/:id', async (req, res) => {
    await Pet.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

router.post('/:id/image-base64', async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Not found' });
    if(req.body.imageData) {
        pet.imageUrls = [req.body.imageData];
    }
    await pet.save();
    res.json({ imageUrl: req.body.imageData, petId: pet._id.toString() });
});
module.exports = router;