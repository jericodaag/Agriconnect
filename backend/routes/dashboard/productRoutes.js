const router = require('express').Router();
const productController = require('../../controllers/dasboard/productController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

// Basic product operations
router.post('/product-add', authMiddleware, productController.add_product);
router.get('/products-get', authMiddleware, productController.products_get);
router.get('/product-get/:productId', authMiddleware, productController.product_get);
router.post('/product-update', authMiddleware, productController.product_update);
router.post('/product-image-update', authMiddleware, productController.product_image_update);
router.delete('/product/:productId', authMiddleware, productController.delete_product);

// Analytics routes
router.get('/product-analytics', authMiddleware, productController.get_product_analytics);
router.get('/inventory-history/:productId', authMiddleware, productController.get_inventory_history);
router.post('/update-product-sales', authMiddleware, productController.update_product_sales);
router.post('/handle-alert', authMiddleware, productController.handle_alert_action);

module.exports = router;