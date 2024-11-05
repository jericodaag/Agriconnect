const { Schema, model } = require('mongoose');

const withdrowRequestSchema = new Schema({
    sellerId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    payment_method: {
        type: String,
        enum: ['stripe', 'cod'],
        required: true
    },
    withdrawalCode: {
        type: String,
        unique: true,
        sparse: true // Only required for COD withdrawals
    }
}, { timestamps: true });

module.exports = model('withdrowRequest', withdrowRequestSchema);