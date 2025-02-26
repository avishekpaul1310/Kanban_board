// Global variables
let taskCounter = parseInt(localStorage.getItem("taskCounter")) || 1;
let currentUser = null;

// Document ready function
document.addEventListener("DOMContentLoaded", function() {
    // Check if user is logged in
    const savedUser = localStorage.getItem("user_current");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showBoard();
        loadBoardState();
        updateAnalytics();
        updateLastUpdated();
    }

    // Login event
    document.getElementById("login-button").addEventListener("click", loginUser);
    document.getElementById("register-button").addEventListener("click", registerUser);
    document.getElementById("logout-button").addEventListener("click", logoutUser);

    // Board controls events
    document.getElementById("export-board").addEventListener("click", exportBoardData);
    document.getElementById("import-board-btn").addEventListener("click", () => {
        document.getElementById("import-board").click();
    });
    document.getElementById("import-board").addEventListener("change", importBoardData);

    // Task creation event
    document.getElementById("add-task").addEventListener("click", addNewTask);

    // Filter and sort events
    initializeFilterAndSort();

    // Set up drag and drop
    setupDragAndDrop();
});

// Authentication functions
function loginUser() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    
    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }
    
    const savedUser = localStorage.getItem(`user_${username}`);
    if (!savedUser) {
        alert("User not found. Please register first.");
        return;
    }
    
    const user = JSON.parse(savedUser);
    if (password !== user.password) {
        alert("Incorrect password");
        return;
    }
    
    currentUser = user;
    localStorage.setItem("user_current", JSON.stringify(user));
    
    showBoard();
    loadBoardState();
    updateAnalytics();
    updateLastUpdated();
}

function registerUser() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    
    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }
    
    const savedUser = localStorage.getItem(`user_${username}`);
    if (savedUser) {
        alert("Username already exists. Please login or choose a different username.");
        return;
    }
    
    const newUser = {
        username: username,
        password: password,
        created: new Date().toISOString()
    };
    
    localStorage.setItem(`user_${username}`, JSON.stringify(newUser));
    alert("Registration successful. Please login.");
}

function logoutUser() {
    localStorage.removeItem("user_current");
    currentUser = null;
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("login-section").style.display = "block";
    document.getElementById("board-section").style.display = "none";
}

function showBoard() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("board-section").style.display = "block";
    document.getElementById("current-user").textContent = currentUser.username;
    document.getElementById("footer-user").textContent = currentUser.username;
}

// Task management functions
function addNewTask() {
    const taskText = document.getElementById("new-task").value.trim();
    const priority = document.getElementById("task-priority").value;
    const dueDate = document.getElementById("task-due-date").value;
    const category = document.getElementById("task-category").value;

    if (taskText) {
        const task = createTask(taskText, priority, dueDate, category);
        document.querySelector("#to-do .tasks-container").appendChild(task);
        document.getElementById("new-task").value = "";
        saveBoardState();
        updateAnalytics();
        updateLastUpdated();
    } else {
        alert("Please enter a task description");
    }
}

function createTask(text, priority = "medium", dueDate = "", category = "other") {
    // Clone the task template
    const template = document.getElementById("task-template");
    const task = document.importNode(template.content, true).querySelector(".task");
    
    // Set task properties
    task.id = `task-${taskCounter++}`;
    task.className = `task priority-${priority} category-${category}`;
    task.draggable = true;
    
    // Set task content
    task.querySelector(".task-text").value = text;
    task.querySelector(".task-priority").value = priority;
    task.querySelector(".task-due-date").value = dueDate;
    task.querySelector(".task-category").value = category;
    task.querySelector(".category-label").textContent = category;
    task.querySelector(".progress-value").textContent = "0%";
    task.querySelector(".progress-bar").style.width = "0%";
    
    localStorage.setItem("taskCounter", taskCounter);
    
    // Add event listeners
    addTaskEventListeners(task);
    addTimerEventListeners(task);
    addProgressEventListeners(task);
    checkDueDate(task);
    
    return task;
}

