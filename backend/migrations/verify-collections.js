const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ 
    path: path.join(__dirname, '..', '.env')
});

const verifyCollections = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB');

        // Get list of all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nAvailable collections:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        // Check sample documents from relevant collections
        if (collections.some(c => c.name === 'authorders' || c.name === 'authororders')) {
            const authOrders = await mongoose.connection.db
                .collection(collections.find(c => 
                    c.name === 'authorders' || c.name === 'authororders'
                ).name)
                .findOne({});
            
            console.log('\nSample auth order:');
            console.log(authOrders);
        }

        console.log('\nSample customer order:');
        const customerOrder = await mongoose.connection.db
            .collection('customerorders')
            .findOne({});
        console.log(customerOrder);

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit();
    }
};

verifyCollections();