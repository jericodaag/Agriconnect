const adminModel = require('../models/adminModel')
const sellerModel = require('../models/sellerModel')
const sellerCustomerModel  = require('../models/chat/sellerCustomerModel')
const { responseReturn } = require('../utilities/response')
const bcrpty = require('bcrypt')
const { createToken } = require('../utilities/tokenCreate')
const cloudinary = require('cloudinary').v2
const formidable = require("formidable")

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

                // Configure and upload to cloudinary
                cloudinary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.api_key,
                    api_secret: process.env.api_secret,
                    secure: true
                })

                // Upload ID image
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