function addTaskEventListeners(task) {
    const deleteBtn = task.querySelector(".delete-btn");
    const prioritySelect = task.querySelector(".task-priority");
    const categorySelect = task.querySelector(".task-category");
    const dueDateInput = task.querySelector(".task-due-date");
    const taskText = task.querySelector(".task-text");

    // Delete button handler
    deleteBtn.addEventListener("click", () => {
        if (confirm("Delete this task?")) {
            task.remove();
            saveBoardState();
            updateAnalytics();
            updateLastUpdated();
        }
    });

    // Double click to edit task text
    taskText.addEventListener("dblclick", () => {
        taskText.readOnly = false;
        taskText.focus();
    });
    
    taskText.addEventListener("blur", () => {
        taskText.readOnly = true;
        saveBoardState();
    });
    
    taskText.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            taskText.blur();
        }
    });

    // Priority change handler
    prioritySelect.addEventListener("change", () => {
        task.className = task.className.replace(/priority-\w+/, `priority-${prioritySelect.value}`);
        saveBoardState();
        updateAnalytics();
    });
    
    // Category change handler
    categorySelect.addEventListener("change", () => {
        task.className = task.className.replace(/category-\w+/, `category-${categorySelect.value}`);
        task.querySelector('.category-label').textContent = categorySelect.value;
        saveBoardState();
        updateAnalytics();
    });

    // Due date handler
    dueDateInput.addEventListener("change", () => {
        checkDueDate(task);
        saveBoardState();
        updateAnalytics();
    });

    // Drag handlers
    task.addEventListener("dragstart", (e) => {
        task.classList.add("dragging");
        e.dataTransfer.setData("text/plain", task.id);
    });

    task.addEventListener("dragend", () => {
        task.classList.remove("dragging");
        document.querySelectorAll(".tasks-container").forEach(container => {
            container.classList.remove("dragover");
        });
        updateAnalytics();
        updateLastUpdated();
    });
}

// Check if task is overdue
function checkDueDate(task) {
    const dueDateInput = task.querySelector(".task-due-date");
    if (dueDateInput.value) {
        const dueDate = new Date(dueDateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
            task.classList.add("overdue");
        } else {
            task.classList.remove("overdue");
        }
    } else {
        task.classList.remove("overdue");
    }
}

// Timer functions with custom duration support
function addTimerEventListeners(task) {
    const timerToggle = task.querySelector(".timer-toggle");
    const timerDisplay = task.querySelector(".timer-display");
    
    // Create time input field
    const timeInput = document.createElement('input');
    timeInput.type = 'number';
    timeInput.min = '1';
    timeInput.max = '180';
    timeInput.value = '25'; // Default Pomodoro time
    timeInput.className = 'timer-input';
    timeInput.placeholder = 'Min';
    timeInput.title = 'Set timer duration in minutes';
    timeInput.style.width = '40px';
    timeInput.style.marginRight = '5px';
    
    // Insert time input before timer toggle
    timerToggle.parentNode.insertBefore(timeInput, timerToggle);
    
    let timerActive = false;
    let timerInterval;
    let timeLeft = 25 * 60; // 25 minutes in seconds for default Pomodoro
    
    timerToggle.addEventListener("click", () => {
        if (timerActive) {
            // Stop timer
            clearInterval(timerInterval);
            timerToggle.textContent = "🕒 Start Timer";
            task.classList.remove("timer-active");
            timeInput.disabled = false;
        } else {
            // Set time from input
            const customMinutes = parseInt(timeInput.value);
            if (customMinutes > 0) {
                timeLeft = customMinutes * 60;
                // Update display immediately
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                // If invalid input, reset to 25 minutes
                timeInput.value = '25';
                timeLeft = 25 * 60;
            }
            
            // Disable input while timer is running
            timeInput.disabled = true;
            
            // Pause any other active timers
            document.querySelectorAll(".task.timer-active").forEach(activeTask => {
                if (activeTask !== task) {
                    activeTask.querySelector(".timer-toggle").click();
                }
            });
            
            // Start timer
            timerInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timerActive = false;
                    timerToggle.textContent = "🕒 Start Timer";
                    task.classList.remove("timer-active");
                    alert(`Timer complete (${timeInput.value} minutes)! Take a break.`);
                    timerDisplay.textContent = `${timeInput.value.toString().padStart(2, '0')}:00`;
                    timeInput.disabled = false;
                    
                    // If task is not in the "done" column, auto-move it to "in progress"
                    if (!task.closest("#in-progress") && !task.closest("#done")) {
                        document.querySelector("#in-progress .tasks-container").appendChild(task);
                        saveBoardState();
                        updateAnalytics();
                    }
                    
                    // Play notification sound
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.play().catch(e => console.log('Audio play failed: ', e));
                    } catch (error) {
                        console.log('Audio not supported');
                    }
                }
            }, 1000);
            timerToggle.textContent = "⏸️ Pause Timer";
            task.classList.add("timer-active");
        }
        
        timerActive = !timerActive;
        saveBoardState();
    });
}

