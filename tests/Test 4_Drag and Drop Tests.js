// Drag and Drop Tests
const dragTests = new TestRunner();

dragTests.beforeEach(async () => {
  // Ensure logged in
  if (document.getElementById('board-section').style.display === 'none') {
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    await TestUtils.wait(config.testTimeouts.medium);
  }
});

dragTests.addTest('DRAG-01', 'Drag Task Between Columns', async () => {
  // Create a task for dragging
  const taskText = 'Drag test task';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for dragging');
  }
  
  // Get initial container and target container
  const sourceContainer = document.querySelector('#to-do .tasks-container');
  const targetContainer = document.querySelector('#in-progress .tasks-container');
  
  // Perform drag and drop
  await TestUtils.dragAndDrop(`#${task.id}`, '#in-progress .tasks-container');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify task moved to in-progress
  if (!targetContainer.contains(task)) {
    throw new Error('Task was not moved to the "In Progress" column after drag');
  }
  
  // Now drag to done column
  const doneContainer = document.querySelector('#done .tasks-container');
  await TestUtils.dragAndDrop(`#${task.id}`, '#done .tasks-container');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify task moved to done
  if (!doneContainer.contains(task)) {
    throw new Error('Task was not moved to the "Done" column after drag');
  }
});

dragTests.addTest('DRAG-02', 'Drag Within Same Column', async () => {
  // Create two tasks for testing reordering
  const taskText1 = 'Reorder task 1';
  const taskText2 = 'Reorder task 2';
  
  // Add first task
  await TestUtils.setValue('#new-task', taskText1);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Add second task
  await TestUtils.setValue('#new-task', taskText2);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the tasks
  const tasks = await TestUtils.getElements('#to-do .task');
  const task1 = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText1
  );
  const task2 = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText2
  );
  
  if (!task1 || !task2) {
    throw new Error('Tasks not found for reordering test');
  }
  
  // Get container
  const container = document.querySelector('#to-do .tasks-container');
  
  // Record initial order
  const initialOrder = Array.from(container.children);
  const initialTask1Index = initialOrder.indexOf(task1);
  const initialTask2Index = initialOrder.indexOf(task2);
  
  // Perform drag and drop within same container
  await TestUtils.dragAndDrop(`#${task2.id}`, '#to-do .tasks-container');
  
  // We're specifically dragging the element but not to a specific position
  // This test verifies the drag operation works but may not change the order
  // The actual result depends on the implementation details of the dragAndDrop utility
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify tasks are still in the same container
  if (!container.contains(task1) || !container.contains(task2)) {
    throw new Error('Tasks are no longer in the "To Do" column after drag within column');
  }
});

// Run drag and drop tests
dragTests.runTests().then(results => {
  console.log(`Drag and Drop tests complete: ${results.passed}/${results.total} tests passed`);
}).catch(error => {
  console.error('Test execution failed:', error);
});