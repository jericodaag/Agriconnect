const formidable = require("formidable")
const { responseReturn } = require("../../utilities/response")
const cloudinary = require('cloudinary').v2
const productModel = require('../../models/productModel')
const sellerModel = require('../../models/sellerModel')
const reviewModel = require('../../models/reviewModel')
const moment = require('moment')

class ProductController {
    constructor() {
        // Bind all methods to the instance
        this.add_product = this.add_product.bind(this);
        this.products_get = this.products_get.bind(this);
        this.product_get = this.product_get.bind(this);
        this.product_update = this.product_update.bind(this);
        this.product_image_update = this.product_image_update.bind(this);
        this.get_product_analytics = this.get_product_analytics.bind(this);
        this.get_inventory_history = this.get_inventory_history.bind(this);
        this.update_product_sales = this.update_product_sales.bind(this);
        this.handle_alert_action = this.handle_alert_action.bind(this);
        this.delete_product = this.delete_product.bind(this);
    }

    async add_product(req, res) {
        const {id} = req;
        const form = formidable({ multiples: true })

        form.parse(req, async(err, fields, files) => {
            let {name, category, description, stock, price, discount, brand, unit, harvestDate, bestBefore} = fields;
            const {images} = files;
            name = name.trim()
            const slug = name.split(' ').join('-')

            cloudinary.config({
                cloud_name: process.env.cloud_name,
                api_key: process.env.api_key,
                api_secret: process.env.api_secret,
                secure: true
            })

            try {
                const seller = await sellerModel.findById(id)
                if (!seller) {
                    return responseReturn(res, 404, { error: 'Seller not found' })
                }
                const shopName = seller.shopInfo.shopName

                let allImageUrl = [];

                if (images) {
                    const imageArray = Array.isArray(images) ? images : [images];

                    for (let i = 0; i < imageArray.length; i++) {
                        const result = await cloudinary.uploader.upload(imageArray[i].filepath, {folder: 'products'});
                        allImageUrl.push(result.url);
                    }
                }

                const newProduct = await productModel.create({
                    sellerId: id,
                    name,
                    slug,
                    shopName,
                    category: category.trim(),
                    description: description.trim(),
                    stock: parseInt(stock),
                    price: parseInt(price),
                    discount: parseInt(discount),
                    images: allImageUrl,
                    brand: brand.trim(),
                    unit: unit.trim(),
                    harvestDate: new Date(harvestDate),
                    bestBefore: new Date(bestBefore),
                    salesCount: 0,
                    inventoryHistory: [{ date: new Date(), quantity: parseInt(stock) }]
                })
                responseReturn(res, 201, { message : 'Product Added Successfully', product: newProduct })
            } catch (error) {
                responseReturn(res, 500, { error : error.message })
            }
        })
    }

