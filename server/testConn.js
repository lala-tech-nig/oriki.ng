const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
};
test();
