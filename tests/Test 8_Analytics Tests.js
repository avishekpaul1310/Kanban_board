// Analytics Tests
const analyticsTests = new TestRunner();

analyticsTests.beforeEach(async () => {
  // Ensure logged in
  if (document.getElementById('board-section').style.display === 'none') {
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    await TestUtils.wait(config.testTimeouts.medium);
  }
});

analyticsTests.addTest('ANLY-01', 'Task Count Statistics', async () => {
  // Clear existing tasks
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
  
  // Create known number of tasks in each column
  const todoCount = 3;
  const inProgressCount = 2;
  const doneCount = 1;
  
  // Create To Do tasks
  for (let i = 0; i < todoCount; i++) {
    await TestUtils.setValue('#new-task', `Todo Task ${i+1}`);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
  }
  
  // Create In Progress tasks (add and move)
  for (let i = 0; i < inProgressCount; i++) {
    await TestUtils.setValue('#new-task', `In Progress Task ${i+1}`);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    // Find the task and set progress to 50% to move to In Progress
    const tasks = document.querySelectorAll('#to-do .task');
    const task = tasks[tasks.length - 1]; // Get last added task
    
    // Click +10% five times
    const plusBtn = task.querySelector('.progress-btn.plus');
    for (let j = 0; j < 5; j++) {
      plusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
  }
  
  // Create Done tasks (add and move)
  for (let i = 0; i < doneCount; i++) {
    await TestUtils.setValue('#new-task', `Done Task ${i+1}`);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    // Find the task and set progress to 100% to move to Done
    const tasks = document.querySelectorAll('#to-do .task');
    const task = tasks[tasks.length - 1]; // Get last added task
    
    // Click +10% ten times
    const plusBtn = task.querySelector('.progress-btn.plus');
    for (let j = 0; j < 10; j++) {
      plusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
  }
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify analytics counts
  const totalTasksElement = document.getElementById('total-tasks');
  const todoTasksElement = document.getElementById('todo-tasks');
  const inProgressTasksElement = document.getElementById('inprogress-tasks');
  const doneTasksElement = document.getElementById('done-tasks');
  
  if (parseInt(totalTasksElement.textContent) !== todoCount + inProgressCount + doneCount) {
    throw new Error(`Total tasks count incorrect, expected ${todoCount + inProgressCount + doneCount}, got ${totalTasksElement.textContent}`);
  }
  
  if (parseInt(todoTasksElement.textContent) !== todoCount) {
    throw new Error(`To Do tasks count incorrect, expected ${todoCount}, got ${todoTasksElement.textContent}`);
  }
  
  if (parseInt(inProgressTasksElement.textContent) !== inProgressCount) {
    throw new Error(`In Progress tasks count incorrect, expected ${inProgressCount}, got ${inProgressTasksElement.textContent}`);
  }
  
  if (parseInt(doneTasksElement.textContent) !== doneCount) {
    throw new Error(`Done tasks count incorrect, expected ${doneCount}, got ${doneTasksElement.textContent}`);
  }
});

analyticsTests.addTest('ANLY-02', 'Completion Rate', async () => {
  // Clear existing tasks
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
  
  // Create 4 tasks with 1 in Done column for 25% completion rate
  const totalTasks = 4;
  const doneTasks = 1;
  
  // Create tasks in To Do
  for (let i = 0; i < totalTasks - doneTasks; i++) {
    await TestUtils.setValue('#new-task', `Task ${i+1}`);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
  }
  
  // Create Done task (add and move)
  for (let i = 0; i < doneTasks; i++) {
    await TestUtils.setValue('#new-task', `Done Task ${i+1}`);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    // Find the task and set progress to 100% to move to Done
    const tasks = document.querySelectorAll('#to-do .task');
    const task = tasks[tasks.length - 1]; // Get last added task
    
    // Click +10% ten times
    const plusBtn = task.querySelector('.progress-btn.plus');
    for (let j = 0; j < 10; j++) {
      plusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
  }
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify completion rate
  const completionRateElement = document.getElementById('completion-rate');
  const expectedRate = Math.round((doneTasks / totalTasks) * 100);
  
  if (completionRateElement.textContent !== `${expectedRate}%`) {
    throw new Error(`Completion rate incorrect, expected ${expectedRate}%, got ${completionRateElement.textContent}`);
  }
});

// Run analytics tests
analyticsTests.runTests().then(results => {
  console.log(`Analytics tests complete: ${results.passed}/${results.total} tests passed`);
}).catch(error => {
  console.error('Test execution failed:', error);
});