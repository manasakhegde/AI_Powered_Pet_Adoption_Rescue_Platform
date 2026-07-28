const mongoose = require('mongoose');
const rescueReportSchema = new mongoose.Schema({
    userEmail: String,
    reporterName: String,
    reporterPhone: String,
    animalType: String,
    description: String,
    location: String,
    address: String,
    urgency: String,
    imagePreview: String,
    aiActions: [String],
    aiSeverity: String,
    aiConfidence: Number,
    rescueCenterId: String,
    rescueCenterName: String,
    status: { type: String, default: 'Pending' },
    submittedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    timeline: [{ event: String, date: Date, description: String }]
});
module.exports = mongoose.model('RescueReport', rescueReportSchema, 'rescue_reports');