const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: 'c:/Users/Samyak Hirekhan/Desktop/I  Anitgravity/credora/server/.env' });
const User = require('c:/Users/Samyak Hirekhan/Desktop/I  Anitgravity/credora/server/models/User');

async function checkSponsor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const sponsor = await User.findOne({ 
      $or: [{ name: /hirekhan/i }, { email: /hirekhan/i }] 
    });
    
    let result = '';
    if (sponsor) {
      result = `Sponsor Found!\nName: ${sponsor.name}\nBalance: ${sponsor.balance}\nKYC: ${sponsor.kycStatus}`;
    } else {
      result = 'Sponsor not found in DB. Sign up needed.';
    }
    
    fs.writeFileSync('sponsor_check_result.txt', result);
    process.exit(0);
  } catch (err) {
    fs.writeFileSync('sponsor_check_result.txt', 'Error: ' + err.message);
    process.exit(1);
  }
}

checkSponsor();
