const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/credora';

async function verifyAndWipe() {
    try {
        console.log("🛠️ Starting Vault Cleanup...");
        await mongoose.connect(mongoURI);
        console.log("✅ Database Connected.");

        // Clear All Data
        await mongoose.connection.db.dropDatabase();
        console.log("🧼 VAULT WIPED SUCCESSFULLY! Your Localhost is now a fresh, empty Bank!");

        process.exit(0);
    } catch (err) {
        console.error("❌ Cleanup Failed:", err.message);
        process.exit(1);
    }
}

verifyAndWipe();
