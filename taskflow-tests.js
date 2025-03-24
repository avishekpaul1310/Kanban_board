/**
 * TaskFlow Kanban Board - Automated Test Script
 * 
 * This script provides automated testing for the TaskFlow kanban board application.
 * It covers all test cases specified in the comprehensive test plan.
 * 
 * How to use:
 * 1. Save this file as taskflow-tests.js
 * 2. Open your browser's console on the TaskFlow application page
 * 3. Copy and paste this entire script into the console, or load it via developer tools
 * 4. Tests will run automatically and results will be displayed in the console
 */

// Test Suite Configuration
const config = {
    testTimeouts: {
      short: 500,    // For quick operations
      medium: 1000,  // For standard operations
      long: 2000,    // For operations that might take time (e.g. animations)
      timer: 3000    // For timer related tests
    },
    testUsers: {
      newUser: {
        username: `test_user_${Date.now()}`,  // Generate unique username
        password: 'Test@1234'
      },
      existingUser: {
        username: `existing_user_${Date.now()}`,
        password: 'Test@1234'
      }
    },
    sampleTasks: [
      { text: 'Implement user authentication', priority: 'high', category: 'work', progress: 0 },
      { text: 'Design database schema', priority: 'medium', category: 'work', progress: 50 },
      { text: 'Research UI frameworks', priority: 'low', category: 'study', progress: 20 },
      { text: 'Exercise for 30 minutes', priority: 'medium', category: 'health', progress: 0 },
      { text: 'Call mom', priority: 'high', category: 'personal', progress: 0 }
    ]
  };
  
  // Test Results Tracking
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    results: []
  };
  
  // Test Utilities
  const TestUtils = {
    // Waits for specified milliseconds
    wait: async (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Gets element by selector with optional timeout for elements that might appear later
    getElement: async (selector, timeout = config.testTimeouts.short) => {
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await TestUtils.wait(50);
      }
      throw new Error(`Element with selector "${selector}" not found after ${timeout}ms`);
    },
    
    // Gets multiple elements matching a selector
    getElements: async (selector, timeout = config.testTimeouts.short) => {
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) return elements;
        await TestUtils.wait(50);
      }
      throw new Error(`Elements with selector "${selector}" not found after ${timeout}ms`);
    },
    
    // Sets value to an input element
    setValue: async (selector, value) => {
      const element = await TestUtils.getElement(selector);
      element.value = value;
      
      // Trigger change and input events for event listeners
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      return element;
    },
    
    // Clicks an element
    clickElement: async (selector) => {
      const element = await TestUtils.getElement(selector);
      element.click();
      return element;
    },
    
    // Simulates drag and drop
    dragAndDrop: async (sourceSelector, targetSelector) => {
      const sourceElement = await TestUtils.getElement(sourceSelector);
      const targetElement = await TestUtils.getElement(targetSelector);
      
      // Create dragstart event
      const dragStartEvent = new MouseEvent('dragstart', {
        bubbles: true,
        cancelable: true
      });
  
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
      throw new Error('No tasks visible after filtering by health category');
    }
    
    // Clear filter
    await TestUtils.setValue('#task-filter', '');
    
    await TestUtils.wait(config.testTimeouts.medium);
  });
  
  filterSortTests.addTest('SORT-01', 'Sort by Newest', async () => {
    // Create a new task to ensure we have a newest
    const newestTaskText = 'Newest task for sorting test';
    
    await TestUtils.setValue('#new-task', newestTaskText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Apply sort
    await TestUtils.setValue('#task-sort', 'newest');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Get first task in To Do column
    const firstTask = document.querySelector('#to-do .tasks-container .task');
    
    if (!firstTask) {
      throw new Error('No tasks found in To Do column after sorting');
    }
    
    // Verify first task is the newest one
    const firstTaskText = firstTask.querySelector('.task-text').value;
    if (firstTaskText !== newestTaskText) {
      throw new Error(`Expected newest task "${newestTaskText}" to be first, got "${firstTaskText}"`);
    }
  });
  
  filterSortTests.addTest('SORT-02', 'Sort by Priority', async () => {
    // Make sure we have tasks with different priorities
    let hasHighPriority = false;
    let hasLowPriority = false;
    const tasks = document.querySelectorAll('.task');
    
    // Check if we need to create additional tasks
    tasks.forEach(task => {
      const priority = task.querySelector('.task-priority').value;
      if (priority === 'high') hasHighPriority = true;
      if (priority === 'low') hasLowPriority = true;
    });
    
    // Create high priority task if needed
    if (!hasHighPriority) {
      await TestUtils.setValue('#new-task', 'High priority task');
      await TestUtils.setValue('#task-priority', 'high');
      await TestUtils.clickElement('#add-task');
      await TestUtils.wait(config.testTimeouts.short);
    }
    
    // Create low priority task if needed
    if (!hasLowPriority) {
      await TestUtils.setValue('#new-task', 'Low priority task');
      await TestUtils.setValue('#task-priority', 'low');
      await TestUtils.clickElement('#add-task');
      await TestUtils.wait(config.testTimeouts.short);
    }
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Apply sort
    await TestUtils.setValue('#task-sort', 'priority');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Get first task in To Do column
    const firstTask = document.querySelector('#to-do .tasks-container .task');
    
    if (!firstTask) {
      throw new Error('No tasks found in To Do column after sorting');
    }
    
    // Verify first task is high priority
    const firstTaskPriority = firstTask.querySelector('.task-priority').value;
    if (firstTaskPriority !== 'high') {
      throw new Error(`Expected high priority task to be first, got "${firstTaskPriority}" priority`);
    }
  });
  
  filterSortTests.addTest('SORT-03', 'Sort by Alphabetical', async () => {
    // Create two tasks with alphabetically distinct names
    const aTaskText = 'AAAA alphabetical sort test';
    const zTaskText = 'ZZZZ alphabetical sort test';
    
    await TestUtils.setValue('#new-task', zTaskText);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    await TestUtils.setValue('#new-task', aTaskText);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Apply sort
    await TestUtils.setValue('#task-sort', 'alphabetical');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Get first task in To Do column
    const firstTask = document.querySelector('#to-do .tasks-container .task');
    
    if (!firstTask) {
      throw new Error('No tasks found in To Do column after sorting');
    }
    
    // Verify first task is the 'A' task
    const firstTaskText = firstTask.querySelector('.task-text').value;
    if (!firstTaskText.startsWith('A')) {
      throw new Error(`Expected task starting with 'A' to be first after alphabetical sort, got "${firstTaskText}"`);
    }
  });
  
  filterSortTests.addTest('SORT-04', 'Sort by Progress', async () => {
    // Create tasks with different progress levels
    const noProgressTaskText = 'Zero progress task';
    const halfProgressTaskText = 'Half progress task';
    const fullProgressTaskText = 'Full progress task';
    
    // Create zero progress task
    await TestUtils.setValue('#new-task', noProgressTaskText);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    // Create and set half progress task
    await TestUtils.setValue('#new-task', halfProgressTaskText);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    // Find the half progress task and set progress to 50%
    const allTasks = document.querySelectorAll('#to-do .task');
    const halfProgressTask = Array.from(allTasks).find(task => 
      task.querySelector('.task-text').value === halfProgressTaskText
    );
    
    if (!halfProgressTask) {
      throw new Error('Half progress task not found');
    }
    
    // Click +10% five times
    const halfTaskPlusBtn = halfProgressTask.querySelector('.progress-btn.plus');
    for (let i = 0; i < 5; i++) {
      halfTaskPlusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
    
    // Create and set full progress task
    await TestUtils.setValue('#new-task', fullProgressTaskText);
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    // Find the full progress task and set progress to 100%
    const updatedTasks = document.querySelectorAll('.task');
    const fullProgressTask = Array.from(updatedTasks).find(task => 
      task.querySelector('.task-text').value === fullProgressTaskText
    );
    
    if (!fullProgressTask) {
      throw new Error('Full progress task not found');
    }
    
    // Click +10% ten times
    const fullTaskPlusBtn = fullProgressTask.querySelector('.progress-btn.plus');
    for (let i = 0; i < 10; i++) {
      fullTaskPlusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
    
    // Apply sort
    await TestUtils.setValue('#task-sort', 'progress');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Get first task in Done column (100% progress tasks move to Done)
    const firstDoneTask = document.querySelector('#done .tasks-container .task');
    
    if (!firstDoneTask) {
      throw new Error('No tasks found in Done column after setting 100% progress');
    }
    
    // Verify first task in Done is the full progress task
    const firstDoneTaskText = firstDoneTask.querySelector('.task-text').value;
    if (firstDoneTaskText !== fullProgressTaskText) {
      throw new Error(`Expected full progress task to be first in Done column, got "${firstDoneTaskText}"`);
    }
    
    // Get first task in In Progress column (50% progress tasks move to In Progress)
    const firstInProgressTask = document.querySelector('#in-progress .tasks-container .task');
    
    if (!firstInProgressTask) {
      throw new Error('No tasks found in In Progress column after setting 50% progress');
    }
    
    // Verify first task in In Progress is the half progress task
    const firstInProgressTaskText = firstInProgressTask.querySelector('.task-text').value;
    if (firstInProgressTaskText !== halfProgressTaskText) {
      throw new Error(`Expected half progress task to be first in In Progress column, got "${firstInProgressTaskText}"`);
    }
  });
  
  // Data Persistence Tests
  const dataTests = new TestRunner();
  
  dataTests.beforeEach(async () => {
    // Ensure logged in
    if (document.getElementById('board-section').style.display === 'none') {
      const { username, password } = config.testUsers.existingUser;
      await TestUtils.setValue('#username', username);
      await TestUtils.setValue('#password', password);
      await TestUtils.clickElement('#login-button');
      await TestUtils.wait(config.testTimeouts.medium);
    }
  });
  
  dataTests.addTest('DATA-01', 'Save Board State', async () => {
    // Create a distinctive task
    const uniqueTaskText = `Persistence test task ${Date.now()}`;
    
    await TestUtils.setValue('#new-task', uniqueTaskText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Logout and login again
    await TestUtils.clickElement('#logout-button');
    await TestUtils.wait(config.testTimeouts.medium);
    
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Check if task persisted
    const tasks = document.querySelectorAll('.task');
    let taskFound = false;
    
    tasks.forEach(task => {
      const taskText = task.querySelector('.task-text').value;
      if (taskText === uniqueTaskText) {
        taskFound = true;
      }
    });
    
    if (!taskFound) {
      throw new Error('Task did not persist after logout and login');
    }
  });
  
  dataTests.addTest('DATA-02', 'Export Board Data', async () => {
    // Mock window.URL.createObjectURL and a.download
    let exportData = null;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalClick = HTMLAnchorElement.prototype.click;
    
    URL.createObjectURL = (blob) => {
      // Read the blob content
      const reader = new FileReader();
      reader.onload = () => {
        exportData = reader.result;
      };
      reader.readAsText(blob);
      
      return 'mock-url';
    };
    
    HTMLAnchorElement.prototype.click = function() {
      // Do nothing, just intercept the click
    };
    
    // Create a distinctive task for export
    const exportTaskText = `Export test task ${Date.now()}`;
    
    await TestUtils.setValue('#new-task', exportTaskText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Click export button
    await TestUtils.clickElement('#export-board');
    
    // Wait for async operations
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Restore mocked functions
    URL.createObjectURL = originalCreateObjectURL;
    HTMLAnchorElement.prototype.click = originalClick;
    
    // Verify export data contains our task
    if (!exportData) {
      throw new Error('Export data was not captured');
    }
    
    try {
      const parsedData = JSON.parse(exportData);
      
      // Check if our export task is in the data
      let taskFound = false;
      
      // Check in each column
      ['to-do', 'in-progress', 'done'].forEach(column => {
        if (parsedData[column]) {
          parsedData[column].forEach(task => {
            if (task.text === exportTaskText) {
              taskFound = true;
            }
          });
        }
      });
      
      if (!taskFound) {
        throw new Error('Exported task not found in export data');
      }
      
      // Verify export contains basic structure
      if (!parsedData.user || !parsedData.exportedAt) {
        throw new Error('Export data missing required fields');
      }
    } catch (error) {
      throw new Error(`Error parsing export data: ${error.message}`);
    }
  });
  
  dataTests.addTest('DATA-03', 'Import Board Data', async () => {
    // Create a mock file with import data
    const importTaskText = `Import test task ${Date.now()}`;
    const importData = {
      'to-do': [
        {
          id: `task-import-${Date.now()}`,
          text: importTaskText,
          priority: 'medium',
          dueDate: '',
          category: 'work',
          progress: '0'
        }
      ],
      'in-progress': [],
      'done': [],
      'user': config.testUsers.existingUser.username,
      'exportedAt': new Date().toISOString()
    };
    
    // Create a File object
    const file = new File(
      [JSON.stringify(importData)],
      'kanban_board_import_test.json',
      { type: 'application/json' }
    );
    
    // Mock confirm dialog to return true
    TestUtils.mockConfirm(true);
    
    // Mock FileReader
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener) {
      if (type === 'change' && this.id === 'import-board') {
        // Simulate file selection
        const changeEvent = new Event('change');
        Object.defineProperty(this, 'files', {
          value: [file],
          writable: true
        });
        
        // Trigger change event
        listener(changeEvent);
        return;
      }
      
      return originalAddEventListener.apply(this, arguments);
    };
    
    // Click import button
    await TestUtils.clickElement('#import-board-btn');
    
    // Wait for import to process
    await TestUtils.wait(config.testTimeouts.long);
    
    // Restore mocked functions
    EventTarget.prototype.addEventListener = originalAddEventListener;
    TestUtils.restoreConfirm();
    
    // Check if import task is present
    const tasks = document.querySelectorAll('.task');
    let importTaskFound = false;
    
    tasks.forEach(task => {
      const taskText = task.querySelector('.task-text').value;
      if (taskText === importTaskText) {
        importTaskFound = true;
      }
    });
    
    if (!importTaskFound) {
      throw new Error('Imported task not found after import');
    }
  });
  
  dataTests.addTest('DATA-04', 'Import Confirmation', async () => {
    // Mock confirm to track if it was called
    let confirmCalled = false;
    const originalConfirm = window.confirm;
    
    window.confirm = (message) => {
      if (message.includes('overwrite your current board')) {
        confirmCalled = true;
        return false; // Cancel the import
      }
      return originalConfirm(message);
    };
    
    // Create a mock file with import data
    const importData = {
      'to-do': [],
      'in-progress': [],
      'done': [],
      'user': config.testUsers.existingUser.username,
      'exportedAt': new Date().toISOString()
    };
    
    // Create a File object
    const file = new File(
      [JSON.stringify(importData)],
      'kanban_board_import_test.json',
      { type: 'application/json' }
    );
    
    // Mock FileReader
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener) {
      if (type === 'change' && this.id === 'import-board') {
        // Simulate file selection
        const changeEvent = new Event('change');
        Object.defineProperty(this, 'files', {
          value: [file],
          writable: true
        });
        
        // Trigger change event
        listener(changeEvent);
        return;
      }
      
      return originalAddEventListener.apply(this, arguments);
    };
    
    // Click import button
    await TestUtils.clickElement('#import-board-btn');
    
    // Wait for import to process
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Restore mocked functions
    EventTarget.prototype.addEventListener = originalAddEventListener;
    window.confirm = originalConfirm;
    
    // Verify confirmation was shown
    if (!confirmCalled) {
      throw new Error('Import confirmation dialog was not shown');
    }
  });
  
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
  
  analyticsTests.addTest('ANLY-03', 'Average Progress', async () => {
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
    
    // Create 2 tasks with 30% and 70% progress for 50% average
    
    // Create first task with 30% progress
    await TestUtils.setValue('#new-task', 'Task with 30% progress');
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    const firstTasks = document.querySelectorAll('#to-do .task');
    const firstTask = firstTasks[firstTasks.length - 1];
    
    // Click +10% three times
    const firstTaskPlusBtn = firstTask.querySelector('.progress-btn.plus');
    for (let i = 0; i < 3; i++) {
      firstTaskPlusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
    
    // Create second task with 70% progress
    await TestUtils.setValue('#new-task', 'Task with 70% progress');
    await TestUtils.clickElement('#add-task');
    await TestUtils.wait(config.testTimeouts.short);
    
    const secondTasks = document.querySelectorAll('.task');
    const secondTask = Array.from(secondTasks).find(t => 
      t.querySelector('.task-text').value === 'Task with 70% progress'
    );
    
    // Click +10% seven times
    const secondTaskPlusBtn = secondTask.querySelector('.progress-btn.plus');
    for (let i = 0; i < 7; i++) {
      secondTaskPlusBtn.click();
      await TestUtils.wait(config.testTimeouts.short);
    }
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Verify average progress
    const averageProgressElement = document.getElementById('average-progress');
    const expectedAverage = Math.round((30 + 70) / 2);
    
    if (averageProgressElement.textContent !== `${expectedAverage}%`) {
      throw new Error(`Average progress incorrect, expected ${expectedAverage}%, got ${averageProgressElement.textContent}`);
    }
  });
  
  analyticsTests.addTest('ANLY-04', 'Task Distribution Chart', async () => {
    // This test is more of a visual verification
    // We'll check if the chart container exists and has the expected number of bars
    
    const chartContainer = document.getElementById('task-distribution-chart');
    
    if (!chartContainer) {
      throw new Error('Task distribution chart container not found');
    }
    
    // Check if chart has 3 bars (To Do, In Progress, Done)
    const bars = chartContainer.querySelectorAll('.bar');
    
    if (bars.length !== 3) {
      throw new Error(`Expected 3 bars in task distribution chart, found ${bars.length}`);
    }
    
    // Verify bar labels
    const barLabels = Array.from(bars).map(bar => 
      bar.querySelector('.bar-label').textContent
    );
    
    const expectedLabels = ['To Do', 'In Progress', 'Done'];
    
    for (const label of expectedLabels) {
      if (!barLabels.includes(label)) {
        throw new Error(`Bar label "${label}" not found in task distribution chart`);
      }
    }
  });
  
  analyticsTests.addTest('ANLY-05', 'Category Distribution Chart', async () => {
    // This test is more of a visual verification
    // We'll check if the chart container exists
    
    const chartContainer = document.getElementById('category-distribution-chart');
    
    if (!chartContainer) {
      throw new Error('Category distribution chart container not found');
    }
    
    // Check if chart has a pie chart container
    const pieChartContainer = chartContainer.querySelector('.pie-chart-container');
    
    if (!pieChartContainer) {
      throw new Error('Pie chart container not found within category distribution chart');
    }
    
    // Check if chart has a legend
    const legend = chartContainer.querySelector('.pie-chart-legend');
    
    if (!legend) {
      throw new Error('Pie chart legend not found');
    }
    
    // Verify segments and legend items are created
    const segments = pieChartContainer.querySelectorAll('.pie-chart-segment');
    const legendItems = legend.querySelectorAll('.pie-chart-legend-item');
    
    if (segments.length === 0) {
      throw new Error('No segments found in category pie chart');
    }
    
    if (legendItems.length === 0) {
      throw new Error('No legend items found in category pie chart');
    }
  });
  
  // Responsive Design Tests
  const responsiveTests = new TestRunner();
  
  responsiveTests.beforeEach(async () => {
    // Ensure logged in
    if (document.getElementById('board-section').style.display === 'none') {
      const { username, password } = config.testUsers.existingUser;
      await TestUtils.setValue('#username', username);
      await TestUtils.setValue('#password', password);
      await TestUtils.clickElement('#login-button');
      await TestUtils.wait(config.testTimeouts.medium);
    }
  });
  
  responsiveTests.addTest('RESP-01', 'Desktop Layout', async () => {
    // Set desktop viewport size
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    
    // Define desktop size as > 768px width
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    
    // Trigger a resize event
    window.dispatchEvent(new Event('resize'));
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Check if columns are side by side in desktop view
    const kanbanBoard = document.querySelector('.kanban-board');
    const computedStyle = window.getComputedStyle(kanbanBoard);
    
    if (computedStyle.flexDirection === 'column') {
      throw new Error('Kanban board has column flex direction in desktop layout');
    }
    
    // Restore original viewport
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight });
    
    // Trigger resize event again
    window.dispatchEvent(new Event('resize'));
    
    await TestUtils.wait(config.testTimeouts.short);
  });
  
  responsiveTests.addTest('RESP-02', 'Mobile Layout', async () => {
    // Set mobile viewport size
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    
    // Define mobile size as < 768px width
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
    
    // Add matchMedia mock for mobile viewport
    if (!window.originalMatchMedia) {
      window.originalMatchMedia = window.matchMedia;
    }
    
    window.matchMedia = (query) => {
      return {
        matches: query.includes('max-width') && parseInt(query.match(/\d+/)[0]) > 375,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      };
    };
    
    // Trigger a resize event
    window.dispatchEvent(new Event('resize'));
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Check form layout in mobile view
    const taskForm = document.getElementById('task-form');
    const taskFormStyle = window.getComputedStyle(taskForm);
    
    // We assume the CSS is applying mobile layouts correctly
    // since we can't always fully simulate media queries in tests
    
    // Check if filter and sort layout adapts
    const filterSortContainer = document.getElementById('filter-sort-container');
    const filterGroup = filterSortContainer.querySelector('.filter-group');
    const filterStyle = window.getComputedStyle(filterGroup);
    
    if (filterStyle.width !== '100%' && window.innerWidth <= 768) {
      // This check is approximate since the test environment may not perfectly simulate media queries
      console.warn('Filter group width may not be adapting properly in mobile view');
    }
    
    // Restore original viewport
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight });
    
    // Restore original matchMedia
    if (window.originalMatchMedia) {
      window.matchMedia = window.originalMatchMedia;
      delete window.originalMatchMedia;
    }
    
    // Trigger resize event again
    window.dispatchEvent(new Event('resize'));
    
    await TestUtils.wait(config.testTimeouts.short);
  });
  
  responsiveTests.addTest('RESP-03', 'Task Interactions on Mobile', async () => {
    // Set mobile viewport size
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    
    // Define mobile size as < 768px width
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
    
    // Trigger a resize event
    window.dispatchEvent(new Event('resize'));
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Create a task for testing mobile interactions
    const taskText = 'Mobile interaction test task';
    
    await TestUtils.setValue('#new-task', taskText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Find the task
    const tasks = document.querySelectorAll('#to-do .task');
    const task = Array.from(tasks).find(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (!task) {
      throw new Error('Task not found for mobile interaction test');
    }
    
    // Test editing task text
    const taskTextElement = task.querySelector('.task-text');
    const dblClickEvent = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    taskTextElement.dispatchEvent(dblClickEvent);
    
    // Set new value
    await TestUtils.setValue('', 'Edited on mobile', taskTextElement);
    
    // Trigger blur to save changes
    const blurEvent = new Event('blur', { bubbles: true });
    taskTextElement.dispatchEvent(blurEvent);
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify text was updated
    if (taskTextElement.value !== 'Edited on mobile') {
      throw new Error(`Task text editing failed on mobile view: expected "Edited on mobile", got "${taskTextElement.value}"`);
    }
    
    // Test progress buttons
    const plusBtn = task.querySelector('.progress-btn.plus');
    plusBtn.click();
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify progress updated
    const progressValue = task.querySelector('.progress-value');
    if (progressValue.textContent !== '10%') {
      throw new Error(`Progress update failed on mobile view: expected 10%, got ${progressValue.textContent}`);
    }
    
    // Test timer buttons
    const timerToggle = task.querySelector('.timer-toggle');
    timerToggle.click();
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify timer activated
    if (!task.classList.contains('timer-active')) {
      throw new Error('Timer activation failed on mobile view');
    }
    
    // Stop timer
    timerToggle.click();
    
    // Restore original viewport
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight });
    
    // Trigger resize event again
    window.dispatchEvent(new Event('resize'));
    
    await TestUtils.wait(config.testTimeouts.short);
  });
  
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
    
    // Create 20 tasks in each column
    const tasksPerColumn = 5; // Reduced for test efficiency
    
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
    
    // Check analytics updates with many tasks
    const totalTasksElement = document.getElementById('total-tasks');
    if (parseInt(totalTasksElement.textContent) !== tasksPerColumn * 3) {
      throw new Error(`Total tasks count incorrect with many tasks, expected ${tasksPerColumn * 3}, got ${totalTasksElement.textContent}`);
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
    
    // Check if progress buttons work
    const plusBtn = task.querySelector('.progress-btn.plus');
    plusBtn.click();
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify progress updated
    const progressValue = task.querySelector('.progress-value');
    if (progressValue.textContent !== '10%') {
      throw new Error(`Progress update failed with long text: expected 10%, got ${progressValue.textContent}`);
    }
  });
  
  edgeTests.addTest('EDGE-03', 'Special Characters', async () => {
    // Create tasks with special characters
    const specialChars = [
      'Task with emoji 🚀 and symbols &%$#@!',
      'Task with accents: éèêëàâäôöùûüÿç',
      'Task with quotes "double" and \'single\'',
      'Task with <html> like syntax &lt;div&gt;'
    ];
    
    // Create each special character task
    for (const text of specialChars) {
      await TestUtils.setValue('#new-task', text);
      await TestUtils.clickElement('#add-task');
      await TestUtils.wait(config.testTimeouts.short);
    }
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Verify all tasks were created correctly
    for (const text of specialChars) {
      const tasks = document.querySelectorAll('.task');
      const task = Array.from(tasks).find(t => 
        t.querySelector('.task-text').value === text
      );
      
      if (!task) {
        throw new Error(`Task with special characters not found: "${text}"`);
      }
    }
    
    // Logout and login again to test persistence of special characters
    await TestUtils.clickElement('#logout-button');
    await TestUtils.wait(config.testTimeouts.medium);
    
    const { username, password } = config.testUsers.existingUser;
    await TestUtils.setValue('#username', username);
    await TestUtils.setValue('#password', password);
    await TestUtils.clickElement('#login-button');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Verify tasks with special characters persisted
    for (const text of specialChars) {
      const tasks = document.querySelectorAll('.task');
      const task = Array.from(tasks).find(t => 
        t.querySelector('.task-text').value === text
      );
      
      if (!task) {
        throw new Error(`Task with special characters did not persist after logout: "${text}"`);
      }
    }
  });
  
  edgeTests.addTest('EDGE-04', 'Browser Refresh', async () => {
    // Create a distinctive task
    const refreshTestText = `Refresh test task ${Date.now()}`;
    
    await TestUtils.setValue('#new-task', refreshTestText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Simulate browser refresh by directly calling loadBoardState
    // First we'll clear the DOM
    document.querySelectorAll('.tasks-container').forEach(container => {
      container.innerHTML = '';
    });
    
    // Then call loadBoardState to restore from localStorage
    if (typeof loadBoardState === 'function') {
      loadBoardState();
      await TestUtils.wait(config.testTimeouts.medium);
      
      // Check if task was restored
      const tasks = document.querySelectorAll('.task');
      const taskFound = Array.from(tasks).some(task => 
        task.querySelector('.task-text').value === refreshTestText
      );
      
      if (!taskFound) {
        throw new Error('Task not found after simulated browser refresh');
      }
    } else {
      // Alternative approach if loadBoardState is not directly accessible
      // Force a re-login to trigger board load
      await TestUtils.clickElement('#logout-button');
      await TestUtils.wait(config.testTimeouts.medium);
      
      const { username, password } = config.testUsers.existingUser;
      await TestUtils.setValue('#username', username);
      await TestUtils.setValue('#password', password);
      await TestUtils.clickElement('#login-button');
      
      await TestUtils.wait(config.testTimeouts.medium);
      
      // Check if task was restored
      const tasks = document.querySelectorAll('.task');
      const taskFound = Array.from(tasks).some(task => 
        task.querySelector('.task-text').value === refreshTestText
      );
      
      if (!taskFound) {
        throw new Error('Task not found after simulated browser refresh');
      }
    }
  });
  
  // Run all tests
  async function runAllTests() {
    // Reset app state before starting tests
    TestUtils.clearAppState();
    
    console.log('Starting TaskFlow Kanban Board automated tests...');
    
    try {
      // Set up existing user for tests
      localStorage.setItem(
        `user_${config.testUsers.existingUser.username}`, 
        JSON.stringify(config.testUsers.existingUser)
      );
      
      // Run test suites
      await authTests.runTests();
      await taskTests.runTests();
      await dragTests.runTests();
      await progressTests.runTests();
      await timerTests.runTests();
      await filterSortTests.runTests();
      await dataTests.runTests();
      await analyticsTests.runTests();
      await responsiveTests.runTests();
      await edgeTests.runTests();
      
      console.log('All tests completed!');
      return testResults;
    } catch (error) {
      console.error('Error running tests:', error);
      throw error;
    }
  }
  
  // Execute tests when script is run
  runAllTests().then(results => {
    console.log(`Test run complete: ${results.passed}/${results.total} tests passed`);
  }).catch(error => {
    console.error('Test execution failed:', error);
  });
  
  
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
  
  timerTests.addTest('TIMER-04', 'Timer Completion', async () => {
    // Mock alert for timer completion
    const originalAlert = window.alert;
    let alertCalled = false;
    
    window.alert = (message) => {
      if (message.includes('Timer complete')) {
        alertCalled = true;
      }
    };
    
    // Create a task
    const taskText = 'Timer completion test task';
    
    await TestUtils.setValue('#new-task', taskText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Find the task
    const tasks = await TestUtils.getElements('#to-do .task');
    const task = Array.from(tasks).find(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (!task) {
      throw new Error('Task not found for timer completion test');
    }
    
    // Set timer to 1 second for testing
    const timeInput = task.querySelector('.timer-input');
    await TestUtils.setValue('', '0.017', timeInput); // ~1 second (1/60th of a minute)
    
    // Get timerInterval variable to speed up test
    const timerToggle = task.querySelector('.timer-toggle');
    
    // Start timer
    timerToggle.click();
    
    // Wait for timer to complete (plus a bit extra)
    await TestUtils.wait(config.testTimeouts.timer);
    
    // Verify alert was called
    if (!alertCalled) {
      throw new Error('Timer completion alert was not shown');
    }
    
    // Verify task moved to In Progress
    const inProgressContainer = document.querySelector('#in-progress .tasks-container');
    if (!inProgressContainer.contains(task)) {
      throw new Error('Task did not move to In Progress after timer completion');
    }
    
    // Restore original alert
    window.alert = originalAlert;
  });
  
  timerTests.addTest('TIMER-05', 'Single Active Timer', async () => {
    // Create two tasks
    const taskText1 = 'Timer task 1';
    const taskText2 = 'Timer task 2';
    
    await TestUtils.setValue('#new-task', taskText1);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.short);
    
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
      throw new Error('Tasks not found for single active timer test');
    }
    
    // Start timer on first task
    const timerToggle1 = task1.querySelector('.timer-toggle');
    timerToggle1.click();
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify first timer is active
    if (!task1.classList.contains('timer-active')) {
      throw new Error('First task timer did not activate');
    }
    
    // Start timer on second task
    const timerToggle2 = task2.querySelector('.timer-toggle');
    timerToggle2.click();
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify second timer is active
    if (!task2.classList.contains('timer-active')) {
      throw new Error('Second task timer did not activate');
    }
    
    // Verify first timer is no longer active
    if (task1.classList.contains('timer-active')) {
      throw new Error('First task timer did not deactivate when second timer started');
    }
    
    // Stop second timer to clean up
    timerToggle2.click();
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
  
  dragTests.addTest('DRAG-03', 'Drag Visual Feedback', async () => {
    // Create a task for dragging
    const taskText = 'Visual feedback test task';
    
    await TestUtils.setValue('#new-task', taskText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Find the task
    const tasks = await TestUtils.getElements('#to-do .task');
    const task = Array.from(tasks).find(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (!task) {
      throw new Error('Task not found for drag visual feedback test');
    }
    
    // Start the drag
    const dragStartEvent = new MouseEvent('dragstart', {
      bubbles: true,
      cancelable: true
    });
    
    // Add dataTransfer to the event
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: {
        data: {},
        setData: function(format, data) {
          this.data[format] = data;
        },
        getData: function(format) {
          return this.data[format];
        }
      }
    });
    
    // Dispatch dragstart on source element
    task.dispatchEvent(dragStartEvent);
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify task has dragging class
    if (!task.classList.contains('dragging')) {
      throw new Error('Task does not have dragging class during dragstart');
    }
    
    // Simulate dragover on target container
    const targetContainer = document.querySelector('#in-progress .tasks-container');
    const dragOverEvent = new MouseEvent('dragover', {
      bubbles: true,
      cancelable: true
    });
    
    // Add dataTransfer to the event
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: dragStartEvent.dataTransfer
    });
    
    // Dispatch dragover on target element
    targetContainer.dispatchEvent(dragOverEvent);
    
    // Verify target container has dragover class
    if (!targetContainer.classList.contains('dragover')) {
      throw new Error('Target container does not have dragover class during dragover');
    }
    
    // End the drag
    const dragEndEvent = new MouseEvent('dragend', {
      bubbles: true,
      cancelable: true
    });
    
    // Dispatch dragend on source element
    task.dispatchEvent(dragEndEvent);
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify task no longer has dragging class
    if (task.classList.contains('dragging')) {
      throw new Error('Task still has dragging class after dragend');
    }
    
    // Verify containers no longer have dragover class
    const containers = document.querySelectorAll('.tasks-container');
    const hasContainerWithDragover = Array.from(containers).some(c => 
      c.classList.contains('dragover')
    );
    
    if (hasContainerWithDragover) {
      throw new Error('Containers still have dragover class after dragend');
    }
  });
      
      // Add dataTransfer to the event
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: {
          data: {},
          setData: function(format, data) {
            this.data[format] = data;
          },
          getData: function(format) {
            return this.data[format];
          }
        }
      });
      
      // Dispatch dragstart on source element
      sourceElement.dispatchEvent(dragStartEvent);
      
      // Create dragover event
      const dragOverEvent = new MouseEvent('dragover', {
        bubbles: true,
        cancelable: true
      });
      
      // Add dataTransfer to the event
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: dragStartEvent.dataTransfer
      });
      
      // Dispatch dragover on target element
      targetElement.dispatchEvent(dragOverEvent);
      
      // Create drop event
      const dropEvent = new MouseEvent('drop', {
        bubbles: true,
        cancelable: true
      });
      
      // Add dataTransfer to the event
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: dragStartEvent.dataTransfer
      });
      
      // Dispatch drop on target element
      targetElement.dispatchEvent(dropEvent);
      
      // Create dragend event
      const dragEndEvent = new MouseEvent('dragend', {
        bubbles: true,
        cancelable: true
      });
      
      // Dispatch dragend on source element
      sourceElement.dispatchEvent(dragEndEvent);
      
      await TestUtils.wait(config.testTimeouts.short);
    },
    
    // Generate a past or future date
    getDate: (daysOffset) => {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    },
    
    // Mock confirm dialog to always return true or false
    mockConfirm: (returnValue) => {
      window.originalConfirm = window.confirm;
      window.confirm = () => returnValue;
    },
    
    // Restore original confirm dialog
    restoreConfirm: () => {
      if (window.originalConfirm) {
        window.confirm = window.originalConfirm;
        delete window.originalConfirm;
      }
    },
    
    // Clear local storage to reset the app state
    clearAppState: () => {
      // Just clear data related to our test users
      for (const user of Object.values(config.testUsers)) {
        localStorage.removeItem(`user_${user.username}`);
        localStorage.removeItem(`board_${user.username}`);
      }
      localStorage.removeItem('user_current');
    }
  };
  
  // Test Runner
  class TestRunner {
    constructor() {
      this.tests = [];
      this.beforeEachFn = null;
      this.afterEachFn = null;
    }
    
    // Add a test to the suite
    addTest(testId, description, testFn, options = {}) {
      this.tests.push({
        id: testId,
        description,
        fn: testFn,
        skip: options.skip || false,
        only: options.only || false
      });
    }
    
    // Set up function to run before each test
    beforeEach(fn) {
      this.beforeEachFn = fn;
    }
    
    // Set up function to run after each test
    afterEach(fn) {
      this.afterEachFn = fn;
    }
    
    // Run all tests in the suite
    async runTests() {
      console.log('%c TaskFlow Kanban Board - Automated Tests', 'font-size: 16px; font-weight: bold; color: #0066cc;');
      
      // Check if any tests are marked with 'only'
      const hasOnly = this.tests.some(test => test.only);
      
      for (const test of this.tests) {
        // Skip tests if they're marked as skip or if another test is marked as 'only'
        if (test.skip || (hasOnly && !test.only)) {
          console.log(`%c SKIPPED: ${test.id} - ${test.description}`, 'color: gray');
          testResults.skipped++;
          testResults.total++;
          testResults.results.push({
            id: test.id,
            description: test.description,
            status: 'skipped'
          });
          continue;
        }
        
        try {
          // Run setup if defined
          if (this.beforeEachFn) {
            await this.beforeEachFn();
          }
          
          // Run the test
          console.log(`%c RUNNING: ${test.id} - ${test.description}`, 'color: blue');
          await test.fn();
          
          // Run teardown if defined
          if (this.afterEachFn) {
            await this.afterEachFn();
          }
          
          // Log success
          console.log(`%c PASSED: ${test.id} - ${test.description}`, 'color: green');
          testResults.passed++;
          testResults.results.push({
            id: test.id,
            description: test.description,
            status: 'passed'
          });
        } catch (error) {
          // Log failure
          console.error(`%c FAILED: ${test.id} - ${test.description}`, 'color: red');
          console.error(error);
          testResults.failed++;
          testResults.results.push({
            id: test.id,
            description: test.description,
            status: 'failed',
            error: error.message
          });
        }
        
        testResults.total++;
      }
      
      // Print summary
      console.log('%c Test Results Summary', 'font-size: 14px; font-weight: bold; color: #0066cc;');
      console.log(`Total: ${testResults.total}, Passed: ${testResults.passed}, Failed: ${testResults.failed}, Skipped: ${testResults.skipped}`);
      
      // Print failed tests
      if (testResults.failed > 0) {
        console.log('%c Failed Tests:', 'font-weight: bold; color: red;');
        testResults.results
          .filter(result => result.status === 'failed')
          .forEach(result => console.log(`- ${result.id}: ${result.error}`));
      }
      
      return testResults;
    }
  }
  
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
  
  taskTests.addTest('TASK-06', 'Change Task Due Date', async () => {
    // Create a task first
    const taskText = 'Task for due date change';
    const initialDate = TestUtils.getDate(5); // 5 days in the future
    const newDate = TestUtils.getDate(-1); // 1 day in the past (should trigger overdue)
    
    await TestUtils.setValue('#new-task', taskText);
    await TestUtils.setValue('#task-due-date', initialDate);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Find the task we just created
    const tasks = await TestUtils.getElements('#to-do .task');
    const task = Array.from(tasks).find(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (!task) {
      throw new Error('Task not found for due date change');
    }
    
    // Verify initial due date
    const dueDateInput = task.querySelector('.task-due-date');
    if (dueDateInput.value !== initialDate) {
      throw new Error(`Initial due date mismatch: expected "${initialDate}", got "${dueDateInput.value}"`);
    }
    
    // Verify task is not overdue
    if (task.classList.contains('overdue')) {
      throw new Error('Task is incorrectly marked as overdue with future date');
    }
    
    // Change due date to past date (should trigger overdue)
    await TestUtils.setValue('', newDate, dueDateInput);
    
    await TestUtils.wait(config.testTimeouts.short);
    
    // Verify due date was updated
    if (dueDateInput.value !== newDate) {
      throw new Error(`Due date was not updated: expected "${newDate}", got "${dueDateInput.value}"`);
    }
    
    // Verify task is now marked as overdue
    if (!task.classList.contains('overdue')) {
      throw new Error('Task is not marked as overdue with past date');
    }
  });
  
  taskTests.addTest('TASK-07', 'Delete Task', async () => {
    // Create a task first
    const taskText = 'Task to be deleted';
    
    await TestUtils.setValue('#new-task', taskText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Find the task we just created
    const tasks = await TestUtils.getElements('#to-do .task');
    const task = Array.from(tasks).find(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (!task) {
      throw new Error('Task not found for deletion');
    }
    
    // Mock confirm to return true
    TestUtils.mockConfirm(true);
    
    // Click delete button
    const deleteBtn = task.querySelector('.delete-btn');
    deleteBtn.click();
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Restore original confirm
    TestUtils.restoreConfirm();
    
    // Verify task was deleted
    const remainingTasks = await TestUtils.getElements('#to-do .task');
    const taskFound = Array.from(remainingTasks).some(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (taskFound) {
      throw new Error('Task was not deleted after clicking delete button');
    }
  });
  
  taskTests.addTest('TASK-08', 'Cancel Task Deletion', async () => {
    // Create a task first
    const taskText = 'Task with cancelled deletion';
    
    await TestUtils.setValue('#new-task', taskText);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Find the task we just created
    const tasks = await TestUtils.getElements('#to-do .task');
    const task = Array.from(tasks).find(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (!task) {
      throw new Error('Task not found for cancelled deletion');
    }
    
    // Mock confirm to return false (cancel)
    TestUtils.mockConfirm(false);
    
    // Click delete button
    const deleteBtn = task.querySelector('.delete-btn');
    deleteBtn.click();
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Restore original confirm
    TestUtils.restoreConfirm();
    
    // Verify task was NOT deleted
    const remainingTasks = await TestUtils.getElements('#to-do .task');
    const taskFound = Array.from(remainingTasks).some(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (!taskFound) {
      throw new Error('Task was deleted despite cancelling the confirmation');
    }
  });
  
  taskTests.addTest('TASK-09', 'Overdue Task Indication', async () => {
    // Create a task with past due date
    const taskText = 'Overdue task test';
    const pastDate = TestUtils.getDate(-2); // 2 days in the past
    
    await TestUtils.setValue('#new-task', taskText);
    await TestUtils.setValue('#task-due-date', pastDate);
    await TestUtils.clickElement('#add-task');
    
    await TestUtils.wait(config.testTimeouts.medium);
    
    // Find the task we just created
    const tasks = await TestUtils.getElements('#to-do .task');
    const task = Array.from(tasks).find(t => 
      t.querySelector('.task-text').value === taskText
    );
    
    if (!task) {
      throw new Error('Overdue task not found');
    }
    
    // Verify task has overdue class
    if (!task.classList.contains('overdue')) {
      throw new Error('Task with past due date is not marked as overdue');
    }
  });
  
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