const mongoose = require('mongoose');
const adoptionSchema = new mongoose.Schema({
    petId: String,
    petName: String,
    petSpecies: String,
    petBreed: String,
    petImage: String,
    userId: String,
    userEmail: String,
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    customerAddress: String,
    reason: String,
    experience: String,
    homeEnvironment: String,
    otherPets: String,
    rescueCenterId: String,
    rescueCenterName: String,
    status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
    applicationStatus: { type: String, default: 'Pending' },
    paymentStatus: { type: String, default: 'UNPAID' },
    adoptedAt: { type: Date, default: Date.now },
    applicationDate: { type: Date, default: Date.now },
    resolvedAt: Date,
    notes: String
});
module.exports = mongoose.model('Adoption', adoptionSchema, 'adoption_requests');