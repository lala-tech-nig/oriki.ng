const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);

    try {
        console.log('Connecting to MongoDB directly...');
        await client.connect();
        console.log('✅ Connected!');

        const db = client.db(); // uses db from URI
        const users = db.collection('users');

        const adminEmail = process.env.ADMIN_DEFAULT_EMAIL;
        const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error('ADMIN_DEFAULT_EMAIL or ADMIN_DEFAULT_PASSWORD not in .env');
        }

        const existingAdmin = await users.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Admin ${adminEmail} exists. Ensuring superadmin role.`);
            await users.updateOne(
                { _id: existingAdmin._id },
                { $set: { role: 'superadmin', isActive: true } }
            );
            console.log('✅ Updated.');
        } else {
            console.log('Creating superadmin...');
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            await users.insertOne({
                name: 'System Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'superadmin',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`✅ Created: ${adminEmail}`);
        }

    } catch (err) {
        console.error('❌ Error:');
        console.error(err.message);
        console.error(err.stack);
    } finally {
        await client.close();
        process.exit(0);
    }
};

seedAdmin();
