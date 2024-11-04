const sellerModel = require('../../models/sellerModel')
const stripeModel = require('../../models/stripeModel')
const sellerWallet = require('../../models/sellerWallet')
const withdrowRequest = require('../../models/withdrowRequest') 
const authOrder = require('../../models/authOrder')
const {v4: uuidv4} = require('uuid')
const { responseReturn } = require('../../utilities/response')
const { mongo: {ObjectId}} = require('mongoose')
const stripe = require('stripe')('sk_test_51Phb3kLs4PUYCdHCPpJ794IsxnhwDIo16hMNqRXV0PdupEoBpqQcyjTejSQvxzHItA9mOb3eQs4EMW21dyJA7MHU00FKo5wKjB')

class paymentController {
    create_stripe_connect_account = async(req,res) => {
        const {id} = req 
        const uid = uuidv4()

        try {
            const stripeInfo = await stripeModel.findOne({ sellerId: id  })

            if (stripeInfo) {
                await stripeModel.deleteOne({ sellerId: id })
                const account = await stripe.accounts.create({ type: 'express' }) 

                const accountLink = await stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: 'http://localhost:3001/refresh',
                    return_url:  `http://localhost:3001/success?activeCode=${uid}`,
                    type: 'account_onboarding'
                })
                await stripeModel.create({
                    sellerId: id,
                    stripeId: account.id,
                    code: uid
                })
                responseReturn(res,201,{url:accountLink.url })
            } else {
                const account = await stripe.accounts.create({ type: 'express' }) 

                const accountLink = await stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: 'http://localhost:3001/refresh',
                    return_url:  `http://localhost:3001/success?activeCode=${uid}`,
                    type: 'account_onboarding'
                })
                await stripeModel.create({
                    sellerId: id,
                    stripeId: account.id,
                    code: uid
                })
                responseReturn(res,201,{url:accountLink.url })
            }
        } catch (error) {
            console.log('stripe connect account error' + error.message)
        }
    }

    active_stripe_connect_account = async (req, res) => {
        const {activeCode} = req.params 
        const {id} = req

        try {
            const userStripeInfo = await stripeModel.findOne({ code: activeCode })

            if (userStripeInfo) {
                await sellerModel.findByIdAndUpdate(id,{  
                    payment: 'active'
                })
                responseReturn(res, 200, {message: 'payment Active'})
            } else {
                responseReturn(res, 404, {message: 'payment Active Fails'})
            } 
        } catch (error) {
            responseReturn(res, 500, {message: 'Internal Server Error'})
        } 
    }

    sumAmount = (data) => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum = sum + data[i].amount;            
        }
        return sum
    }  

    get_seller_payment_details = async (req, res) => {
        const {sellerId} = req.params
        
        try {
            // Get all stripe payments
            const stripeSales = await authOrder.aggregate([
                {
                    $match: { 
                        sellerId: new ObjectId(sellerId),
                        payment_status: 'paid',
                        payment_method: 'stripe'
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: { $sum: '$price' },
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Get all COD payments
            const codSales = await authOrder.aggregate([
                {
                    $match: { 
                        sellerId: new ObjectId(sellerId),
                        payment_status: 'paid',
                        payment_method: 'cod'
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: { $sum: '$price' },
                        count: { $sum: 1 }
                    }
                }
            ]);

            const salesData = {
                total: 0,
                stripe: { 
                    amount: stripeSales[0]?.amount || 0, 
                    count: stripeSales[0]?.count || 0 
                },
                cod: { 
                    amount: codSales[0]?.amount || 0, 
                    count: codSales[0]?.count || 0 
                }
            };

            salesData.total = salesData.stripe.amount + salesData.cod.amount;

            // Get pending withdrawals
            const pendingWithdrows = await withdrowRequest.find({
                $and: [
                    {
                        sellerId: {
                            $eq: sellerId
                        }
                    },
                    {
                        status: {
                            $eq: 'pending'
                        }
                    }
                ]
            });

            // Get successful withdrawals
            const successWithdrows = await withdrowRequest.find({
                $and: [
                    {
                        sellerId: {
                            $eq: sellerId
                        }
                    },
                    {
                        status: {
                            $eq: 'success'
                        }
                    }
                ]
            });

            const pendingAmount = this.sumAmount(pendingWithdrows);
            const withdrowAmount = this.sumAmount(successWithdrows);
            
            // Total amount is all paid sales
            const totalAmount = salesData.total;
            
            // Available amount is only from Stripe payments minus pending and withdrawn
            const availableAmount = salesData.stripe.amount - (pendingAmount + withdrowAmount);

            responseReturn(res, 200, {
                totalAmount,
                pendingAmount,
                withdrowAmount,
                availableAmount,
                pendingWithdrows,
                successWithdrows,
                salesData
            });
            
        } catch (error) {
            console.log(error.message);
            responseReturn(res, 500, { message: 'Internal server error' });
        } 
    }

    withdrowal_request = async (req, res) => {
        const {amount, sellerId} = req.body

        try {
            const withdrowal = await withdrowRequest.create({
                sellerId,
                amount: parseInt(amount),
                payment_method: 'stripe'
            })
            responseReturn(res, 200,{ withdrowal, message: 'Withdrawal Request Sent'})
        } catch (error) {
            responseReturn(res, 500,{ message: 'Internal Server Error'})
        }
    }

    get_payment_request = async (req, res) => {
        try {
            const withdrowalRequest = await withdrowRequest.find({ status: 'pending'})
            responseReturn(res, 200, {withdrowalRequest })
        } catch (error) {
            responseReturn(res, 500,{ message: 'Internal Server Error'})
        }
    }

    payment_request_confirm = async (req, res) => {
        const {paymentId} = req.body 
        try {
            const payment = await withdrowRequest.findById(paymentId)
            const {stripeId} = await stripeModel.findOne({
                sellerId: new ObjectId(payment.sellerId)
            })

            await stripe.transfers.create({
                amount: payment.amount * 100,
                currency: 'usd',
                destination: stripeId
            })
             
            await withdrowRequest.findByIdAndUpdate(paymentId, {status: 'success'})
            responseReturn(res, 200, {payment, message: 'Request Confirm Success'})

        } catch (error) {   
            responseReturn(res, 500,{ message: 'Internal Server Error'})
        }
    }
}

module.exports = new paymentController()