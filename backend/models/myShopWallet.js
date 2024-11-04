const {Schema, model} = require("mongoose");

const myShopWalletSchema = new Schema({
    amount: {
        type: Number,
        required: true
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