    async products_get(req, res) {
        const {page, searchValue, parPage} = req.query 
        const {id} = req;

        const skipPage = parseInt(parPage) * (parseInt(page) - 1)

        try {
            if (searchValue) {
                const products = await productModel.find({
                    $text: { $search: searchValue },
                    sellerId: id
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
                const totalProduct = await productModel.find({
                    $text: { $search: searchValue },
                    sellerId: id
                }).countDocuments()
                responseReturn(res, 200, {products, totalProduct})
            } else {
                const products = await productModel.find({ sellerId: id }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
                const totalProduct = await productModel.find({ sellerId: id }).countDocuments()
                responseReturn(res, 200, {products, totalProduct}) 
            }
        } catch (error) {
            console.log(error.message)
        } 
    }

    async product_get(req, res) {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId)
            responseReturn(res, 200, {product})
        } catch (error) {
            console.log(error.message)
        }
    }

    async product_update(req, res) {
        let {name, description, stock, price, discount, brand, productId, unit} = req.body;
        name = name.trim()
        const slug = name.split(' ').join('-')

        try {
            const product = await productModel.findById(productId)
            if (stock !== product.stock) {
                product.inventoryHistory.push({ date: new Date(), quantity: parseInt(stock) })
            }
            
            await productModel.findByIdAndUpdate(productId, {
                name, description, stock, price, discount, brand, slug, unit,
                inventoryHistory: product.inventoryHistory
            })
            const updatedProduct = await productModel.findById(productId)
            responseReturn(res, 200, {product: updatedProduct, message: 'Product Updated Successfully'})
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

    async product_image_update(req, res) {
        const form = formidable({ multiples: true })

        form.parse(req, async(err, field, files) => {
            const {oldImage, productId} = field;
            const { newImage } = files

            if (err) {
                responseReturn(res, 400, { error: err.message })
            } else {
                try {
                    cloudinary.config({
                        cloud_name: process.env.cloud_name,
                        api_key: process.env.api_key,
                        api_secret: process.env.api_secret,
                        secure: true
                    })

                    const result = await cloudinary.uploader.upload(newImage.filepath, { folder: 'products'})

                    if (result) {
                        let {images} = await productModel.findById(productId)
                        const index = images.findIndex(img => img === oldImage) 
                        images[index] = result.url;
                        await productModel.findByIdAndUpdate(productId, {images}) 

                        const product = await productModel.findById(productId)
                        responseReturn(res, 200, {product, message: 'Product Image Updated Successfully'})
                    } else {
                        responseReturn(res, 404, { error: 'Image Upload Failed'})
                    }
                } catch (error) {
                    responseReturn(res, 404, { error: error.message })
                }
            }
        })
    }

    async get_inventory_history(req, res) {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId);
            if (!product) {
                return responseReturn(res, 404, { error: 'Product not found' });
            }

            const formattedHistory = product.inventoryHistory.map(entry => ({
                date: moment(entry.date).format('YYYY-MM-DD HH:mm:ss'),
                quantity: entry.quantity,
                type: entry.type || 'stock_update'
            }));

            responseReturn(res, 200, { 
                inventoryHistory: formattedHistory,
                product: {
                    name: product.name,
                    currentStock: product.stock,
                    initialStock: product.inventoryHistory[0]?.quantity || 0,
                    salesCount: product.salesCount
                }
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    async update_product_sales(req, res) {
        const { productId, quantity, type = 'sale' } = req.body;
        try {
            const product = await productModel.findById(productId);
            if (!product) {
                return responseReturn(res, 404, { error: 'Product not found' });
            }

            if (type === 'sale' && product.stock < quantity) {
                return responseReturn(res, 400, { error: 'Insufficient stock' });
            }

            product.salesCount = type === 'sale' ? product.salesCount + quantity : product.salesCount;
            product.stock = type === 'sale' ? product.stock - quantity : product.stock + quantity;
            product.lastSaleDate = type === 'sale' ? new Date() : product.lastSaleDate;

            product.inventoryHistory.push({
                date: new Date(),
                quantity: product.stock,
                type: type
            });

            await product.save();

            responseReturn(res, 200, { 
                message: `Product ${type === 'sale' ? 'sales' : 'stock'} updated successfully`, 
                product 
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    async handle_alert_action(req, res) {
        const { alertId, action, productId } = req.body;
        
        try {
            const product = await productModel.findById(productId);
            if (!product) {
                return responseReturn(res, 404, { error: 'Product not found' });
            }

            let updatedProduct;
            let message;

            switch (action) {
                case 'applyDiscount':
                    const daysUntilExpiry = moment(product.bestBefore).diff(moment(), 'days');
                    const suggestedDiscount = daysUntilExpiry <= 3 ? 30 :
                                            daysUntilExpiry <= 5 ? 20 :
                                            daysUntilExpiry <= 7 ? 10 : 5;

                    updatedProduct = await productModel.findByIdAndUpdate(
                        productId,
                        { 
                            $set: { 
                                discount: Math.max(product.discount, suggestedDiscount)
                            } 
                        },
                        { new: true }
                    );
                    message = `Applied ${suggestedDiscount}% discount to ${product.name}`;
                    break;

                case 'restock':
                    const dailySales = product.salesCount / Math.max(moment().diff(moment(product.createdAt), 'days'), 1);
                    const restockQuantity = Math.ceil(dailySales * 30);

                    updatedProduct = await productModel.findByIdAndUpdate(
                        productId,
                        {
                            $set: { needsRestock: true },
                            $push: {
                                inventoryHistory: {
                                    date: new Date(),
                                    quantity: product.stock,
                                    type: 'restock_needed'
                                }
                            }
                        },
                        { new: true }
                    );
                    message = `Marked ${product.name} for restocking (Suggested quantity: ${restockQuantity})`;
                    break;

                default:
                    return responseReturn(res, 400, { error: 'Invalid action' });
            }

            responseReturn(res, 200, {
                message,
                updatedProduct,
                dismissedAlertId: alertId
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    async delete_product(req, res) {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId);
            if (!product) {
                return responseReturn(res, 404, { error: 'Product not found' });
            }

            if (product.images && product.images.length > 0) {
                cloudinary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.api_key,
                    api_secret: process.env.api_secret,
                    secure: true
                });

                for (let image of product.images) {
                    const publicId = image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`products/${publicId}`);
                }
            }

            await productModel.findByIdAndDelete(productId);

            responseReturn(res, 200, { 
                message: 'Product deleted successfully',
                productId 
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Add the new get_product_analytics method here
    async get_product_analytics(req, res) {
        const { id } = req;
        
        try {
            const products = await productModel.find({ sellerId: id });
            const reviews = await reviewModel.find({ 
                productId: { $in: products.map(p => p._id) } 
            });
    
            // Calculate analytics
            const analytics = products.map(product => {
                const productReviews = reviews.filter(r => r.productId.toString() === product._id.toString());
                const rating = productReviews.length > 0 
                    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
                    : 0;
    
                return {
                    _id: product._id,
                    name: product.name,
                    stock: product.stock,
                    price: product.price,
                    salesCount: product.salesCount,
                    rating,
                    category: product.category,
                    bestBefore: product.bestBefore,
                    images: product.images,  // Add this line to include images
                    unit: product.unit,      // Add unit as well since you're using it
                    harvestDate: product.harvestDate  // Add harvest date
                };
            });

            // Category performance
            const categoryPerformance = {};
            products.forEach(product => {
                if (!categoryPerformance[product.category]) {
                    categoryPerformance[product.category] = {
                        totalSales: 0,
                        totalRevenue: 0,
                        productCount: 0
                    };
                }
                categoryPerformance[product.category].totalSales += product.salesCount;
                categoryPerformance[product.category].totalRevenue += product.salesCount * product.price;
                categoryPerformance[product.category].productCount += 1;
            });

            // Inventory insights
            const now = moment();
            const inventoryInsights = {
                totalProducts: products.length,
                lowStock: products.filter(p => p.stock < 10).length,
                expiringIn7Days: products.filter(p => moment(p.bestBefore).diff(now, 'days') <= 7).length,
                outOfStock: products.filter(p => p.stock === 0).length,
                topPerformers: products
                    .sort((a, b) => b.salesCount - a.salesCount)
                    .slice(0, 5)
                    .map(p => ({
                        name: p.name,
                        salesCount: p.salesCount,
                        revenue: p.salesCount * p.price
                    }))
            };

            // Market analysis
            const marketability = products.map(product => ({
                productId: product._id,
                name: product.name,
                salesVelocity: product.salesCount / Math.max(moment().diff(moment(product.createdAt), 'days'), 1),
                stockTurnover: product.salesCount / (product.stock || 1),
                daysUntilExpiry: moment(product.bestBefore).diff(now, 'days')
            }));

            responseReturn(res, 200, {
                analytics,
                categoryPerformance: Object.entries(categoryPerformance).map(([category, data]) => ({
                    category,
                    ...data
                })),
                inventoryInsights,
                marketability
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }
}

module.exports = new ProductController();