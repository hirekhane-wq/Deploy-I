require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- 🛡️ CREDORA EXECUTIVE CORE: PRODUCTION GATEWAY ---
const app = express();

// SECURITY GATES (CORS & JSON)
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"] }));

// VAULT CONNECTION (DATABASE)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ CONNECTED TO CREDORA PRODUCTION VAULT (MONGODB)'))
  .catch(err => console.error('❌ VAULT CONNECTION FAILURE:', err));

// EXECUTIVE ROUTES
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

// GLOBAL PULSE: LISTEN ON CLOUD PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CREDORA PRODUCTION HUB ONLINE: PORT ${PORT}`);
});
