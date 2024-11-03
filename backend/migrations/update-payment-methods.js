const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ 
    path: path.join(__dirname, '..', '.env')
});

const migrationScript = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB');

        // First, let's count the documents before update
        const beforeAuthCount = await mongoose.connection.db
            .collection('authororders')
            .countDocuments();

        console.log(`Total author orders before update: ${beforeAuthCount}`);

        // Update authororders for unpaid orders (COD)
        const authCodResult = await mongoose.connection.db
            .collection('authororders')
            .updateMany(
                { 
                    payment_method: { $exists: false },
                    payment_status: 'unpaid'
                },
                { 
                    $set: { payment_method: 'cod' }
                }
            );

        // Update authororders for paid orders (Stripe)
        const authStripeResult = await mongoose.connection.db
            .collection('authororders')
            .updateMany(
                { 
                    payment_method: { $exists: false },
                    payment_status: 'paid'
                },
                { 
                    $set: { payment_method: 'stripe' }
                }
            );

        // Verify the updates
        const afterAuthCount = await mongoose.connection.db
            .collection('authororders')
            .find({ payment_method: { $exists: true } })
            .count();

        const customerOrders = await mongoose.connection.db
            .collection('customerorders')
            .find({ payment_method: { $exists: true } })
            .count();

        // Get sample documents after update
        const sampleAuth = await mongoose.connection.db
            .collection('authororders')
            .findOne({});

        console.log('\nUpdate Results:');
        console.log(`Updated COD author orders: ${authCodResult.modifiedCount}`);
        console.log(`Updated Stripe author orders: ${authStripeResult.modifiedCount}`);
        
        console.log('\nVerification Results:');
        console.log(`Total author orders with payment_method: ${afterAuthCount}`);
        console.log(`Total customer orders with payment_method: ${customerOrders}`);
        
        console.log('\nSample author order after update:');
        console.log(JSON.stringify(sampleAuth, null, 2));

        console.log('\nMigration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit();
    }
};

migrationScript();