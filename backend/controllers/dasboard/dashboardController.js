const { responseReturn } = require("../../utilities/response") 
const myShopWallet = require('../../models/myShopWallet')
const productModel = require('../../models/productModel')
const customerOrder = require('../../models/customerOrder')
const sellerModel = require('../../models/sellerModel') 
const adminSellerMessage = require('../../models/chat/adminSellerMessage') 
const sellerWallet = require('../../models/sellerWallet') 
const authOrder = require('../../models/authOrder') 
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMessage') 
const bannerModel = require('../../models/bannerModel') 
const { mongo: {ObjectId}} = require('mongoose')
const cloudinary = require('cloudinary').v2
const formidable = require("formidable")

class dashboardController {
    get_admin_dashboard_data = async(req, res) => {
        const {id} = req 
        try {
            const totalSale = await myShopWallet.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAmount: {$sum: '$amount'}
                    }
                }
            ])

            const totalProduct = await productModel.find({}).countDocuments()
            const totalOrder = await customerOrder.find({}).countDocuments()
            const totalSeller = await sellerModel.find({}).countDocuments()
            const messages = await adminSellerMessage.find({}).limit(3)
            const recentOrders = await customerOrder.find({}).limit(5)

            // Generate chart data
            const currentYear = new Date().getFullYear()
            const chartData = await customerOrder.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(currentYear, 0, 1), $lt: new Date(currentYear + 1, 0, 1) }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$price" }
                    }
                },
                { $sort: { _id: 1 } }
            ])

            const sellerChartData = await sellerModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(currentYear, 0, 1), $lt: new Date(currentYear + 1, 0, 1) }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        totalSellers: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])

            const formattedChartData = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                totalOrders: 0,
                totalRevenue: 0,
                totalSellers: 0
            }))

            chartData.forEach(data => {
                formattedChartData[data._id - 1].totalOrders = data.totalOrders
                formattedChartData[data._id - 1].totalRevenue = data.totalRevenue
            })

            sellerChartData.forEach(data => {
                formattedChartData[data._id - 1].totalSellers = data.totalSellers
            })

            // Get product status counts and calculate percentages
            const productStatusCounts = await customerOrder.aggregate([
                {
                    $group: {
                        _id: "$delivery_status",
                        count: { $sum: 1 }
                    }
                }
            ])

            const totalStatusCount = productStatusCounts.reduce((sum, status) => sum + status.count, 0)

            const formattedProductStatusCounts = {
                pending: 0,
                processing: 0,
                warehouse: 0,
                placed: 0,
                cancelled: 0
            }

            productStatusCounts.forEach(status => {
                if (formattedProductStatusCounts.hasOwnProperty(status._id)) {
                    formattedProductStatusCounts[status._id] = (status.count / totalStatusCount) * 100
                }
            })

            responseReturn(res, 200, {
                totalProduct,
                totalOrder,
                totalSeller,
                messages,
                recentOrders,
                totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
                chartData: formattedChartData,
                productStatusCounts: formattedProductStatusCounts
            })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, { error: error.message })
        }
    }

    get_seller_dashboard_data = async (req, res) => {
        const {id} = req 
        try {
            // Calculate total sales from all orders (both COD and Stripe)
            const totalSales = await authOrder.aggregate([
                {
                    $match: { 
                        sellerId: new ObjectId(id)
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$price' }
                    }
                }
            ])
    
            const totalProduct = await productModel.find({ 
                sellerId: new ObjectId(id) 
            }).countDocuments()
            
            const totalOrder = await authOrder.find({
                sellerId: new ObjectId(id) 
            }).countDocuments()
    
            const totalPendingOrder = await authOrder.find({
                $and: [
                    {
                        sellerId: {
                            $eq: new ObjectId(id)
                        }
                    },
                    {
                        delivery_status: {
                            $eq: 'pending'
                        }
                    }
                ]
            }).countDocuments()
    
            const messages = await sellerCustomerMessage.find({
                $or: [
                    {
                        senderId: {
                            $eq: id
                        } 
                    },{
                        receverId: {
                            $eq: id
                        }
                    }
                ]
            }).limit(3)   
    
            const recentOrders = await authOrder.find({
                sellerId: new ObjectId(id)
            }).limit(5)
    
            // Generate chart data
            const currentYear = new Date().getFullYear()
            const chartData = await authOrder.aggregate([
                {
                    $match: {
                        sellerId: new ObjectId(id),
                        createdAt: { $gte: new Date(currentYear, 0, 1), $lt: new Date(currentYear + 1, 0, 1) }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$price" },
                        customers: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
    
            const formattedChartData = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                totalOrders: 0,
                totalRevenue: 0,
                customers: 0
            }))
    
            chartData.forEach(data => {
                formattedChartData[data._id - 1].totalOrders = data.totalOrders
                formattedChartData[data._id - 1].totalRevenue = data.totalRevenue
                formattedChartData[data._id - 1].customers = data.customers
            })
    
            // Get product status counts and calculate percentages for the seller
            const productStatusCounts = await authOrder.aggregate([
                {
                    $match: { sellerId: new ObjectId(id) }
                },
                {
                    $group: {
                        _id: "$delivery_status",
                        count: { $sum: 1 }
                    }
                }
            ])
    
            const totalStatusCount = productStatusCounts.reduce((sum, status) => sum + status.count, 0)
    
            const formattedProductStatusCounts = {
                pending: 0,
                processing: 0,
                warehouse: 0,
                placed: 0,
                cancelled: 0
            }
    
            productStatusCounts.forEach(status => {
                if (formattedProductStatusCounts.hasOwnProperty(status._id)) {
                    formattedProductStatusCounts[status._id] = (status.count / totalStatusCount) * 100
                }
            })
    
            responseReturn(res, 200, {
                totalProduct,
                totalOrder,
                totalPendingOrder,
                messages,
                recentOrders,
                totalSale: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
                chartData: formattedChartData,
                productStatusCounts: formattedProductStatusCounts
            })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, { error: error.message })
        }
    }

    add_banner = async(req,res) => {
       const form = formidable({multiples:true})
       form.parse(req, async(err, field, files) => {
        const {productId} = field
        const { mainban } = files

        cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true
        })
        
        try {
            const {slug} = await productModel.findById(productId) 
            const result = await cloudinary.uploader.upload(mainban.filepath, {folder: 'banners'})
            const banner = await bannerModel.create({
                productId,
                banner: result.url,
                link: slug 
            })
            responseReturn(res, 200, {banner,message: "Banner Add Success"})
        } catch (error) {
            responseReturn(res, 500, { error: error.message})
        } 
      })
    }

    get_banner = async(req,res) => {
        const {productId} = req.params
        try {
            const banner = await bannerModel.findOne({ productId: new ObjectId(productId) })
            responseReturn(res,200, {banner})
        } catch (error) {
            responseReturn(res, 500, { error: error.message})
        }
    }

    update_banner = async(req, res) => {
        const { bannerId } = req.params
        const form = formidable({})

        form.parse(req, async(err,_,files)=> {
            const {mainban} = files

            cloudinary.config({
                cloud_name: process.env.cloud_name,
                api_key: process.env.api_key,
                api_secret: process.env.api_secret,
                secure: true
            })

            try {
                let banner = await bannerModel.findById(bannerId)
                let temp = banner.banner.split('/')
                temp = temp[temp.length - 1]
                const imageName = temp.split('.')[0]
                await cloudinary.uploader.destroy(imageName)

                const {url} = await cloudinary.uploader.upload(mainban.filepath, {folder: 'banners'})

                await bannerModel.findByIdAndUpdate(bannerId, {
                    banner: url
                })

                banner = await bannerModel.findById(bannerId)
                responseReturn(res,200, {banner, message: "Banner Updated Success"})
            } catch (error) {
                responseReturn(res, 500, { error: error.message})
            }
        })
    }

    get_banners = async(req, res) => {
        try {
            const banners = await bannerModel.aggregate([
                {
                    $sample: {
                        size: 5
                    }
                }
            ])
            responseReturn(res,200,{ banners })
        } catch (error) {
            responseReturn(res, 500, { error: error.message})
        }
    }
}

module.exports = new dashboardController()