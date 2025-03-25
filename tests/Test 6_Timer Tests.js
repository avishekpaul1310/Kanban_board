// Timer Tests
const timerTests = new TestRunner();

timerTests.beforeEach(async () => {
  // Ensure logged in
  if (document.getElementById('board-section').style.display === 'none') {
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    await TestUtils.wait(config.testTimeouts.medium);
  }
});

timerTests.addTest('TIMER-01', 'Start Timer', async () => {
  // Create a task
  const taskText = 'Timer start test task';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for timer test');
  }
  
  // Start timer
  const timerToggle = task.querySelector('.timer-toggle');
  timerToggle.click();
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify timer is running
  if (!task.classList.contains('timer-active')) {
    throw new Error('Task does not have timer-active class after starting timer');
  }
  
  // Verify button text changed
  if (!timerToggle.textContent.includes('Pause')) {
    throw new Error(`Timer toggle button should say "Pause Timer" after starting, got "${timerToggle.textContent}"`);
  }
  
  // Stop timer to clean up
  timerToggle.click();
});

timerTests.addTest('TIMER-02', 'Pause Timer', async () => {
  // Create a task
  const taskText = 'Timer pause test task';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for timer pause test');
  }
  
  // Start timer
  const timerToggle = task.querySelector('.timer-toggle');
  timerToggle.click();
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify timer started
  if (!task.classList.contains('timer-active')) {
    throw new Error('Timer did not start properly');
  }
  
  // Get initial timer value
  const timerDisplay = task.querySelector('.timer-display');
  const initialValue = timerDisplay.textContent;
  
  // Wait a bit to ensure timer changes
  await TestUtils.wait(config.testTimeouts.timer);
  
  // Pause timer
  timerToggle.click();
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify timer paused - button text changed back
  if (!timerToggle.textContent.includes('Start')) {
    throw new Error(`Timer toggle button should say "Start Timer" after pausing, got "${timerToggle.textContent}"`);
  }
  
  // Verify timer-active class removed
  if (task.classList.contains('timer-active')) {
    throw new Error('Task still has timer-active class after pausing timer');
  }
});

timerTests.addTest('TIMER-03', 'Custom Timer Duration', async () => {
  // Create a task
  const taskText = 'Custom timer duration test task';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for custom timer test');
  }
  
  // Set custom timer duration
  const timeInput = task.querySelector('.timer-input');
  await TestUtils.setValue('', '5', timeInput); // 5 minutes
  
  // Start timer
  const timerToggle = task.querySelector('.timer-toggle');
  timerToggle.click();
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify timer display shows custom duration
  const timerDisplay = task.querySelector('.timer-display');
  if (timerDisplay.textContent !== '05:00') {
    throw new Error(`Timer should display 05:00 after setting custom duration, got "${timerDisplay.textContent}"`);
  }
  
  // Verify time input is disabled during timer
  if (!timeInput.disabled) {
    throw new Error('Timer input should be disabled while timer is running');
  }
  
  // Stop timer to clean up
  timerToggle.click();
});

// Run timer tests
timerTests.runTests().then(results => {
  console.log(`Timer tests complete: ${results.passed}/${results.total} tests passed`);
}).catch(error => {
  console.error('Test execution failed:', error);
});