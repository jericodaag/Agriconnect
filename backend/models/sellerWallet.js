const { Schema, model } = require("mongoose");

const sellerWalletSchema = new Schema({
    sellerId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    payment_method: {
        type: String,
        enum: ['stripe', 'cod'],
        required: true
    },
    commission: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v) {
                return v === this.grossAmount * 0.03; // Ensure commission is exactly 3%
            },
            message: 'Commission must be 3% of gross amount'
        }
    },
    grossAmount: {
        type: Number,
        required: true,
        min: 0
    },
    netAmount: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v) {
                return v === this.grossAmount - this.commission; // Ensure netAmount is grossAmount - commission
            },
            message: 'Net amount must be gross amount minus commission'
        }
    }
}, { timestamps: true });

sellerWalletSchema.pre('save', function(next) {
    // Verify commission calculation
    if (this.commission !== this.grossAmount * 0.03) {
        next(new Error('Commission calculation is incorrect'));
        return;
    }

    // Verify net amount calculation
    if (this.netAmount !== this.grossAmount - this.commission) {
        next(new Error('Net amount calculation is incorrect'));
        return;
    }

    next();
});

module.exports = model('sellerWallets', sellerWalletSchema);