const customerModel = require('../../models/customerModel')
const { responseReturn } = require('../../utilities/response')
const bcrypt = require('bcrypt')
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel')
const { createToken } = require('../../utilities/tokenCreate')
const crypto = require('crypto')
const { sendCustomerResetEmail } = require('../../utilities/emailService') // Add this line

class customerAuthController {
    // Existing register method
    customer_register = async(req, res) => {
        const {name, email, password } = req.body
        try {
            const customer = await customerModel.findOne({email}) 
            if (customer) {
                return responseReturn(res, 404, { error : 'Email Already Exists' })
            }
            
            const createCustomer = await customerModel.create({
                name: name.trim(),
                email: email.trim(),
                password: await bcrypt.hash(password, 10),
                method: 'menualy'
            })
            
            await sellerCustomerModel.create({
                myId: createCustomer.id
            })
            
            const token = await createToken({
                id: createCustomer.id,
                name: createCustomer.name,
                email: createCustomer.email,
                method: createCustomer.method 
            })
            
            res.cookie('customerToken', token, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            })
            
            return responseReturn(res, 201, { message: "User Register Success", token })
        } catch (error) {
            console.error('Register error:', error)
            return responseReturn(res, 500, { error: 'Internal server error' })
        }
    }

    // Existing login method
    customer_login = async(req, res) => {
        const { email, password } = req.body
        try {
            const customer = await customerModel.findOne({email}).select('+password')
            if (!customer) {
                return responseReturn(res, 404, { error: 'Email Not Found' })
            }
            
            const match = await bcrypt.compare(password, customer.password)
            if (!match) {
                return responseReturn(res, 404, { error: 'Password Wrong' })
            }
            
            const token = await createToken({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                method: customer.method 
            })
            
            res.cookie('customerToken', token, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            })
            
            return responseReturn(res, 201, { message: 'User Login Success', token })
        } catch (error) {
            console.error('Login error:', error)
            return responseReturn(res, 500, { error: 'Internal server error' })
        }
    }

    // Updated logout method
    customer_logout = async(req, res) => {
        try {
            res.cookie('customerToken', '', {
                expires: new Date(0)
            })
            return responseReturn(res, 200, { message: 'Logout Success' })
        } catch (error) {
            console.error('Logout error:', error)
            return responseReturn(res, 500, { error: 'Internal server error' })
        }
    }

    // New forgot password method
    forgot_password = async(req, res) => {
        const { email } = req.body;
        try {
            const customer = await customerModel.findOne({ email });
            if (!customer) {
                return responseReturn(res, 404, { error: 'No account found with this email' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            customer.resetPasswordToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');
            customer.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;

            await customer.save();

            try {
                await sendCustomerResetEmail(
                    customer.email,
                    customer.name,
                    resetToken
                );
                return responseReturn(res, 200, {
                    message: 'Password reset instructions sent to your email'
                });
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                // Reset the token if email fails
                customer.resetPasswordToken = undefined;
                customer.resetPasswordExpires = undefined;
                await customer.save();
                return responseReturn(res, 500, { error: 'Failed to send reset email' });
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            return responseReturn(res, 500, { error: 'Internal server error' });
        }
    }

    // New reset password method
    reset_password = async(req, res) => {
        const { token, password } = req.body
        try {
            const hashedToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex')

            const customer = await customerModel.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            })

            if (!customer) {
                return responseReturn(res, 400, {
                    error: 'Invalid or expired reset token'
                })
            }

            customer.password = await bcrypt.hash(password, 10)
            customer.resetPasswordToken = undefined
            customer.resetPasswordExpires = undefined
            await customer.save()

            return responseReturn(res, 200, {
                message: 'Password reset successful'
            })
        } catch (error) {
            console.error('Reset password error:', error)
            return responseReturn(res, 500, { error: 'Internal server error' })
        }
    }
}

module.exports = new customerAuthController()