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
    // Existing Stripe methods remain unchanged
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
    
            // Get pending withdrawals
            const pendingWithdrows = await withdrowRequest.find({
                sellerId,
                status: 'pending'
            });
    
            // Get successful withdrawals
            const successWithdrows = await withdrowRequest.find({
                sellerId,
                status: 'success'
            });
    
            // Calculate withdrawn amounts by payment method
            const stripeWithdrawn = successWithdrows
                .filter(w => w.payment_method === 'stripe')
                .reduce((sum, w) => sum + w.amount, 0);
    
            const codWithdrawn = successWithdrows
                .filter(w => w.payment_method === 'cod')
                .reduce((sum, w) => sum + w.amount, 0);
    
            // Calculate pending amounts by payment method
            const stripePending = pendingWithdrows
                .filter(w => w.payment_method === 'stripe')
                .reduce((sum, w) => sum + w.amount, 0);
    
            const codPending = pendingWithdrows
                .filter(w => w.payment_method === 'cod')
                .reduce((sum, w) => sum + w.amount, 0);
    
            // Get total amounts
            const stripeTotalAmount = stripeSales[0]?.amount || 0;
            const codTotalAmount = codSales[0]?.amount || 0;
    
            // Calculate available amounts after withdrawals and pending
            const stripeAvailable = stripeTotalAmount - stripeWithdrawn - stripePending;
            const codAvailable = codTotalAmount - codWithdrawn - codPending;
    
            const salesData = {
                total: stripeTotalAmount + codTotalAmount,
                stripe: { 
                    amount: stripeAvailable, // Use available amount instead of total
                    count: stripeSales[0]?.count || 0,
                    total: stripeTotalAmount, // Keep track of original total
                    withdrawn: stripeWithdrawn,
                    pending: stripePending
                },
                cod: { 
                    amount: codAvailable, // Use available amount instead of total
                    count: codSales[0]?.count || 0,
                    total: codTotalAmount, // Keep track of original total
                    withdrawn: codWithdrawn,
                    pending: codPending
                }
            };
    
            const totalAmount = salesData.total;
            const pendingAmount = stripePending + codPending;
            const withdrowAmount = stripeWithdrawn + codWithdrawn;
            const availableAmount = stripeAvailable + codAvailable;
    
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
        const { amount, sellerId, payment_method } = req.body;

        try {
            // Generate unique withdrawal code for COD requests
            const withdrawalCode = payment_method === 'cod' 
                ? `WD${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
                : undefined;

            const withdrawal = await withdrowRequest.create({
                sellerId,
                amount: parseInt(amount),
                payment_method,
                withdrawalCode
            });

            let message = 'Withdrawal request submitted successfully';
            if (withdrawalCode) {
                message = `Withdrawal request submitted. Your withdrawal code is: ${withdrawalCode}`;
            }

            responseReturn(res, 200, { withdrawal, message });
        } catch (error) {
            console.log('withdrawal request error:', error.message);
            responseReturn(res, 500, { message: 'Internal server error' });
        }
    }

    get_payment_request = async (req, res) => {
        try {
            const withdrowalRequest = await withdrowRequest.find({ 
                status: 'pending'
            }).sort({ createdAt: -1 });

            responseReturn(res, 200, { withdrowalRequest });
        } catch (error) {
            responseReturn(res, 500, { message: 'Internal Server Error' });
        }
    }

    payment_request_confirm = async (req, res) => {
        const { paymentId, withdrawalCode } = req.body;
        
        try {
            const payment = await withdrowRequest.findById(paymentId);
            
            if (!payment) {
                return responseReturn(res, 404, { message: 'Payment request not found' });
            }

            // Verify withdrawal code for COD payments
            if (payment.payment_method === 'cod') {
                if (!withdrawalCode || withdrawalCode !== payment.withdrawalCode) {
                    return responseReturn(res, 400, { message: 'Invalid withdrawal code' });
                }
            } else {
                // Process Stripe payment
                const { stripeId } = await stripeModel.findOne({
                    sellerId: new ObjectId(payment.sellerId)
                });

                if (stripeId) {
                    await stripe.transfers.create({
                        amount: payment.amount * 100,
                        currency: 'usd',
                        destination: stripeId
                    });
                }
            }

            // Update payment status
            const updatedPayment = await withdrowRequest.findByIdAndUpdate(
                paymentId, 
                { 
                    status: 'success',
                    confirmedAt: new Date()
                },
                { new: true }
            );
            
            responseReturn(res, 200, {
                payment: updatedPayment,
                message: 'Payment request confirmed successfully'
            });
        } catch (error) {
            console.log('payment confirm error:', error.message);
            responseReturn(res, 500, { message: 'Internal server error' });
        }
    }

    get_withdrawal_history = async (req, res) => {
        try {
            const withdrawals = await withdrowRequest.find({})
                .sort({ createdAt: -1 });
            
            responseReturn(res, 200, { withdrawals });
        } catch (error) {
            console.log('get history error:', error.message);
            responseReturn(res, 500, { message: 'Internal server error' });
        }
    }
}

module.exports = new paymentController()