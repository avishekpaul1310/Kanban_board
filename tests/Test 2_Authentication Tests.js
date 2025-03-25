// Authentication Tests
const authTests = new TestRunner();

authTests.beforeEach(async () => {
  // Reset to login page
  if (document.getElementById('login-section').style.display === 'none') {
    await TestUtils.clickElement('#logout-button');
    await TestUtils.wait(config.testTimeouts.short);
  }
});

authTests.addTest('AUTH-01', 'User Registration', async () => {
  const { username, password } = config.testUsers.newUser;
  
  await TestUtils.setValue('#username', username);
  await TestUtils.setValue('#password', password);
  await TestUtils.clickElement('#register-button');
  
  // Check that registration was successful (via alert)
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify user exists in localStorage
  const savedUser = localStorage.getItem(`user_${username}`);
  if (!savedUser) {
    throw new Error('User was not saved to localStorage after registration');
  }
});

authTests.addTest('AUTH-02', 'User Registration Validation', async () => {
  // Original alert function
  const originalAlert = window.alert;
  let alertCalled = false;
  
  // Mock alert
  window.alert = (message) => {
    if (message.includes('Please enter both username and password')) {
      alertCalled = true;
    }
  };
  
  // Test empty username
  await TestUtils.setValue('#username', '');
  await TestUtils.setValue('#password', 'password123');
  await TestUtils.clickElement('#register-button');
  
  if (!alertCalled) {
    throw new Error('Alert not shown for empty username');
  }
  
  // Reset and test empty password
  alertCalled = false;
  await TestUtils.setValue('#username', 'testuser');
  await TestUtils.setValue('#password', '');
  await TestUtils.clickElement('#register-button');
  
  if (!alertCalled) {
    throw new Error('Alert not shown for empty password');
  }
  
  // Restore original alert
  window.alert = originalAlert;
});

authTests.addTest('AUTH-03', 'Username Uniqueness', async () => {
  const { username, password } = config.testUsers.existingUser;
  
  // Register user first time
  await TestUtils.setValue('#username', username);
  await TestUtils.setValue('#password', password);
  await TestUtils.clickElement('#register-button');
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Original alert function
  const originalAlert = window.alert;
  let alertCalled = false;
  
  // Mock alert
  window.alert = (message) => {
    if (message.includes('Username already exists')) {
      alertCalled = true;
    }
  };
  
  // Try to register same username again
  await TestUtils.setValue('#username', username);
  await TestUtils.setValue('#password', 'different_password');
  await TestUtils.clickElement('#register-button');
  
  await TestUtils.wait(config.testTimeouts.short);
  
  if (!alertCalled) {
    throw new Error('Alert not shown for duplicate username');
  }
  
  // Restore original alert
  window.alert = originalAlert;
});

authTests.addTest('AUTH-04', 'User Login', async () => {
  const { username, password } = config.testUsers.existingUser;
  
  await TestUtils.setValue('#username', username);
  await TestUtils.setValue('#password', password);
  await TestUtils.clickElement('#login-button');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify login successful - board is displayed
  const boardSection = await TestUtils.getElement('#board-section');
  if (boardSection.style.display === 'none') {
    throw new Error('Board section not displayed after login');
  }
  
  // Verify username is displayed
  const currentUser = await TestUtils.getElement('#current-user');
  if (currentUser.textContent !== username) {
    throw new Error(`Username mismatch: expected "${username}", got "${currentUser.textContent}"`);
  }
});

authTests.addTest('AUTH-05', 'Invalid Login', async () => {
  // Original alert function
  const originalAlert = window.alert;
  let alertCalled = false;
  
  // Mock alert
  window.alert = (message) => {
    if (message.includes('Incorrect password')) {
      alertCalled = true;
    }
  };
  
  // Try to login with wrong password
  await TestUtils.setValue('#username', config.testUsers.existingUser.username);
  await TestUtils.setValue('#password', 'wrong_password');
  await TestUtils.clickElement('#login-button');
  
  await TestUtils.wait(config.testTimeouts.short);
  
  if (!alertCalled) {
    throw new Error('Alert not shown for incorrect password');
  }
  
  // Restore original alert
  window.alert = originalAlert;
});

authTests.addTest('AUTH-06', 'User Logout', async () => {
  // First login
  const { username, password } = config.testUsers.existingUser;
  
  await TestUtils.setValue('#username', username);
  await TestUtils.setValue('#password', password);
  await TestUtils.clickElement('#login-button');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Now logout
  await TestUtils.clickElement('#logout-button');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify logout successful - login section is displayed
  const loginSection = await TestUtils.getElement('#login-section');
  if (loginSection.style.display === 'none') {
    throw new Error('Login section not displayed after logout');
  }
});

// Set up existing user for tests
localStorage.setItem(
  `user_${config.testUsers.existingUser.username}`, 
  JSON.stringify(config.testUsers.existingUser)
);

// Run authentication tests
authTests.runTests().then(results => {
  console.log(`Authentication tests complete: ${results.passed}/${results.total} tests passed`);
}).catch(error => {
  console.error('Test execution failed:', error);
});