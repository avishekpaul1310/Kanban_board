// Filter and Sort Tests
const filterSortTests = new TestRunner();

filterSortTests.beforeEach(async () => {
  // Ensure logged in
  if (document.getElementById('board-section').style.display === 'none') {
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    await TestUtils.wait(config.testTimeouts.medium);
  }
  
  // Create sample tasks if needed
  const tasks = document.querySelectorAll('.task');
  if (tasks.length < 3) {
    // Add some sample tasks
    for (const task of config.sampleTasks.slice(0, 3)) {
      await TestUtils.setValue('#new-task', task.text);
      await TestUtils.setValue('#task-priority', task.priority);
      await TestUtils.setValue('#task-category', task.category);
      await TestUtils.clickElement('#add-task');
      await TestUtils.wait(config.testTimeouts.short);
    }
    await TestUtils.wait(config.testTimeouts.medium);
  }
});

filterSortTests.addTest('FILT-01', 'Filter by Text', async () => {
  // Create a task with unique text
  const uniqueText = 'UNIQUEFILTERTEXT';
  
  await TestUtils.setValue('#new-task', uniqueText);
  await TestUtils.clickElement('#add-task');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Apply filter
  await TestUtils.setValue('#task-filter', uniqueText);
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Count visible tasks
  const allTasks = document.querySelectorAll('.task');
  let visibleCount = 0;
  let uniqueTaskFound = false;
  
  allTasks.forEach(task => {
    if (task.style.display !== 'none') {
      visibleCount++;
      
      if (task.querySelector('.task-text').value.includes(uniqueText)) {
        uniqueTaskFound = true;
      }
    }
  });
  
  // Verify only unique task is visible
  if (visibleCount !== 1) {
    throw new Error(`Expected 1 visible task after filtering, found ${visibleCount}`);
  }
  
  if (!uniqueTaskFound) {
    throw new Error('Unique task not found after filtering');
  }
  
  // Clear filter
  await TestUtils.setValue('#task-filter', '');
  
  await TestUtils.wait(config.testTimeouts.medium);
});

filterSortTests.addTest('FILT-02', 'Filter by Category', async () => {
  // Apply filter by category
  await TestUtils.setValue('#task-filter', 'health');
  
  await TestUtils.wait(config.testTimeouts.medium);
  
  // Count visible tasks
  const allTasks = document.querySelectorAll('.task');
  let visibleCount = 0;
  let nonMatchingCategoryFound = false;
  
  allTasks.forEach(task => {
    if (task.style.display !== 'none') {
      visibleCount++;
      
      const category = task.querySelector('.task-category').value;
      if (category !== 'health') {
        nonMatchingCategoryFound = true;
      }
    }
  });
  
  // Verify only health category tasks are visible
  if (nonMatchingCategoryFound) {
    throw new Error('Non-matching category tasks are visible after filtering by category');
  }
  
  // Verify at least one task is visible (assuming we have health tasks from setup)
  if (visibleCount === 0) {
    console.warn('No health category tasks found, test cannot fully verify filter');
  }
  
  // Clear filter
  await TestUtils.setValue('#task-filter', '');
  
  await TestUtils.wait(config.testTimeouts.medium);
});

// Run filter and sort tests
filterSortTests.runTests().then(results => {
  console.log(`Filter and Sort tests complete: ${results.passed}/${results.total} tests passed`);
}).catch(error => {
  console.error('Test execution failed:', error);
});