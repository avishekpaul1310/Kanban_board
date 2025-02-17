// Global variables
let currentUser = null;
let taskCounter = parseInt(localStorage.getItem("taskCounter")) || 1;
const CURRENT_TIMESTAMP = "2025-01-21 01:37:13";

// Authentication Functions
function handleLogin() {
    try {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            alert("Please enter both username and password");
            return;
        }

        const storedPassword = localStorage.getItem(`user_${username}`);
        if (storedPassword && storedPassword === password) {
            currentUser = {
                username: username,
                lastLogin: CURRENT_TIMESTAMP
            };
            
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            
            // Update UI
            document.getElementById("login-section").style.display = "none";
            document.getElementById("board-section").style.display = "block";
            document.getElementById("current-user").textContent = username;
            document.getElementById("footer-user").textContent = username;

            loadBoardState();
            updateAnalytics();
        } else {
            alert("Invalid username or password");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again.");
    }
}

function handleRegister() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    if (username.length < 3) {
        alert("Username must be at least 3 characters long");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
    }

    if (localStorage.getItem(`user_${username}`)) {
        alert("Username already exists!");
        return;
    }

    localStorage.setItem(`user_${username}`, password);
    alert("Registration successful! You can now log in.");
    
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        currentUser = null;
        localStorage.removeItem("currentUser");
        
        document.getElementById("login-section").style.display = "block";
        document.getElementById("board-section").style.display = "none";
        
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    }
}

// Task Management Functions
function createTask(text, priority = "medium", dueDate = "") {
    const task = document.createElement("div");
    task.className = `task priority-${priority}`;
    task.draggable = true;
    task.id = `task-${taskCounter++}`;
    localStorage.setItem("taskCounter", taskCounter);

    task.innerHTML = `
        <div class="task-content">
            <div class="task-header">
                <input type="text" class="task-text" value="${text}" readonly>
                <button class="delete-btn">×</button>
            </div>
            <div class="task-controls">
                <select class="task-priority">
                    <option value="low" ${priority === "low" ? "selected" : ""}>Low</option>
                    <option value="medium" ${priority === "medium" ? "selected" : ""}>Medium</option>
                    <option value="high" ${priority === "high" ? "selected" : ""}>High</option>
                </select>
                <input type="date" class="task-due-date" value="${dueDate}">
            </div>
        </div>
    `;

    // Add event listeners
    addTaskEventListeners(task);
    checkDueDate(task);
    return task;
}

function addTaskEventListeners(task) {
    const deleteBtn = task.querySelector(".delete-btn");
    const prioritySelect = task.querySelector(".task-priority");
    const dueDateInput = task.querySelector(".task-due-date");

    deleteBtn.addEventListener("click", () => {
        if (confirm("Delete this task?")) {
            task.remove();
            saveBoardState();
            updateAnalytics();
        }
    });

    prioritySelect.addEventListener("change", () => {
        task.className = `task priority-${prioritySelect.value}`;
        saveBoardState();
        updateAnalytics();
    });

    dueDateInput.addEventListener("change", () => {
        checkDueDate(task);
        saveBoardState();
        updateAnalytics();
    });

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
    });
}

function checkDueDate(task) {
    const dueDateInput = task.querySelector(".task-due-date");
    const dueDate = new Date(dueDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today && dueDateInput.value) {
        task.classList.add("overdue");
    } else {
        task.classList.remove("overdue");
    }
}