// Progress tracking functions
function addProgressEventListeners(task) {
    const minusBtn = task.querySelector(".progress-btn.minus");
    const plusBtn = task.querySelector(".progress-btn.plus");
    const progressValue = task.querySelector(".progress-value");
    const progressBar = task.querySelector(".progress-bar");
    let progress = 0;
    
    minusBtn.addEventListener("click", () => {
        if (progress >= 10) {
            progress -= 10;
            updateProgress();
        }
    });
    
    plusBtn.addEventListener("click", () => {
        if (progress <= 90) {
            progress += 10;
            updateProgress();
        } else {
            progress = 100;
            updateProgress();
        }
    });
    
    function updateProgress() {
        progressValue.textContent = `${progress}%`;
        progressBar.style.width = `${progress}%`;
        
        // Auto-move to "Done" column if progress reaches 100% and not already in "Done"
        if (progress === 100 && !task.closest("#done")) {
            document.querySelector("#done .tasks-container").appendChild(task);
            saveBoardState();
            updateAnalytics();
            updateLastUpdated();
        }
        
        // Auto-move to "In Progress" if progress > 0% but less than 100% and in "To Do"
        if (progress > 0 && progress < 100 && task.closest("#to-do")) {
            document.querySelector("#in-progress .tasks-container").appendChild(task);
            saveBoardState();
            updateAnalytics();
            updateLastUpdated();
        }
        
        saveBoardState();
    }
}

// Drag and Drop setup
function setupDragAndDrop() {
    const containers = document.querySelectorAll(".tasks-container");
    
    containers.forEach(container => {
        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            container.classList.add("dragover");
        });
        
        container.addEventListener("dragleave", () => {
            container.classList.remove("dragover");
        });
        
        container.addEventListener("drop", (e) => {
            e.preventDefault();
            container.classList.remove("dragover");
            
            const taskId = e.dataTransfer.getData("text/plain");
            const task = document.getElementById(taskId);
            
            if (task && !container.contains(task)) {
                container.appendChild(task);
                saveBoardState();
                updateAnalytics();
                updateLastUpdated();
            }
        });
    });
}

// Filter and Sort functions
function initializeFilterAndSort() {
    const filterInput = document.getElementById("task-filter");
    const sortSelect = document.getElementById("task-sort");
    
    // Add event listeners
    filterInput.addEventListener("input", applyFilterAndSort);
    sortSelect.addEventListener("change", applyFilterAndSort);
}

function applyFilterAndSort() {
    const filterValue = document.getElementById("task-filter").value.toLowerCase();
    const sortValue = document.getElementById("task-sort").value;
    
    // Get all tasks
    const allTasks = Array.from(document.querySelectorAll(".task"));
    
    // First filter tasks
    allTasks.forEach(task => {
        const taskText = task.querySelector(".task-text").value.toLowerCase();
        const taskCategory = task.querySelector(".task-category").value.toLowerCase();
        const shouldShow = taskText.includes(filterValue) || taskCategory.includes(filterValue);
        task.style.display = shouldShow ? "" : "none";
        
        if (shouldShow) {
            task.classList.add("highlight");
            setTimeout(() => task.classList.remove("highlight"), 1000);
        }
    });
    
    // Then sort visible tasks within each column
    document.querySelectorAll(".tasks-container").forEach(container => {
        const tasks = Array.from(container.querySelectorAll(".task")).filter(
            task => task.style.display !== "none"
        );
        
        // Sort tasks based on selected sort option
        tasks.sort((a, b) => {
            switch (sortValue) {
                case "newest":
                    return parseInt(b.id.split("-")[1]) - parseInt(a.id.split("-")[1]);
                case "oldest":
                    return parseInt(a.id.split("-")[1]) - parseInt(b.id.split("-")[1]);
                case "priority": {
                    const priorityOrder = { "high": 0, "medium": 1, "low": 2 };
                    const priorityA = a.querySelector(".task-priority").value;
                    const priorityB = b.querySelector(".task-priority").value;
                    return priorityOrder[priorityA] - priorityOrder[priorityB];
                }
                case "alphabetical": {
                    const textA = a.querySelector(".task-text").value.toLowerCase();
                    const textB = b.querySelector(".task-text").value.toLowerCase();
                    return textA.localeCompare(textB);
                }
                case "category": {
                    const categoryA = a.querySelector(".task-category").value;
                    const categoryB = b.querySelector(".task-category").value;
                    return categoryA.localeCompare(categoryB);
                }
                case "progress": {
                    const progressA = parseInt(a.querySelector(".progress-value").textContent);
                    const progressB = parseInt(b.querySelector(".progress-value").textContent);
                    return progressB - progressA; // Higher progress first
                }
                default:
                    return 0;
            }
        });
        
        // Reorder DOM elements according to the sort
        tasks.forEach(task => {
            container.appendChild(task);
        });
    });
}

