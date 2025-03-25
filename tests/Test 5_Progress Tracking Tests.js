// Progress Tracking Tests
const progressTests = new TestRunner();

progressTests.beforeEach(async () => {
  // Ensure logged in
  if (document.getElementById('board-section').style.display === 'none') {
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    await TestUtils.wait(config.testTimeouts.medium);
  }
});

progressTests.addTest('PROG-01', 'Increase Task Progress', async () => {
  // Create a task
  const taskText = 'Progress increase test task';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for progress test');
  }
  
  // Verify initial progress is 0%
  const progressValue = task.querySelector('.progress-value');
  if (progressValue.textContent !== '0%') {
    throw new Error(`Initial progress should be 0%, got ${progressValue.textContent}`);
  }
  
  // Click +10% button twice
  const plusBtn = task.querySelector('.progress-btn.plus');
  plusBtn.click();
  await TestUtils.wait(config.testTimeouts.short);
  plusBtn.click();
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify progress increased to 20%
  if (progressValue.textContent !== '20%') {
    throw new Error(`Progress should be 20% after clicking +10% twice, got ${progressValue.textContent}`);
  }
  
  // Verify progress bar width
  const progressBar = task.querySelector('.progress-bar');
  if (progressBar.style.width !== '20%') {
    throw new Error(`Progress bar width should be 20%, got ${progressBar.style.width}`);
  }
});

progressTests.addTest('PROG-02', 'Decrease Task Progress', async () => {
  // Create a task
  const taskText = 'Progress decrease test task';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for progress decrease test');
  }
  
  // Increase progress to 30% first
  const plusBtn = task.querySelector('.progress-btn.plus');
  for (let i = 0; i < 3; i++) {
    plusBtn.click();
    await TestUtils.wait(config.testTimeouts.short);
  }
  
  // Verify progress is 30%
  const progressValue = task.querySelector('.progress-value');
  if (progressValue.textContent !== '30%') {
    throw new Error(`Progress should be 30% after setup, got ${progressValue.textContent}`);
  }
  
  // Click -10% button
  const minusBtn = task.querySelector('.progress-btn.minus');
  minusBtn.click();
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify progress decreased to 20%
  if (progressValue.textContent !== '20%') {
    throw new Error(`Progress should be 20% after clicking -10%, got ${progressValue.textContent}`);
  }
  
  // Verify progress bar width
  const progressBar = task.querySelector('.progress-bar');
  if (progressBar.style.width !== '20%') {
    throw new Error(`Progress bar width should be 20%, got ${progressBar.style.width}`);
  }
});

progressTests.addTest('PROG-03', 'Progress Limits', async () => {
  // Create a task
  const taskText = 'Progress limits test task';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const tasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(tasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for progress limits test');
  }
  
  // Try to decrease from 0%
  const minusBtn = task.querySelector('.progress-btn.minus');
  minusBtn.click();
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify progress is still 0%
  const progressValue = task.querySelector('.progress-value');
  if (progressValue.textContent !== '0%') {
    throw new Error(`Progress should still be 0% after clicking -10% at minimum, got ${progressValue.textContent}`);
  }
  
  // Increase to 100%
  const plusBtn = task.querySelector('.progress-btn.plus');
  for (let i = 0; i < 10; i++) {
    plusBtn.click();
    await TestUtils.wait(config.testTimeouts.short);
  }
  
  // Verify progress is 100%
  if (progressValue.textContent !== '100%') {
    throw new Error(`Progress should be 100% after setup, got ${progressValue.textContent}`);
  }
  
  // Try to increase beyond 100%
  plusBtn.click();
  
  await TestUtils.wait(config.testTimeouts.short);
  
  // Verify progress is still 100%
  if (progressValue.textContent !== '100%') {
    throw new Error(`Progress should still be 100% after clicking +10% at maximum, got ${progressValue.textContent}`);
  }
});

progressTests.addTest('PROG-04', 'Auto Column Movement', async () => {
  // Create a task in To Do
  const taskText = 'Auto move progress task';
  
  await TestUtils.setValue('#new-task', taskText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Find the task
  const todoTasks = await TestUtils.getElements('#to-do .task');
  const task = Array.from(todoTasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!task) {
    throw new Error('Task not found for auto move test');
  }
  
  // Click +10% button
  const plusBtn = task.querySelector('.progress-btn.plus');
  plusBtn.click();
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify task moved to In Progress
  const inProgressContainer = document.querySelector('#in-progress .tasks-container');
  const inProgressTasks = inProgressContainer.querySelectorAll('.task');
  const taskInProgress = Array.from(inProgressTasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!taskInProgress) {
    throw new Error('Task did not auto-move to In Progress when progress > 0%');
  }
  
  // Now increase to 100%
  for (let i = 0; i < 9; i++) {
    taskInProgress.querySelector('.progress-btn.plus').click();
    await TestUtils.wait(config.testTimeouts.short);
  }
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Verify task moved to Done
  const doneContainer = document.querySelector('#done .tasks-container');
  const doneTasks = doneContainer.querySelectorAll('.task');
  const taskInDone = Array.from(doneTasks).find(t => 
    t.querySelector('.task-text').value === taskText
  );
  
  if (!taskInDone) {
    throw new Error('Task did not auto-move to Done when progress = 100%');
  }
});

// Run progress tracking tests
progressTests.runTests().then(results => {
  console.log(`Progress Tracking tests complete: ${results.passed}/${results.total} tests passed`);
}).catch(error => {
  console.error('Test execution failed:', error);
});