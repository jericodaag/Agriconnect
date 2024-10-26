const adminModel = require('../models/adminModel')
const sellerModel = require('../models/sellerModel')
const sellerCustomerModel = require('../models/chat/sellerCustomerModel')
const { responseReturn } = require('../utilities/response')
const bcrpty = require('bcrypt')
const { createToken } = require('../utilities/tokenCreate')
const { sendResetPasswordEmail } = require('../utilities/emailService')
const cloudinary = require('cloudinary').v2
const formidable = require("formidable")
const crypto = require('crypto')

class authControllers {
    admin_login = async(req,res) => {
        const {email,password} = req.body
        try {
            const admin = await adminModel.findOne({email}).select('+password')
            if (admin) {
                const match = await bcrpty.compare(password, admin.password)
                if (match) {
                    const token = await createToken({
                        id : admin.id,
                        role : admin.role
                    })
                    res.cookie('accessToken',token,{
                        expires : new Date(Date.now() + 7*24*60*60*1000 )
                    }) 
                    responseReturn(res,200,{token,message: "Login Success"})
                } else {
                    responseReturn(res,404,{error: "Password Wrong"})
                }
            } else {
                responseReturn(res,404,{error: "Email not Found"})
            }
        } catch (error) {
            responseReturn(res,500,{error: error.message})
        }
    }

    seller_login = async(req,res) => {
        const {email,password} = req.body
        try {
            const seller = await sellerModel.findOne({email}).select('+password')
            if (seller) {
                const match = await bcrpty.compare(password, seller.password)
                if (match) {
                    const token = await createToken({
                        id : seller.id,
                        role : seller.role
                    })
                    res.cookie('accessToken',token,{
                        expires : new Date(Date.now() + 7*24*60*60*1000 )
                    }) 
                    responseReturn(res,200,{token,message: "Login Success"})
                } else {
                    responseReturn(res,404,{error: "Password Wrong"})
                }
            } else {
                responseReturn(res,404,{error: "Email not Found"})
            }
        } catch (error) {
            responseReturn(res,500,{error: error.message})
        }
    }