// Save current board state to localStorage
function saveBoardState() {
    if (!currentUser) return;
    
    const boardState = {
        "to-do": getColumnState("to-do"),
        "in-progress": getColumnState("in-progress"),
        "done": getColumnState("done"),
        "lastUpdated": new Date().toISOString()
    };
    
    localStorage.setItem(`board_${currentUser.username}`, JSON.stringify(boardState));
}

// Get state of a column
function getColumnState(columnId) {
    const tasks = [];
    document.querySelectorAll(`#${columnId} .task`).forEach(task => {
        tasks.push({
            id: task.id,
            text: task.querySelector(".task-text").value,
            priority: task.querySelector(".task-priority").value,
            dueDate: task.querySelector(".task-due-date").value,
            category: task.querySelector(".task-category").value,
            progress: task.querySelector(".progress-value").textContent.replace('%', '')
        });
    });
    return tasks;
}

// Load board state from localStorage
function loadBoardState() {
    if (!currentUser) return;
    
    const savedState = localStorage.getItem(`board_${currentUser.username}`);
    if (savedState) {
        const boardState = JSON.parse(savedState);
        
        // Clear current tasks
        document.querySelectorAll(".tasks-container").forEach(container => {
            container.innerHTML = "";
        });
        
        // Load tasks for each column
        loadColumnTasks("to-do", boardState["to-do"]);
        loadColumnTasks("in-progress", boardState["in-progress"]);
        loadColumnTasks("done", boardState["done"]);
    }
}

// Load tasks for a column
function loadColumnTasks(columnId, tasks) {
    if (!tasks) return;
    
    const container = document.querySelector(`#${columnId} .tasks-container`);
    tasks.forEach(taskData => {
        const task = createTask(taskData.text, taskData.priority, taskData.dueDate, taskData.category);
        
        // Set task ID to maintain consistency
        task.id = taskData.id;
        
        // Set progress value if exists
        if (taskData.progress) {
            const progressValue = task.querySelector(".progress-value");
            const progressBar = task.querySelector(".progress-bar");
            progressValue.textContent = `${taskData.progress}%`;
            progressBar.style.width = `${taskData.progress}%`;
        }
        
        container.appendChild(task);
    });
}

