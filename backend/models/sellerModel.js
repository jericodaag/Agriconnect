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
    passwordReset: {
        requested: {
            type: Boolean,
            default: false
        },
        token: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date,
            default: null
        },
        reason: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending'
        },
        requestDate: {
            type: Date,
            default: null
        },
        rejectionReason: {
            type: String,
            default: ''
        },
        history: [{
            requestDate: {
                type: Date
            },
            reason: {
                type: String
            },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected', 'completed']
            },
            rejectionReason: {
                type: String
            },
            resolvedDate: {
                type: Date
            },
            resolvedBy: {
                type: Schema.Types.ObjectId,
                ref: 'admin'
            }
        }]
    }
}, { timestamps: true });

// Index for password reset token lookups
sellerSchema.index({ 'passwordReset.token': 1 });

// Index for finding pending password reset requests
sellerSchema.index({ 
    'passwordReset.status': 1, 
    'passwordReset.requested': 1 
});

// Index for expired tokens cleanup
sellerSchema.index({ 'passwordReset.expiresAt': 1 });

module.exports = model('sellers', sellerSchema);