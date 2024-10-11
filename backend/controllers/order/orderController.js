const authOrderModel = require('../../models/authOrder')
const customerOrder = require('../../models/customerOrder')
const myShopWallet = require('../../models/myShopWallet')
const sellerWallet = require('../../models/sellerWallet')
const cardModel = require('../../models/cardModel')
const moment = require("moment")
const { responseReturn } = require('../../utilities/response') 
const { mongo: {ObjectId}} = require('mongoose')
const stripe = require('stripe')('sk_test_51Phb3kLs4PUYCdHCPpJ794IsxnhwDIo16hMNqRXV0PdupEoBpqQcyjTejSQvxzHItA9mOb3eQs4EMW21dyJA7MHU00FKo5wKjB')

class orderController {

    paymentCheck = async (id) => {
        try {
            const order = await customerOrder.findById(id)
            if (order.payment_status === 'unpaid') {
                await customerOrder.findByIdAndUpdate(id, {
                    delivery_status: 'cancelled'
                })
                await authOrderModel.updateMany({
                    orderId: id
                },{
                    delivery_status: 'cancelled'
                })
            }
            return true
        } catch (error) {
            console.log(error)
        }
    }

    place_order = async (req, res) => {
        const {price, products, shipping_fee, shippingInfo, userId } = req.body
        let authorOrderData = []
        let cardId = []
        const tempDate = moment(Date.now()).format('LLL')

        let customerOrderProduct = []

        for (let i = 0; i < products.length; i++) {
            const pro = products[i].products
            for (let j = 0; j < pro.length; j++) {
                const tempCusPro = pro[j].productInfo;
                tempCusPro.quantity = pro[j].quantity
                customerOrderProduct.push(tempCusPro)
                if (pro[j]._id) {
                    cardId.push(pro[j]._id)
                } 
            } 
        }

        try {
            const order = await customerOrder.create({
                customerId: userId,
                shippingInfo,
                products: customerOrderProduct,
                price: price + shipping_fee,
                payment_status: 'unpaid',
                delivery_status: 'pending',  // Changed from 'pending' to 'pending'
                date: tempDate
            })
            for (let i = 0; i < products.length; i++) {
                const pro = products[i].products
                const pri = products[i].price
                const sellerId = products[i].sellerId
                let storePor = []
                for (let j = 0; j < pro.length; j++) {
                    const tempPro = pro[j].productInfo
                    tempPro.quantity = pro[j].quantity
                    storePor.push(tempPro)                    
                }

                authorOrderData.push({
                    orderId: order.id, sellerId,
                    products: storePor,
                    price: pri,
                    payment_status: 'unpaid',
                    shippingInfo: 'Agriconnect Warehouse',
                    delivery_status: 'pending',  // Changed from 'pending' to 'pending'
                    date: tempDate
                }) 
            }

            await authOrderModel.insertMany(authorOrderData)
            for (let k = 0; k < cardId.length; k++) {
                await cardModel.findByIdAndDelete(cardId[k]) 
            }
   
            setTimeout(() => {
                this.paymentCheck(order.id)
            }, 15000)

            responseReturn(res, 200, {message: "Order Placed Success", orderId: order.id })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, {message: "Internal server error"})
        }
    }
    
    get_customer_dashboard_data = async(req, res) => {
        const { userId } = req.params 
    
        try {
            const recentOrders = await customerOrder.find({
                customerId: new ObjectId(userId) 
            }).sort({ createdAt: -1 }).limit(5)  // Sort by createdAt in descending order
            const pendingOrder = await customerOrder.find({
                customerId: new ObjectId(userId), delivery_status: 'pending'
             }).countDocuments()
             const totalOrder = await customerOrder.find({
                customerId: new ObjectId(userId)
             }).countDocuments()
             const cancelledOrder = await customerOrder.find({
                customerId: new ObjectId(userId), delivery_status: 'cancelled'
             }).countDocuments()
             responseReturn(res, 200, {
                recentOrders,
                pendingOrder,
                totalOrder,
                cancelledOrder
             })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, {message: "Internal server error"})
        } 
    }

    get_orders = async (req, res) => {
        const {customerId, status} = req.params

        try {
            let orders = []
            if (status !== 'all') {
                orders = await customerOrder.find({
                    customerId: new ObjectId(customerId),
                    delivery_status: status
                })
            } else {
                orders = await customerOrder.find({
                    customerId: new ObjectId(customerId)
                })
            }
            responseReturn(res, 200, {
                orders
            })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, {message: "Internal server error"})
        }
    }

    get_order_details = async (req, res) => {
        const {orderId} = req.params

        try {
            const order = await customerOrder.findById(orderId)
            responseReturn(res, 200, {
                order
            })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, {message: "Internal server error"})
        }
    }

    get_admin_orders = async(req, res) => {
        let {page, searchValue, parPage} = req.query
        page = parseInt(page)
        parPage = parseInt(parPage)

        const skipPage = parPage * (page - 1)

        try {
            if (searchValue) {
                // Implement search logic here
            } else {
                const orders = await customerOrder.aggregate([
                    {
                        $lookup: {
                            from: 'authororders',
                            localField: "_id",
                            foreignField: 'orderId',
                            as: 'suborder'
                        }
                    }
                ]).skip(skipPage).limit(parPage).sort({ createdAt: -1})

                const totalOrder = await customerOrder.aggregate([
                    {
                        $lookup: {
                            from: 'authororders',
                            localField: "_id",
                            foreignField: 'orderId',
                            as: 'suborder'
                        }
                    }
                ])

                responseReturn(res, 200, { orders, totalOrder: totalOrder.length })
            }
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, {message: "Internal server error"})
        } 
    }
  
    get_admin_order = async (req, res) => {
        const { orderId } = req.params
        try {
            const order = await customerOrder.aggregate([
                {
                    $match: {_id: new ObjectId(orderId)}
                },
                {
                    $lookup: {
                        from: 'authororders',
                        localField: "_id",
                        foreignField: 'orderId',
                        as: 'suborder'
                    }
                }
            ])
            responseReturn(res, 200, { order: order[0] })
        } catch (error) {
            console.log('get admin order details' + error.message)
            responseReturn(res, 500, {message: "Internal server error"})
        }
    }

    admin_order_status_update = async(req, res) => {
        const { orderId } = req.params
        const { status } = req.body

        try {
            await customerOrder.findByIdAndUpdate(orderId, {
                delivery_status : status
            })
            responseReturn(res, 200, {message: 'Order status change success'})
        } catch (error) {
            console.log('get admin status error' + error.message)
            responseReturn(res, 500, {message: 'Internal server error'})
        }
    }

    get_seller_orders = async (req, res) => {
        const {sellerId} = req.params
        let {page, searchValue, parPage} = req.query
        page = parseInt(page)
        parPage = parseInt(parPage)

        const skipPage = parPage * (page - 1)

        try {
            if (searchValue) {
                // Implement search logic here
            } else {
                const orders = await authOrderModel.find({
                    sellerId,
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
                const totalOrder = await authOrderModel.find({
                    sellerId
                }).countDocuments()
                responseReturn(res, 200, {orders, totalOrder})
            }
        } catch (error) {
            console.log('get seller Order error' + error.message)
            responseReturn(res, 500, {message: 'Internal server error'})
        }
    }

    get_seller_order = async (req, res) => {
        const { orderId } = req.params
        
        try {
            const order = await authOrderModel.findById(orderId)
            responseReturn(res, 200, { order })
        } catch (error) {
            console.log('get seller details error' + error.message)
            responseReturn(res, 500, {message: 'Internal server error'})
        }
    }

    seller_order_status_update = async(req, res) => {
        const {orderId} = req.params
        const { status } = req.body

        try {
            await authOrderModel.findByIdAndUpdate(orderId, {
                delivery_status: status
            })
            responseReturn(res, 200, {message: 'Order status updated successfully'})
        } catch (error) {
            console.log('get seller Order error' + error.message)
            responseReturn(res, 500, {message: 'Internal server error'})
        }
    }

    create_payment = async (req, res) => {
        const { price } = req.body
        try {
            const payment = await stripe.paymentIntents.create({
                amount: price * 100,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true
                }
            })
            responseReturn(res, 200, { clientSecret: payment.client_secret })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, {message: 'Payment creation failed'})
        }
    }

    order_confirm = async (req, res) => {
        const {orderId} = req.params
        try {
            await customerOrder.findByIdAndUpdate(orderId, { 
                payment_status: 'paid',
                delivery_status: 'pending'  // Ensure delivery status remains 'pending' after payment
            })
            await authOrderModel.updateMany({ orderId: new ObjectId(orderId)}, {
                payment_status: 'paid',
                delivery_status: 'pending'  // Ensure delivery status remains 'pending' after payment
            })
            const cuOrder = await customerOrder.findById(orderId)

            const auOrder = await authOrderModel.find({
                orderId: new ObjectId(orderId)
            })
             
            const time = moment(Date.now()).format('l')
            const splitTime = time.split('/')

            await myShopWallet.create({
                amount: cuOrder.price,
                month: splitTime[0],
                year: splitTime[2]
            })

            for (let i = 0; i < auOrder.length; i++) {
                 await sellerWallet.create({
                    sellerId: auOrder[i].sellerId.toString(),
                    amount: auOrder[i].price,
                    month: splitTime[0],
                    year: splitTime[2]
                 }) 
            }
            responseReturn(res, 200, {message: 'Order confirmed and payment processed successfully'}) 
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, {message: 'Error confirming order'}) 
        }

        //end method

        get_latest_customer_orders = async (req, res) => {
            try {
                const latestOrders = await customerOrder.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('customerId', 'name email')
    
                responseReturn(res, 200, { orders: latestOrders })
            } catch (error) {
                console.log(error.message)
                responseReturn(res, 500, { error: 'Internal server error' })
            }
        }
    
    }
}

module.exports = new orderController()