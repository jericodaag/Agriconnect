const { Schema, model } = require('mongoose')

const customerOrder = new Schema({
    customerId: {
        type: Schema.ObjectId,
        required: true
    },
    products: {
        type: Array,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    payment_status: {
        type: String,
        required: true
    },
    shippingInfo: {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        post: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        barangay: {
            type: String,
            required: true
        }
    },
    delivery_status: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    payment_method: {
        type: String,
        required: true,
        enum: ['stripe', 'cod']
    }
}, { timestamps: true })

module.exports = model('customerOrders', customerOrder)