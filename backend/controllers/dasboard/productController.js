const formidable = require("formidable")
const { responseReturn } = require("../../utilities/response")
const cloudinary = require('cloudinary').v2
const productModel = require('../../models/productModel')
const sellerModel = require('../../models/sellerModel') // Add this line
 
class productController{

    add_product = async(req, res) => {
        const {id} = req;
        const form = formidable({ multiples: true })

        form.parse(req, async(err, fields, files) => {
            let {name, category, description, stock, price, discount, brand, unit} = fields;
            const {images} = files;  // Change this line
            name = name.trim()
            const slug = name.split(' ').join('-')

            cloudinary.config({
                cloud_name: process.env.cloud_name,
                api_key: process.env.api_key,
                api_secret: process.env.api_secret,
                secure: true
            })

            try {
                // Fetch the seller's information
                const seller = await sellerModel.findById(id)
                if (!seller) {
                    return responseReturn(res, 404, { error: 'Seller not found' })
                }
                const shopName = seller.shopInfo.shopName

                let allImageUrl = [];

                if (images) {  // Add this check
                    // Ensure images is always an array
                    const imageArray = Array.isArray(images) ? images : [images];

                    for (let i = 0; i < imageArray.length; i++) {
                        const result = await cloudinary.uploader.upload(imageArray[i].filepath, {folder: 'products'});
                        allImageUrl.push(result.url);
                    }
                }

                await productModel.create({
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
                    unit: unit.trim()
                })
                responseReturn(res, 201, { message : 'Product Added Successfully' })
                
            } catch (error) {
                responseReturn(res, 500, { error : error.message })
            }
        })
    }

    /// end method 

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

    // End Method 

    product_get = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId)
            responseReturn(res, 200,{product})
        } catch (error) {
            console.log(error.message)
        }
    }
    // End Method 

    product_update = async (req, res) => {
        let {name, description, stock, price, discount, brand, productId, unit} = req.body;
        name = name.trim()
        const slug = name.split(' ').join('-')

        try {
            await productModel.findByIdAndUpdate(productId, {
                name, description, stock, price, discount, brand, productId, slug, unit
            })
            const product = await productModel.findById(productId)
            responseReturn(res, 200,{product, message : 'Product Updated Successfully'})
        } catch (error) {
            responseReturn(res, 500,{ error : error.message })
        }
    }

  // End Method 

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
  // End Method 



}

module.exports = new productController()