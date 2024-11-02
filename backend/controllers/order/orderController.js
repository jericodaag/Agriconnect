const authOrderModel = require('../../models/authOrder')
const customerOrder = require('../../models/customerOrder')
const myShopWallet = require('../../models/myShopWallet')
const sellerWallet = require('../../models/sellerWallet')
const cardModel = require('../../models/cardModel')
const productModel = require('../../models/productModel')
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
                    delivery_status: 'pending'
                })
                await authOrderModel.updateMany({
                    orderId: id
                },{
                    delivery_status: 'pending'
                })
            }
            return true
        } catch (error) {
            console.log(error)
        }
    }

    place_order = async (req, res) => {
        const { price, products, shipping_fee, shippingInfo, userId, payment_method } = req.body
        let authorOrderData = []
        let cardId = []
        const tempDate = moment(Date.now()).format('LLL')
        let customerOrderProduct = []
    
        // First loop to gather customer order products
        for (let i = 0; i < products.length; i++) {
            const pro = products[i].products
            for (let j = 0; j < pro.length; j++) {
                const tempCusPro = pro[j].productInfo;
                const productPrice = tempCusPro.price; // Get original price
                tempCusPro.quantity = pro[j].quantity;
                // Calculate total for this product
                tempCusPro.totalPrice = productPrice * pro[j].quantity;
                customerOrderProduct.push(tempCusPro);
                if (pro[j]._id) {
                    cardId.push(pro[j]._id);
                } 
            } 
        }
    
        try {
            const payment_status = payment_method === 'cod' ? 'unpaid' : 'pending';
            
            // Create customer order
            const order = await customerOrder.create({
                customerId: userId,
                shippingInfo,
                products: customerOrderProduct,
                price: price + shipping_fee,
                payment_status,
                delivery_status: 'pending',
                date: tempDate,
                payment_method
            })
    
            // Process seller orders with correct price calculation
            for (let i = 0; i < products.length; i++) {
                const pro = products[i].products
                const sellerId = products[i].sellerId
                let storePor = []
                let sellerOrderPrice = 0
    
                for (let j = 0; j < pro.length; j++) {
                    const tempPro = pro[j].productInfo
                    const quantity = pro[j].quantity
                    const productPrice = tempPro.price
                    
                    // Calculate correct price for this product
                    const productTotal = productPrice * quantity
                    sellerOrderPrice += productTotal
    
                    tempPro.quantity = quantity
                    tempPro.totalPrice = productTotal
                    storePor.push(tempPro)
                }
    
                authorOrderData.push({
                    orderId: order.id,
                    sellerId,
                    products: storePor,
                    price: sellerOrderPrice, // Use the correctly calculated price
                    payment_status,
                    shippingInfo: 'Agriconnect Warehouse',
                    delivery_status: 'pending',
                    date: tempDate,
                    payment_method
                })
            }
    
            // Insert seller orders
            await authOrderModel.insertMany(authorOrderData)

        // Delete cart items
        for (let k = 0; k < cardId.length; k++) {
            await cardModel.findByIdAndDelete(cardId[k]) 
        }

        // Update product sales data
        for (let product of customerOrderProduct) {
            await productModel.findByIdAndUpdate(product._id, {
                $inc: { 
                    salesCount: product.quantity, 
                    stock: -product.quantity 
                },
                $set: { lastSaleDate: new Date() },
                $push: { 
                    inventoryHistory: { 
                        date: new Date(), 
                        quantity: product.quantity,
                        type: 'sale'
                    } 
                }
            });
        }

        // Handle response based on payment method
        if (payment_method === 'cod') {
            responseReturn(res, 200, { 
                message: "Order Placed Successfully", 
                orderId: order.id 
            });
        } else {
            // For other payment methods, check payment status after delay
            setTimeout(() => {
                this.paymentCheck(order.id)
            }, 15000)
            responseReturn(res, 200, { 
                message: "Order Placed Success", 
                orderId: order.id 
            });
        }
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
            }).sort({ createdAt: -1 }).limit(5)
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
                // Fetch all orders, sorted by creation date
                const allOrders = await customerOrder.aggregate([
                    {
                        $lookup: {
                            from: 'authororders',
                            localField: "_id",
                            foreignField: 'orderId',
                            as: 'suborder'
                        }
                    }
                ]).sort({ createdAt: -1 })
    
                // Get the total count of orders
                const totalOrder = allOrders.length
    
                // Slice the orders array to get the required page
                const orders = allOrders.slice(skipPage, skipPage + parPage)
    
                responseReturn(res, 200, { orders, totalOrder })
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
        const { orderId } = req.params;
        const { delivery_status, payment_status } = req.body;
    
        try {
            // Get the original order to check if payment status is changing from unpaid to paid
            const originalOrder = await customerOrder.findById(orderId);
            const isPaymentStatusChangingToPaid = originalOrder.payment_status === 'unpaid' && payment_status === 'paid';
    
            // Update main order
            await customerOrder.findByIdAndUpdate(orderId, {
                delivery_status,
                payment_status
            });
    
            // Update related authorOrders
            await authOrderModel.updateMany(
                { orderId: new ObjectId(orderId) },
                {
                    delivery_status,
                    payment_status
                }
            );
    
            // If payment status is changing from unpaid to paid, create wallet entries
            if (isPaymentStatusChangingToPaid) {
                const cuOrder = await customerOrder.findById(orderId);
                const auOrder = await authOrderModel.find({
                    orderId: new ObjectId(orderId)
                });
                 
                const time = moment(Date.now()).format('l');
                const splitTime = time.split('/');
    
                // Create entry in myShopWallet
                await myShopWallet.create({
                    amount: cuOrder.price,
                    month: splitTime[0],
                    year: splitTime[2],
                    payment_method: cuOrder.payment_method // Add payment method
                });
    
                // Create entries in sellerWallet for each seller
                for (let i = 0; i < auOrder.length; i++) {
                    await sellerWallet.create({
                        sellerId: auOrder[i].sellerId.toString(),
                        amount: auOrder[i].price,
                        month: splitTime[0],
                        year: splitTime[2],
                        payment_method: auOrder[i].payment_method // Add payment method
                    });
                }
            }
    
            responseReturn(res, 200, { message: 'Order status updated successfully' });
        } catch (error) {
            console.log('admin status update error:', error.message);
            responseReturn(res, 500, { message: 'Internal server error' });
        }
    };

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
                delivery_status: 'pending'
            })
            await authOrderModel.updateMany({ orderId: new ObjectId(orderId)}, {
                payment_status: 'paid',
                delivery_status: 'pending'
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
    }

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

module.exports = new orderController()