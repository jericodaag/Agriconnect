// migration.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection URLs
const sourceUrl = 'mongodb://127.0.0.1:27017/agriconnect';
const destinationUrl = 'mongodb+srv://daageco:R5E3dvZx2gkttpeV@agriconnect.fqin9.mongodb.net/agriconnect?retryWrites=true&w=majority&appName=Agriconnect';

async function migrateData() {
    let sourceClient, destClient;
    
    try {
        // Connect to both databases
        console.log('Connecting to databases...');
        sourceClient = await MongoClient.connect(sourceUrl);
        destClient = await MongoClient.connect(destinationUrl);
        
        // Get database references
        const sourceDb = sourceClient.db('agriconnect');
        const destDb = destClient.db('agriconnect');
        
        // Get all collections
        const collections = await sourceDb.listCollections().toArray();
        
        // Migrate each collection
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`\nMigrating collection: ${collectionName}`);
            
            // Get all documents from source collection
            const sourceCollection = sourceDb.collection(collectionName);
            const documents = await sourceCollection.find({}).toArray();
            
            if (documents.length > 0) {
                const destCollection = destDb.collection(collectionName);
                let inserted = 0;
                let updated = 0;
                let skipped = 0;

                // Process documents one by one
                for (const doc of documents) {
                    try {
                        // Check if document already exists
                        const existing = await destCollection.findOne({ _id: doc._id });
                        
                        if (existing) {
                            // Update existing document
                            await destCollection.updateOne(
                                { _id: doc._id },
                                { $set: doc }
                            );
                            updated++;
                        } else {
                            // Insert new document
                            await destCollection.insertOne(doc);
                            inserted++;
                        }
                    } catch (error) {
                        console.log(`- Skipped document with _id: ${doc._id} (${error.message})`);
                        skipped++;
                    }
                }
                
                console.log(`✓ Collection ${collectionName} migration completed:`);
                console.log(`  - Inserted: ${inserted} documents`);
                console.log(`  - Updated: ${updated} documents`);
                console.log(`  - Skipped: ${skipped} documents`);
            } else {
                console.log(`- No documents to migrate in ${collectionName}`);
            }
        }
        
        console.log('\nMigration completed successfully! 🎉');
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close connections
        if (sourceClient) await sourceClient.close();
        if (destClient) await destClient.close();
        process.exit(0);
    }
}

// Run migration
console.log('Starting migration process...');
migrateData();