    seller_register = async(req, res) => {
        const form = formidable({ multiples: true })
        
        form.parse(req, async(err, fields, files) => {
            if (err) {
                return responseReturn(res, 500, { error: 'Form parsing failed' })
            }

            const { email, name, password, shopName, division, district, idType, idNumber } = fields

            try {
                const getUser = await sellerModel.findOne({email})
                if (getUser) {
                    return responseReturn(res,404,{error: 'Email Already Exists'})
                }

                cloudinary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.api_key,
                    api_secret: process.env.api_secret,
                    secure: true
                })

                let idImageUrl = ''
                if (files.idImage) {
                    const result = await cloudinary.uploader.upload(files.idImage.filepath, {
                        folder: 'seller_ids'
                    })
                    idImageUrl = result.url
                }

                const seller = await sellerModel.create({
                    name,
                    email,
                    password: await bcrpty.hash(password, 10),
                    method: 'manually',
                    shopInfo: {
                        shopName,
                        division,
                        district
                    },
                    identityVerification: {
                        idType,
                        idNumber,
                        idImage: idImageUrl,
                        verificationStatus: 'pending'
                    }
                })

                await sellerCustomerModel.create({
                    myId: seller.id
                })

                const token = await createToken({ id: seller.id, role: seller.role })
                res.cookie('accessToken', token, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                })

                const userInfo = {
                    id: seller.id,
                    name: seller.name,
                    email: seller.email,
                    role: seller.role,
                    status: seller.status,
                    payment: seller.payment,
                    image: seller.image,
                    shopInfo: seller.shopInfo,
                    identityVerification: seller.identityVerification
                }

                responseReturn(res, 201, { token, message: 'Register Success', userInfo })
            } catch (error) {
                console.error('Registration error:', error)
                responseReturn(res, 500, { error: 'Internal Server Error' })
            }
        })
    }

    getUser = async (req, res) => {
        const {id, role} = req;

        try {
            if (role === 'admin') {
                const user = await adminModel.findById(id)
                responseReturn(res, 200, {userInfo : user})
            }else {
                const seller = await sellerModel.findById(id)
                responseReturn(res, 200, {userInfo : seller})
            }
        } catch (error) {
            responseReturn(res,500,{error: 'Internal Server Error'})
        }
    }

    profile_image_upload = async(req, res) => {
        const {id} = req
        const form = formidable({ multiples: true })
        form.parse(req, async(err,_,files) => {
                cloudinary.config({
                cloud_name: process.env.cloud_name,
                api_key: process.env.api_key,
                api_secret: process.env.api_secret,
                secure: true
            })
            const { image } = files

            try {
                const result = await cloudinary.uploader.upload(image.filepath, { folder: 'profile'})
                if (result) {
                    await sellerModel.findByIdAndUpdate(id, {
                        image: result.url
                    }) 
                    const userInfo = await sellerModel.findById(id)
                    responseReturn(res, 201,{ message : 'Profile Image Upload Successfully',userInfo})
                } else {
                    responseReturn(res, 404,{ error : 'Image Upload Failed'})
                }
            } catch (error) {
                responseReturn(res, 500,{ error : error.message })
            }
        })
    }

    profile_info_add = async (req, res) => {
       const { shopName, division, district, sub_district } = req.body;
       const { id } = req;

       try {
        const updatedSeller = await sellerModel.findByIdAndUpdate(id, {
            shopInfo: {
                shopName,
                division,
                district,
                sub_district
            }
        }, { new: true });

        if (!updatedSeller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        const userInfo = {
            id: updatedSeller.id,
            name: updatedSeller.name,
            email: updatedSeller.email,
            role: updatedSeller.role,
            status: updatedSeller.status,
            payment: updatedSeller.payment,
            image: updatedSeller.image,
            shopInfo: updatedSeller.shopInfo,
            identityVerification: updatedSeller.identityVerification
        };

        responseReturn(res, 200, { message: 'Profile info updated successfully', userInfo });
       } catch (error) {
        responseReturn(res, 500, { error: error.message });
       }
    }

    renew_seller_id = async(req, res) => {
        const { id } = req;
        const form = formidable({ multiples: true });
        
        form.parse(req, async(err, fields, files) => {
            if (err) {
                return responseReturn(res, 500, { error: 'Form parsing failed' });
            }

            try {
                const seller = await sellerModel.findById(id);
                if (!seller) {
                    return responseReturn(res, 404, { error: 'Seller not found' });
                }

                const renewalHistory = {
                    previousImage: seller.identityVerification?.idImage,
                    renewalDate: new Date(),
                    reason: fields.reason,
                    previousStatus: seller.identityVerification?.verificationStatus,
                    previousIdNumber: seller.identityVerification?.idNumber
                };

                cloudinary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.api_key,
                    api_secret: process.env.api_secret,
                    secure: true
                });

                let newIdImageUrl = '';
                if (files.idImage) {
                    const result = await cloudinary.uploader.upload(files.idImage.filepath, {
                        folder: 'seller_ids'
                    });
                    newIdImageUrl = result.url;
                }

                const updatedSeller = await sellerModel.findByIdAndUpdate(
                    id,
                    {
                        $push: { 
                            'identityVerification.renewalHistory': renewalHistory 
                        },
                        $set: {
                            'identityVerification.idImage': newIdImageUrl,
                            'identityVerification.idType': fields.idType,
                            'identityVerification.idNumber': fields.idNumber,
                            'identityVerification.verificationStatus': 'pending_renewal',
                            'identityVerification.rejectionReason': ''
                        }
                    },
                    { new: true }
                );

                const userInfo = {
                    id: updatedSeller.id,
                    name: updatedSeller.name,
                    email: updatedSeller.email,
                    role: updatedSeller.role,
                    status: updatedSeller.status,
                    payment: updatedSeller.payment,
                    image: updatedSeller.image,
                    shopInfo: updatedSeller.shopInfo,
                    identityVerification: updatedSeller.identityVerification
                };

                responseReturn(res, 200, { 
                    message: 'ID renewal submitted successfully', 
                    userInfo 
                });
            } catch (error) {
                responseReturn(res, 500, { error: error.message });
            }
        });
    }

    verify_seller_id = async(req, res) => {
        const { sellerId } = req.params;
        try {
            const seller = await sellerModel.findByIdAndUpdate(
                sellerId,
                {
                    $set: {
                        'identityVerification.verificationStatus': 'verified',
                        status: 'active'
                    }
                },
                { new: true }
            );
            
            if (!seller) {
                return responseReturn(res, 404, { error: 'Seller not found' });
            }

            responseReturn(res, 200, { 
                message: 'ID verification successful', 
                seller 
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    reject_seller_id = async(req, res) => {
        const { sellerId } = req.params;
        const { reason } = req.body;
        
        if (!reason) {
            return responseReturn(res, 400, { error: 'Rejection reason is required' });
        }

        try {
            const seller = await sellerModel.findByIdAndUpdate(
                sellerId,
                {
                    $set: {
                        'identityVerification.verificationStatus': 'rejected',
                        'identityVerification.rejectionReason': reason,
                        status: 'pending'
                    }
                },
                { new: true }
            );

            if (!seller) {
                return responseReturn(res, 404, { error: 'Seller not found' });
            }

            responseReturn(res, 200, { 
                message: 'ID verification rejected', 
                seller 
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    forgot_password = async(req, res) => {
        const { email } = req.body;

        try {
            const seller = await sellerModel.findOne({ email });
            if (!seller) {
                return responseReturn(res, 404, { error: 'No account found with this email' });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            seller.passwordReset = {
                token: resetToken,
                expiresAt: tokenExpiry,
                requested: true,
                status: 'pending',
                requestDate: new Date()
            };

            await seller.save();

            // Send reset email
            try {
                await sendResetPasswordEmail(seller.email, seller.name, resetToken);
                responseReturn(res, 200, { 
                    message: 'Password reset instructions sent to your email' 
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                seller.passwordReset = undefined;
                await seller.save();
                return responseReturn(res, 500, { error: 'Failed to send reset email' });
            }
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    verify_reset_token = async(req, res) => {
        const { token } = req.params;
        console.log('Verifying token:', token);
    
        try {
            const seller = await sellerModel.findOne({
                'passwordReset.token': token,
                'passwordReset.expiresAt': { $gt: Date.now() }
            });
    
            console.log('Token verification result:', {
                tokenFound: !!seller,
                expiryTime: seller?.passwordReset?.expiresAt
            });
    
            if (!seller) {
                return responseReturn(res, 400, { valid: false });
            }
    
            responseReturn(res, 200, { valid: true });
        } catch (error) {
            console.error('Token verification error:', error);
            responseReturn(res, 500, { error: error.message });
        }
    };

    reset_password = async(req, res) => {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return responseReturn(res, 400, { error: 'New password is required' });
        }

        try {
            const seller = await sellerModel.findOne({
                'passwordReset.token': token,
                'passwordReset.expiresAt': { $gt: Date.now() }
            }).select('+password');

            if (!seller) {
                return responseReturn(res, 400, { error: 'Invalid or expired reset token' });
            }

            // Hash and update password
            seller.password = await bcrpty.hash(newPassword, 10);
            
            // Clear reset token data
            seller.passwordReset = {
                requested: false,
                token: null,
                expiresAt: null,
                status: 'completed',
                requestDate: null
            };

            await seller.save();

            responseReturn(res, 200, { message: 'Password reset successful' });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    get_password_reset_requests = async(req, res) => {
        try {
            const requests = await sellerModel.find({
                'passwordReset.requested': true,
                'passwordReset.status': 'pending'
            })
            .select('name email passwordReset')
            .sort({ 'passwordReset.requestDate': -1 });

            responseReturn(res, 200, { requests });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    get_seller_reset_status = async(req, res) => {
        const { sellerId } = req.params;

        try {
            const seller = await sellerModel.findById(sellerId)
                .select('name email passwordReset');

            if (!seller) {
                return responseReturn(res, 404, { error: 'Seller not found' });
            }

            responseReturn(res, 200, { resetStatus: seller.passwordReset });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    approve_password_reset = async(req, res) => {
        const { sellerId } = req.params;
        const { adminId } = req.body;

        try {
            const seller = await sellerModel.findById(sellerId);
            
            if (!seller) {
                return responseReturn(res, 404, { error: 'Seller not found' });
            }

            if (!seller.passwordReset?.requested) {
                return responseReturn(res, 400, { error: 'No password reset request found' });
            }

            if (seller.passwordReset?.status !== 'pending') {
                return responseReturn(res, 400, { error: 'Request has already been processed' });
            }

            // Update reset request status
            seller.passwordReset.status = 'approved';

            // Generate new token for the actual reset
            const resetToken = crypto.randomBytes(32).toString('hex');
            seller.passwordReset.token = resetToken;
            seller.passwordReset.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await seller.save();

            // Send reset email with token
            try {
                await sendResetPasswordEmail(seller.email, seller.name, resetToken);
                responseReturn(res, 200, {
                    message: 'Password reset request approved and email sent',
                    seller
                });
            } catch (emailError) {
                console.error('Failed to send reset email:', emailError);
                return responseReturn(res, 500, { error: 'Failed to send reset email' });
            }
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    reject_password_reset = async(req, res) => {
        const { sellerId } = req.params;
        const { reason, adminId } = req.body;

        if (!reason) {
            return responseReturn(res, 400, { error: 'Rejection reason is required' });
        }

        try {
            const seller = await sellerModel.findById(sellerId);

            if (!seller) {
                return responseReturn(res, 404, { error: 'Seller not found' });
            }

            if (!seller.passwordReset?.requested) {
                return responseReturn(res, 400, { error: 'No password reset request found' });
            }

            if (seller.passwordReset?.status !== 'pending') {
                return responseReturn(res, 400, { error: 'Request has already been processed' });
            }

            // Update reset request status
            seller.passwordReset = {
                ...seller.passwordReset,
                status: 'rejected',
                rejectionReason: reason,
                requested: false,
                token: null,
                expiresAt: null
            };

            await seller.save();

            responseReturn(res, 200, {
                message: 'Password reset request rejected',
                seller
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    logout = async (req, res) => {
        try {
            res.cookie('accessToken',null,{
                expires : new Date(Date.now()),
                httpOnly: true
            })
            responseReturn(res, 200,{ message : 'logout Success' })
        } catch (error) {
            responseReturn(res, 500,{ error : error.message })
        }
    }
}

module.exports = new authControllers()