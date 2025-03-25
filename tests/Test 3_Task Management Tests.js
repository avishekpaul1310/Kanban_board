// Task Management Tests
const taskTests = new TestRunner();

taskTests.beforeEach(async () => {
  // Ensure logged in
  if (document.getElementById('board-section').style.display === 'none') {
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    await TestUtils.wait(config.testTimeouts.medium);
  }
});

taskTests.addTest('TASK-01', 'Create New Task', async () => {
  const taskText = 'Test task creation';
  
  // Fill task form
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.setValue('#task-priority', 'high');
  await TestUtils.setValue('#task-due-date', TestUtils.getDate(3)); // 3 days in the future
  await TestUtils.setValue('#task-category', 'work');
  
  // Add task
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify task was created
  const taskElements = await TestUtils.getElements('#to-do .task');
  const taskFound = Array.from(taskElements).some(task => 
    task.querySelector('.task-text').value === taskText
  );
  
  if (!taskFound) {
    throw new Error('Task was not found in the "To Do" column after creation');
  }
});

taskTests.addTest('TASK-02', 'Required Task Fields', async () => {
  // Original alert function
  const originalAlert = window.alert;
  let alertCalled = false;
  
  // Mock alert
  window.alert = (message) => {
    if (message.includes('Please enter a task description')) {
      alertCalled = true;
    }
  };
  
  // Try to add task with empty description
  await TestUtils.setValue('#new-task', '');
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.short);
  
  if (!alertCalled) {
    throw new Error('Alert not shown for empty task description');
  }
  
  // Restore original alert
  window.alert = originalAlert;
});

taskTests.addTest('TASK-03', 'Edit Task Text', async () => {
  // Create a task first
  const originalText = 'Task to be edited';
  const editedText = 'Edited task text';
  
  await TestUtils.setValue('#new-task', originalText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task we just created
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === originalText
  );
  
  if (!task) {
    throw new Error('Task not found for editing');
  }
  
  // Double click to edit
  const taskTextElement = task.querySelector('.task-text');
  const dblClickEvent = new MouseEvent('dblclick', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  taskTextElement.dispatchEvent(dblClickEvent);
  
  // Set new value
  await TestUtils.setValue('', editedText, taskTextElement);
  
  // Trigger blur to save changes
  const blurEvent = new Event('blur', { bubbles: true });
  taskTextElement.dispatchEvent(blurEvent);
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify text was updated
  if (taskTextElement.value !== editedText) {
    throw new Error(`Task text was not updated: expected "${editedText}", got "${taskTextElement.value}"`);
  }
});

taskTests.addTest('TASK-04', 'Change Task Priority', async () => {
  // Create a task first
  const taskText = 'Task for priority change';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.setValue('#task-priority', 'low'); // Start with low priority
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task we just created
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for priority change');
  }
  
  // Verify initial priority class
  if (!task.classList.contains('priority-low')) {
    throw new Error('Task does not have initial priority-low class');
  }
  
  // Change priority to high
  const prioritySelect = task.querySelector('.task-priority');
  await TestUtils.setValue('', 'high', prioritySelect);
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify priority class was updated
  if (!task.classList.contains('priority-high')) {
    throw new Error('Task class was not updated to priority-high');
  }
});

taskTests.addTest('TASK-05', 'Change Task Category', async () => {
  // Create a task first
  const taskText = 'Task for category change';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.setValue('#task-category', 'work'); // Start with work category
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task we just created
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for category change');
  }
  
  // Verify initial category class
  if (!task.classList.contains('category-work')) {
    throw new Error('Task does not have initial category-work class');
  }
  
  // Change category to personal
  const categorySelect = task.querySelector('.task-category');
  await TestUtils.setValue('', 'personal', categorySelect);
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify category class was updated
  if (!task.classList.contains('category-personal')) {
    throw new Error('Task class was not updated to category-personal');
  }
  
  // Verify category label was updated
  const categoryLabel = task.querySelector('.category-label');
  if (categoryLabel.textContent !== 'personal') {
    throw new Error(`Category label was not updated: expected "personal", got "${categoryLabel.textContent}"`);
  }
});

// Run task management tests
taskTests.runTests().then(results => {
  console.log(`Task management tests complete: ${results.passed}/${results.total} tests passed`);
}).catch(error => {
  console.error('Test execution failed:', error);
});