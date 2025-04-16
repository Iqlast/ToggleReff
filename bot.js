const axios = require('axios');
const readline = require('readline');
const colors = require('colors');
const fs = require('fs');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to generate random string
function randomString(length, isNumber = false) {
  let result = '';
  const chars = isNumber ? '0123456789' : 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Function to generate random user data
function generateUserData(index) {
  const username = `user${randomString(6)}${index}`;
  const domain = `example${randomString(3)}.com`;
  const firstName = `User${randomString(4)}`;
  const lastName = `Name${randomString(4)}`;
  
  return {
    username: username,
    email: `${username}@${domain}`,
    password: `${username}@${domain}`,
    firstName: firstName,
    lastName: lastName
  };
}

// Function to make the API request
async function signUp(userData, referralCode) {
  try {
    const payload = {
      ...userData,
      referralCode: referralCode,
      subscribed: true
    };

    const response = await axios.post('https://toggle.pro/api/auth/signup', payload);
    return { success: true, data: response.data, user: payload };
  } catch (error) {
    return { 
      success: false, 
      error: error.response ? error.response.data : error.message,
      user: userData
    };
  }
}

// Function to display results with colors
function displayResult(result, index) {
  console.log(`\n=== Attempt #${index + 1} ===`.cyan.bold);
  
  if (result.success) {
    console.log('Status:'.yellow, 'SUCCESS'.green.bold);
    console.log('Username:'.yellow, result.user.username.white);
    console.log('Email:'.yellow, result.user.email.white);
    console.log('Response:'.yellow, JSON.stringify(result.data, null, 2).gray);
    
    // Save to file
    fs.appendFileSync('success.txt', 
      `Username: ${result.user.username} | Password: ${result.user.password} | Email: ${result.user.email}\n`,
      'utf8'
    );
  } else {
    console.log('Status:'.yellow, 'FAILED'.red.bold);
    console.log('Username:'.yellow, result.user.username.white);
    console.log('Error:'.yellow, JSON.stringify(result.error, null, 2).red);
  }
}

// Main function
async function main() {
  console.log('\n=== Toggle.Pro Auto Signup ==='.rainbow.bold);
  
  // Ask for referral code
  rl.question('Enter referral code: '.yellow, (referralCode) => {
    rl.question('How many accounts to create? '.yellow, async (count) => {
      const numAccounts = parseInt(count) || 1;
      console.log(`\nCreating ${numAccounts} account(s)...`.magenta);
      
      for (let i = 0; i < numAccounts; i++) {
        const userData = generateUserData(i);
        const result = await signUp(userData, referralCode);
        displayResult(result, i);
        
        // Add delay between requests to avoid rate limiting
        if (i < numAccounts - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log('\n=== Process Complete ==='.rainbow.bold);
      console.log(`Results saved to ${'success.txt'.green}`);
      rl.close();
    });
  });
}

// Start the program
main();

// Handle file creation
if (!fs.existsSync('success.txt')) {
  fs.writeFileSync('success.txt', '', 'utf8');
}
