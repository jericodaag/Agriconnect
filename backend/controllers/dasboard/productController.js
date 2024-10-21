const formidable = require("formidable")
const { responseReturn } = require("../../utilities/response")
const cloudinary = require('cloudinary').v2
const productModel = require('../../models/productModel')
const sellerModel = require('../../models/sellerModel')

class productController {
    add_product = async(req, res) => {
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

    products_get = async (req, res) => {
        const {page,searchValue, parPage} = req.query 
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
                responseReturn(res, 200,{products,totalProduct})
            } else {
                const products = await productModel.find({ sellerId:id }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
                const totalProduct = await productModel.find({ sellerId:id }).countDocuments()
                responseReturn(res, 200,{products,totalProduct}) 
            }
        } catch (error) {
            console.log(error.message)
        } 
    }

    product_get = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId)
            responseReturn(res, 200,{product})
        } catch (error) {
            console.log(error.message)
        }
    }

    product_update = async (req, res) => {
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
            responseReturn(res, 200,{product: updatedProduct, message : 'Product Updated Successfully'})
        } catch (error) {
            responseReturn(res, 500,{ error : error.message })
        }
    }

    product_image_update = async(req,res) => {
        const form = formidable({ multiples: true })

        form.parse(req, async (err, field, files) => {
            const {oldImage,productId} = field;
            const { newImage } = files

            if (err) {
                responseReturn(res, 400,{ error : err.message })
            }else{
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
                        await productModel.findByIdAndUpdate(productId,{images}) 

                        const product = await productModel.findById(productId)
                        responseReturn(res, 200,{product, message : 'Product Image Updated Successfully'})
                    } else {
                        responseReturn(res, 404,{ error : 'Image Upload Failed'})
                    }
                } catch (error) {
                    responseReturn(res, 404,{ error : error.message })
                }
            }
        })
    }

    get_product_analytics = async (req, res) => {
        const { id } = req;
        try {
            const products = await productModel.find({ sellerId: id });
            const analytics = products.map(product => {
                const daysSinceHarvest = Math.ceil((new Date() - new Date(product.harvestDate)) / (1000 * 60 * 60 * 24));
                const daysUntilExpiry = Math.ceil((new Date(product.bestBefore) - new Date()) / (1000 * 60 * 60 * 24));
                return {
                    _id: product._id,
                    name: product.name,
                    stock: product.stock,
                    salesCount: product.salesCount,
                    daysSinceHarvest,
                    daysUntilExpiry,
                    freshnessStatus: this.getFreshnessStatus(daysSinceHarvest)
                };
            });
            
            analytics.sort((a, b) => b.salesCount - a.salesCount);
            responseReturn(res, 200, { analytics });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    get_inventory_history = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId);
            responseReturn(res, 200, { inventoryHistory: product.inventoryHistory });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    update_product_sales = async (req, res) => {
        const { productId, quantity } = req.body;
        try {
            const product = await productModel.findById(productId);
            product.salesCount += quantity;
            product.stock -= quantity;
            product.lastSaleDate = new Date();
            product.inventoryHistory.push({ date: new Date(), quantity: product.stock });
            await product.save();
            responseReturn(res, 200, { message: 'Product sales updated successfully', product });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    getFreshnessStatus(daysSinceHarvest) {
        if (daysSinceHarvest <= 3) return 'Very Fresh';
        if (daysSinceHarvest <= 7) return 'Fresh';
        if (daysSinceHarvest <= 14) return 'Still Good';
        return 'May be Perished';
    }
}

module.exports = new productController()