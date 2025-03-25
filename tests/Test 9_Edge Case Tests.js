// Edge Case Tests
const edgeTests = new TestRunner();

edgeTests.beforeEach(async () => {
  // Ensure logged in
  if (document.getElementById('board-section').style.display === 'none') {
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    await TestUtils.wait(config.testTimeouts.medium);
  }
});

edgeTests.addTest('EDGE-01', 'Many Tasks', async () => {
  // Clear existing tasks first
  const clearAllTasks = async () => {
    const tasks = document.querySelectorAll('.task');
    
    // Mock confirm to always return true
    TestUtils.mockConfirm(true);
    
    for (const task of tasks) {
      const deleteBtn = task.querySelector('.delete-btn');
      deleteBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
    
    TestUtils.restoreConfirm();
  };
  
  await clearAllTasks();
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Create several tasks in each column - reduced for testing
  const tasksPerColumn = 3; 
  
  // Create tasks in To Do
  for (let i = 0; i < tasksPerColumn; i++) {
    await TestUtils.setValue('#new-task', `To Do Task ${i+1}`);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
  }
  
  // Create tasks in In Progress
  for (let i = 0; i < tasksPerColumn; i++) {
    await TestUtils.setValue('#new-task', `In Progress Task ${i+1}`);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    // Find the task and set progress to 50% to move to In Progress
    const tasks = document.querySelectorAll('#to-do .task');
    const task = tasks[tasks.length - 1];
    
    // Click +10% five times
    const plusBtn = task.querySelector('.progress-btn.plus');
    for (let j = 0; j < 5; j++) {
      plusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
  }
  
  // Create tasks in Done
  for (let i = 0; i < tasksPerColumn; i++) {
    await TestUtils.setValue('#new-task', `Done Task ${i+1}`);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    // Find the task and set progress to 100% to move to Done
    const tasks = document.querySelectorAll('#to-do .task');
    const task = tasks[tasks.length - 1];
    
    // Click +10% ten times
    const plusBtn = task.querySelector('.progress-btn.plus');
    for (let j = 0; j < 10; j++) {
      plusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
  }
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify all tasks were created
  const todoTasks = document.querySelectorAll('#to-do .task').length;
  const inProgressTasks = document.querySelectorAll('#in-progress .task').length;
  const doneTasks = document.querySelectorAll('#done .task').length;
  
  if (todoTasks !== tasksPerColumn) {
    throw new Error(`Expected ${tasksPerColumn} tasks in To Do, found ${todoTasks}`);
  }
  
  if (inProgressTasks !== tasksPerColumn) {
    throw new Error(`Expected ${tasksPerColumn} tasks in In Progress, found ${inProgressTasks}`);
  }
  
  if (doneTasks !== tasksPerColumn) {
    throw new Error(`Expected ${tasksPerColumn} tasks in Done, found ${doneTasks}`);
  }
});

edgeTests.addTest('EDGE-02', 'Long Task Descriptions', async () => {
  // Create a task with very long description
  const longText = 'This is an extremely long task description that should test the layout and wrapping capabilities of the task cards. It contains many words and should stretch across multiple lines to ensure the UI can handle it properly without breaking the layout.';
  
  await TestUtils.setValue('#new-task', longText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = document.querySelectorAll('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === longText
  );
  
  if (!task) {
    throw new Error('Long text task not found');
  }
  
  // Task was created successfully with long text
  // Now verify we can still interact with it
  
  // Check if we can change priority
  const prioritySelect = task.querySelector('.task-priority');
  await TestUtils.setValue('', 'high', prioritySelect);
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify priority class was updated
  if (!task.classList.contains('priority-high')) {
    throw new Error('Task class was not updated to priority-high with long text');
  }
});

edgeTests.addTest('EDGE-03', 'Special Characters', async () => {
  // Create task with special characters
  const specialChars = 'Task with emoji 🚀 and symbols &%$#@!';
  
  await TestUtils.setValue('#new-task', specialChars);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = document.querySelectorAll('.task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === specialChars
  );
  
  if (!task) {
    throw new Error(`Task with special characters not found: "${specialChars}"`);
  }
  
  // Modify the task to verify persistence
  const taskTextElement = task.querySelector('.task-text');
  const dblClickEvent = new MouseEvent('dblclick', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  taskTextElement.dispatchEvent(dblClickEvent);
  
  // Add more special characters
  const updatedText = specialChars + ' 🌟 çéñôr';
  await TestUtils.setValue('', updatedText, taskTextElement);
  
  // Trigger blur to save changes
  const blurEvent = new Event('blur', { bubbles: true });
  taskTextElement.dispatchEvent(blurEvent);
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify text was updated
  if (taskTextElement.value !== updatedText) {
    throw new Error(`Task text with special characters was not updated properly`);
  }
});

// Run edge case tests
edgeTests.runTests().then(results => {
  console.log(`Edge Case tests complete: ${results.passed}/${results.total} tests passed`);
}).catch(error => {
  console.error('Test execution failed:', error);
});