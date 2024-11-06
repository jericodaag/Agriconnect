const {Schema, model} = require("mongoose");
const reviewSchema = new Schema({
    productId: {
        type: Schema.ObjectId,
        required: true,
        ref: 'products'
    },
    userId: {
        type: Schema.ObjectId,
        required: true,
        ref: 'customers'
    },
    orderId: {
        type: Schema.ObjectId,
        required: true,
        ref: 'customerOrders'
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    review: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
}, { timestamps: true });
module.exports = model('reviews', reviewSchema);