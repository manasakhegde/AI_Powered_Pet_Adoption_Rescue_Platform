const mongoose = require('mongoose');
const rescueCenterSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    description: String,
    capacity: Number,
    totalCapacity: Number,
    currentAnimals: Number,
    services: String,
    specializations: String,
    registrationType: String,
    website: String,
    operatingHours: String,
    openingHours: String,
    verificationStatus: { type: String, default: 'Pending' }, // Pending, Verified, Rejected
    active: { type: Boolean, default: true },
    establishedYear: Number,
    facilities: [String],
    supportedAnimals: [String],
    rating: Number,
    latitude: Number,
    longitude: Number,
    managerName: String,
    bankDetails: String,
    registrationNumber: String
});
module.exports = mongoose.model('RescueCenter', rescueCenterSchema, 'rescue_centers');