const { Schema, model } = require("mongoose");

const sellerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },     
    role: {
        type: String,
        default: 'seller'
    },
    status: {
        type: String,
        default: 'pending'
    },
    payment: {
        type: String,
        default: 'inactive'
    },
    method: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    shopInfo: {
        shopName: {
            type: String,
            default: ''
        },
        division: {
            type: String,
            default: ''
        },
        district: {
            type: String,
            default: ''
        },
        sub_district: {
            type: String,
            default: ''
        }
    },
    identityVerification: {
        idType: {
            type: String,
            required: true,
            enum: ['SSS', 'UMID', 'Drivers License', 'Philippine Passport', 'PhilHealth', 'TIN', 'Postal ID']
        },
        idNumber: {
            type: String,
            required: true
        },
        idImage: {
            type: String,
            required: true
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        rejectionReason: {
            type: String,
            default: ''
        },
        renewalHistory: [{
            previousImage: String,
            renewalDate: Date,
            reason: String
        }]
    },
}, { timestamps: true });

module.exports = model('sellers', sellerSchema);