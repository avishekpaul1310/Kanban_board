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
    setValue: async (selector, value, element = null) => {
      const targetElement = element || await TestUtils.getElement(selector);
      targetElement.value = value;
      
      // Trigger change and input events for event listeners
      targetElement.dispatchEvent(new Event('input', { bubbles: true }));
      targetElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      return targetElement;
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
      console.log('%c TaskFlow Kanban Board - Tests', 'font-size: 16px; font-weight: bold; color: #0066cc;');
      
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
  
  console.log("Test utilities and configuration loaded successfully!");