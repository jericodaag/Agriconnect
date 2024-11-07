const customerAuthController = require('../../controllers/home/customerAuthController');
const router = require('express').Router();

// Authentication routes
router.post('/customer/customer-register', customerAuthController.customer_register);
router.post('/customer/customer-login', customerAuthController.customer_login);
router.get('/customer/logout', customerAuthController.customer_logout); // Changed back to GET

// Password reset routes
router.post('/customer/forgot-password', customerAuthController.forgot_password);
router.post('/customer/reset-password', customerAuthController.reset_password);

module.exports = router;