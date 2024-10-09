const formidable = require("formidable");
const { responseReturn } = require("../../utilities/response");
const cloudinary = require('cloudinary').v2;
const categoryModel = require('../../models/categoryModel');

// Configure Cloudinary once, outside of the request handlers
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true
});

class categoryController {
    add_category = async (req, res) => {
        const form = formidable();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                return responseReturn(res, 400, { error: 'Error parsing form data' });
            }

            try {
                let { name } = fields;
                let { image } = files;
                name = name.trim();
                const slug = name.split(' ').join('-');

                if (!image || !image.filepath) {
                    return responseReturn(res, 400, { error: 'Image file is required' });
                }

                const result = await cloudinary.uploader.upload(image.filepath, { folder: 'categorys' });

                if (result) {
                    const category = await categoryModel.create({
                        name,
                        slug,
                        image: result.url
                    });
                    responseReturn(res, 201, { category, message: 'Category Added Successfully' });
                } else {
                    responseReturn(res, 400, { error: 'Image Upload Failed' });
                }
            } catch (error) {
                console.error("Add category error:", error);
                responseReturn(res, 500, { error: 'Internal Server Error: ' + error.message });
            }
        });
    }

    get_category = async (req, res) => {
        const { page, searchValue, parPage } = req.query;

        try {
            let skipPage = '';
            if (parPage && page) {
                skipPage = parseInt(parPage) * (parseInt(page) - 1);
            }

            let query = {};
            if (searchValue) {
                query = { $text: { $search: searchValue } };
            }

            const categorys = await categoryModel.find(query)
                .skip(skipPage)
                .limit(parseInt(parPage) || 0)
                .sort({ createdAt: -1 });

            const totalCategory = await categoryModel.countDocuments(query);

            responseReturn(res, 200, { categorys, totalCategory });
        } catch (error) {
            console.error("Get categories error:", error);
            responseReturn(res, 500, { error: 'Internal Server Error: ' + error.message });
        }
    }

    update_category = async (req, res) => {
        const form = formidable();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                return responseReturn(res, 400, { error: 'Error parsing form data' });
            }

            try {
                let { name } = fields;
                let { image } = files;
                const { id } = req.params;

                name = name.trim();
                const slug = name.split(' ').join('-');

                const updateData = { name, slug };

                // Check if a new image is being uploaded
                if (image && image.filepath) {
                    // Get the current category to find the old image URL
                    const currentCategory = await categoryModel.findById(id);
                    if (currentCategory && currentCategory.image) {
                        // Extract public_id from the old image URL
                        const publicId = `categorys/${currentCategory.image.split('/').pop().split('.')[0]}`;
                        try {
                            await cloudinary.uploader.destroy(publicId);
                        } catch (deleteError) {
                            console.warn("Error deleting old image:", deleteError);
                            // Continue with the update even if delete fails
                        }
                    }

                    // Upload new image
                    const result = await cloudinary.uploader.upload(image.filepath, { folder: 'categorys' });
                    updateData.image = result.url;
                }

                const category = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
                
                if (!category) {
                    return responseReturn(res, 404, { error: 'Category not found' });
                }

                responseReturn(res, 200, { category, message: 'Category Updated successfully' });
            } catch (error) {
                console.error("Update category error:", error);
                responseReturn(res, 500, { error: 'Internal Server Error: ' + error.message });
            }
        });
    }

    deleteCategory = async (req, res) => {
        try {
            const categoryId = req.params.id;
            const category = await categoryModel.findById(categoryId);

            if (!category) {
                return responseReturn(res, 404, { error: 'Category not found' });
            }

            // Delete image from Cloudinary if it exists
            if (category.image) {
                const publicId = `categorys/${category.image.split('/').pop().split('.')[0]}`;
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.warn("Error deleting image from Cloudinary:", deleteError);
                    // Continue with category deletion even if image deletion fails
                }
            }

            await categoryModel.findByIdAndDelete(categoryId);
            responseReturn(res, 200, { message: 'Category deleted successfully' });
        } catch (error) {
            console.error("Delete category error:", error);
            responseReturn(res, 500, { error: 'Internal Server Error: ' + error.message });
        }
    }
}

module.exports = new categoryController();