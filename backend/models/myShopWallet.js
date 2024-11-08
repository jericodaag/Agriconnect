const {Schema, model} = require("mongoose");

const myShopWalletSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['commission', 'other'],
        default: 'other'
    },
    orderId: {
        type: Schema.ObjectId,
        ref: 'customerOrders'
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
    }
}, { timestamps: true });

module.exports = model('myShopWallets',myShopWalletSchema)