// Drag and Drop Functions
function initializeDragAndDrop() {
    document.querySelectorAll(".tasks-container").forEach(container => {
        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            container.classList.add("dragover");
            
            const draggable = document.querySelector(".dragging");
            if (draggable) {
                const afterElement = getDragAfterElement(container, e.clientY);
                if (afterElement) {
                    container.insertBefore(draggable, afterElement);
                } else {
                    container.appendChild(draggable);
                }
            }
        });

        container.addEventListener("dragleave", () => {
            container.classList.remove("dragover");
        });

        container.addEventListener("drop", (e) => {
            e.preventDefault();
            container.classList.remove("dragover");
            saveBoardState();
            updateAnalytics();
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Board State Management
function saveBoardState() {
    if (!currentUser) return;

    const boardState = {
        columns: {},
        timestamp: CURRENT_TIMESTAMP
    };

    document.querySelectorAll(".column").forEach(column => {
        boardState.columns[column.id] = {
            tasks: Array.from(column.querySelectorAll(".task")).map(task => ({
                text: task.querySelector(".task-text").value,
                priority: task.querySelector(".task-priority").value,
                dueDate: task.querySelector(".task-due-date").value
            }))
        };
    });

    localStorage.setItem(`boardState_${currentUser.username}`, JSON.stringify(boardState));
    document.getElementById("last-updated").textContent = CURRENT_TIMESTAMP;
}

function loadBoardState() {
    try {
        const boardState = JSON.parse(localStorage.getItem(`boardState_${currentUser.username}`));
        if (!boardState) return;

        document.querySelectorAll(".tasks-container").forEach(container => {
            container.innerHTML = "";
        });

        Object.entries(boardState.columns).forEach(([columnId, columnData]) => {
            const container = document.querySelector(`#${columnId} .tasks-container`);
            if (container && columnData.tasks) {
                columnData.tasks.forEach(taskData => {
                    const task = createTask(taskData.text, taskData.priority, taskData.dueDate);
                    container.appendChild(task);
                });
            }
        });

        updateAnalytics();
    } catch (error) {
        console.error('Error loading board state:', error);
        alert('Error loading board state. Starting with a fresh board.');
    }
}

// Analytics Functions
function updateAnalytics() {
    const stats = {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0
    };

    stats.todo = document.querySelector("#to-do .tasks-container").querySelectorAll(".task").length;
    stats.inProgress = document.querySelector("#in-progress .tasks-container").querySelectorAll(".task").length;
    stats.done = document.querySelector("#done .tasks-container").querySelectorAll(".task").length;
    stats.total = stats.todo + stats.inProgress + stats.done;

    document.getElementById("total-tasks").textContent = stats.total;
    document.getElementById("todo-tasks").textContent = stats.todo;
    document.getElementById("inprogress-tasks").textContent = stats.inProgress;
    document.getElementById("done-tasks").textContent = stats.done;
}

// Import/Export Functions
function exportBoard() {
    if (!currentUser) {
        alert("Please login to export the board");
        return;
    }

    const boardState = JSON.parse(localStorage.getItem(`boardState_${currentUser.username}`));
    if (!boardState) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(boardState, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `kanban_board_${currentUser.username}_${CURRENT_TIMESTAMP.split(' ')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importBoard(event) {
    const file = event.target.files[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const boardState = JSON.parse(e.target.result);
            localStorage.setItem(`boardState_${currentUser.username}`, JSON.stringify(boardState));
            loadBoardState();
            alert('Board imported successfully!');
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing board. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

// Initialize Application
document.addEventListener("DOMContentLoaded", function() {
    // Set up event listeners
    document.getElementById("login-button").addEventListener("click", handleLogin);
    document.getElementById("register-button").addEventListener("click", handleRegister);
    document.getElementById("logout-button").addEventListener("click", handleLogout);
    document.getElementById("export-board").addEventListener("click", exportBoard);
    document.getElementById("import-board-btn").addEventListener("click", () => {
        document.getElementById("import-board").click();
    });
    document.getElementById("import-board").addEventListener("change", importBoard);

    document.getElementById("add-task").addEventListener("click", () => {
        const taskText = document.getElementById("new-task").value.trim();
        const priority = document.getElementById("task-priority").value;
        const dueDate = document.getElementById("task-due-date").value;

        if (taskText) {
            const task = createTask(taskText, priority, dueDate);
            document.querySelector("#to-do .tasks-container").appendChild(task);
            document.getElementById("new-task").value = "";
            saveBoardState();
            updateAnalytics();
        } else {
            alert("Please enter a task description");
        }
    });

    // Initialize drag and drop
    initializeDragAndDrop();

    // Check for saved login
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById("login-section").style.display = "none";
        document.getElementById("board-section").style.display = "block";
        document.getElementById("current-user").textContent = currentUser.username;
        document.getElementById("footer-user").textContent = currentUser.username;
        loadBoardState();
        updateAnalytics();
    }

    // Update timestamp
    document.getElementById("last-updated").textContent = CURRENT_TIMESTAMP;
});

// ML Model Implementation (Simplified)
class TaskPredictor {
    constructor() {
        this.baselineDurations = {
            'low': { min: 1, max: 3 },
            'medium': { min: 3, max: 7 },
            'high': { min: 7, max: 14 }
        };
        
        // Historical data storage
        this.historicalTasks = JSON.parse(localStorage.getItem('taskHistory')) || [];
    }

    predictDuration(taskDescription, priority) {
        // Basic prediction logic based on task description length and priority
        let baselineDuration = this.getBaselineDuration(priority);
        let complexityFactor = this.analyzeComplexity(taskDescription);
        
        // Calculate predicted duration
        let predictedDuration = Math.round(baselineDuration * complexityFactor);
        
        // Ensure prediction is within reasonable bounds (1-30 days)
        return Math.min(Math.max(predictedDuration, 1), 30);
    }

    getBaselineDuration(priority) {
        const range = this.baselineDurations[priority];
        return (range.min + range.max) / 2;
    }

    analyzeComplexity(description) {
        // Simple complexity analysis based on description length and key terms
        const complexityTerms = ['complex', 'difficult', 'major', 'significant', 'research'];
        const words = description.toLowerCase().split(' ');
        
        let complexity = 1.0;
        
        // Adjust complexity based on description length
        complexity += (words.length / 10) * 0.5;
        
        // Adjust complexity based on key terms
        complexityTerms.forEach(term => {
            if (description.toLowerCase().includes(term)) {
                complexity += 0.3;
            }
        });

        return complexity;
    }

    recordTaskCompletion(taskData) {
        this.historicalTasks.push(taskData);
        if (this.historicalTasks.length > 100) {
            this.historicalTasks.shift(); // Keep only last 100 tasks
        }
        localStorage.setItem('taskHistory', JSON.stringify(this.historicalTasks));
    }
}

// Initialize the predictor
const taskPredictor = new TaskPredictor();

// Modify your existing createTask function to include duration tracking
function createTask(text, priority = "medium", dueDate = "") {
    const task = document.createElement("div");
    // ... (existing task creation code) ...

    // Add start date to task
    task.dataset.startDate = new Date().toISOString();

    // Predict and display duration
    const predictedDuration = taskPredictor.predictDuration(text, priority);
    task.dataset.predictedDuration = predictedDuration;

    // Add duration display to task
    const durationDisplay = document.createElement('div');
    durationDisplay.className = 'task-duration';
    durationDisplay.innerHTML = `Estimated: ${predictedDuration} days`;
    task.querySelector('.task-content').appendChild(durationDisplay);

    return task;
}

// Modify your existing event listeners to update predictions
document.getElementById("new-task").addEventListener("input", function() {
    const taskText = this.value.trim();
    const priority = document.getElementById("task-priority").value;
    
    if (taskText.length > 3) {
        const predictedDuration = taskPredictor.predictDuration(taskText, priority);
        document.querySelector(".prediction-result").style.display = "block";
        document.getElementById("predicted-duration").textContent = predictedDuration;
    } else {
        document.querySelector(".prediction-result").style.display = "none";
    }
});

// Add this to your existing drag and drop handling for the "done" column
function handleTaskCompletion(task) {
    const startDate = new Date(task.dataset.startDate);
    const endDate = new Date();
    const actualDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const predictedDuration = parseInt(task.dataset.predictedDuration);

    taskPredictor.recordTaskCompletion({
        description: task.querySelector('.task-text').value,
        priority: task.querySelector('.task-priority').value,
        predictedDuration: predictedDuration,
        actualDuration: actualDuration
    });
}

// Modify your drag and drop handling
document.querySelector("#done .tasks-container").addEventListener("drop", function(e) {
    const task = document.querySelector(".dragging");
    if (task) {
        handleTaskCompletion(task);
    }
});