// Export board data as JSON file
function exportBoardData() {
    if (!currentUser) return;
    
    const boardState = {
        "to-do": getColumnState("to-do"),
        "in-progress": getColumnState("in-progress"),
        "done": getColumnState("done"),
        "user": currentUser.username,
        "exportedAt": new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(boardState, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `kanban_board_${currentUser.username}_${new Date().toISOString().slice(0,10)}.json`;
    downloadLink.click();
    URL.revokeObjectURL(url);
}

// Import board data from JSON file
function importBoardData(e) {
    if (!currentUser) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const boardState = JSON.parse(event.target.result);
            
            if (confirm("This will overwrite your current board. Continue?")) {
                // Clear current tasks
                document.querySelectorAll(".tasks-container").forEach(container => {
                    container.innerHTML = "";
                });
                
                // Load tasks for each column
                loadColumnTasks("to-do", boardState["to-do"]);
                loadColumnTasks("in-progress", boardState["in-progress"]);
                loadColumnTasks("done", boardState["done"]);
                
                saveBoardState();
                updateAnalytics();
                updateLastUpdated();
            }
        } catch (error) {
            alert("Invalid JSON file: " + error.message);
        }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
}

// Update analytics section
function updateAnalytics() {
    const totalTasks = document.querySelectorAll(".task").length;
    const todoTasks = document.querySelectorAll("#to-do .task").length;
    const inProgressTasks = document.querySelectorAll("#in-progress .task").length;
    const doneTasks = document.querySelectorAll("#done .task").length;
    
    // Update counters
    document.getElementById("total-tasks").textContent = totalTasks;
    document.getElementById("todo-tasks").textContent = todoTasks;
    document.getElementById("inprogress-tasks").textContent = inProgressTasks;
    document.getElementById("done-tasks").textContent = doneTasks;
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    document.getElementById("completion-rate").textContent = `${completionRate}%`;
    
    // Calculate average progress
    let totalProgress = 0;
    document.querySelectorAll(".task").forEach(task => {
        const progressText = task.querySelector(".progress-value").textContent;
        totalProgress += parseInt(progressText);
    });
    const avgProgress = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;
    document.getElementById("average-progress").textContent = `${avgProgress}%`;
    
    // Update visual charts
    updateTaskDistributionChart(todoTasks, inProgressTasks, doneTasks);
    updateCategoryDistributionChart();
}

// Update task distribution chart
function updateTaskDistributionChart(todo, inProgress, done) {
    const chartContainer = document.getElementById("task-distribution-chart");
    chartContainer.innerHTML = '';
    
    const total = todo + inProgress + done;
    if (total === 0) return;
    
    // Create bars for each column
    const columns = [
        { label: 'To Do', count: todo, color: '#ffccd5' },
        { label: 'In Progress', count: inProgress, color: '#b3e0ff' },
        { label: 'Done', count: done, color: '#c8e6c9' }
    ];
    
    columns.forEach(column => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = column.count > 0 ? (column.count / total * 100) : 1;
        bar.style.height = `${Math.max(height, 5)}%`; // Minimum height for visibility
        bar.style.backgroundColor = column.color;
        bar.setAttribute('data-value', column.count);
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = column.label;
        
        bar.appendChild(label);
        chartContainer.appendChild(bar);
    });
}

// Update category distribution chart
function updateCategoryDistributionChart() {
    const chartContainer = document.getElementById("category-distribution-chart");
    chartContainer.innerHTML = '';
    
    // Count tasks by category
    const categories = {};
    document.querySelectorAll(".task").forEach(task => {
        const category = task.querySelector(".task-category").value;
        categories[category] = (categories[category] || 0) + 1;
    });
    
    // If no tasks, return
    if (Object.keys(categories).length === 0) return;
    
    // Create pie chart container and legend
    const pieChartContainer = document.createElement('div');
    pieChartContainer.className = 'pie-chart-container';
    
    const legend = document.createElement('div');
    legend.className = 'pie-chart-legend';
    
    // Category colors
    const colors = {
        'work': '#4285f4',
        'personal': '#ea4335',
        'study': '#fbbc05',
        'health': '#34a853',
        'other': '#9e9e9e'
    };
    
    // Create segments for pie chart
    let startAngle = 0;
    const total = Object.values(categories).reduce((a, b) => a + b, 0);
    
    Object.entries(categories).forEach(([category, count]) => {
        const percentage = count / total;
        const endAngle = startAngle + (percentage * 360);
        
        // Create pie segment
        const segment = document.createElement('div');
        segment.className = 'pie-chart-segment';
        segment.style.background = `conic-gradient(${colors[category]} ${startAngle}deg, ${colors[category]} ${endAngle}deg, transparent ${endAngle}deg)`;
        
        pieChartContainer.appendChild(segment);
        
        // Add to legend
        const legendItem = document.createElement('div');
        legendItem.className = 'pie-chart-legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'pie-chart-legend-color';
        colorBox.style.backgroundColor = colors[category];
        
        const labelText = document.createElement('span');
        labelText.textContent = `${category} (${count})`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(labelText);
        legend.appendChild(legendItem);
        
        startAngle = endAngle;
    });
    
    chartContainer.appendChild(pieChartContainer);
    chartContainer.appendChild(legend);
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    let dateString = now.getUTCFullYear() + '-' +
        String(now.getUTCMonth() + 1).padStart(2, '0') + '-' +
        String(now.getUTCDate()).padStart(2, '0') + ' ' +
        String(now.getUTCHours()).padStart(2, '0') + ':' +
        String(now.getUTCMinutes()).padStart(2, '0') + ':' +
        String(now.getUTCSeconds()).padStart(2, '0');
        
    document.getElementById("last-updated").textContent = dateString;
}
