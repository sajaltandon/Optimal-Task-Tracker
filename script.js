document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task-input");
    const addTaskBtn = document.getElementById("add-task-btn");
    const taskForm = document.getElementById("task-form");
    const taskList = document.getElementById("task-list");
    const clearAllBtn = document.getElementById("clear-all-btn");

    // Enhanced form submission handling
    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText !== "") {
            addTask(taskText);
            taskInput.value = "";
            updateClearButtonVisibility();
            
            // Add visual feedback
            taskInput.style.transform = "scale(0.95)";
            setTimeout(() => {
                taskInput.style.transform = "scale(1)";
            }, 150);
        } else {
            // Shake animation for empty input
            taskInput.classList.add("shake");
            setTimeout(() => {
                taskInput.classList.remove("shake");
            }, 500);
        }
    });

    // Add task button click handler
    addTaskBtn.addEventListener("click", function (e) {
        e.preventDefault();
        taskForm.dispatchEvent(new Event('submit'));
    });

    function addTask(taskText) {
        const li = document.createElement("li");
        const taskId = Date.now(); // Simple unique ID
        
        li.innerHTML = `
            <div class="task-content">
                <span class="task-text">${escapeHtml(taskText)}</span>
                <div class="task-actions">
                    <input 
                        type="datetime-local" 
                        class="expected-completion"
                        title="Set due date (optional)"
                        aria-label="Due date"
                    >
                    <button class="btn complete-btn" title="Mark as completed">
                        ✅ Done
                    </button>
                    <button class="btn delete-btn" title="Delete task">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;

        // Add event listeners for the new task
        const completeBtn = li.querySelector(".complete-btn");
        const deleteBtn = li.querySelector(".delete-btn");
        const dateInput = li.querySelector(".expected-completion");

        // Complete button functionality
        completeBtn.addEventListener("click", function () {
            li.classList.toggle("completed");
            const isCompleted = li.classList.contains("completed");
            
            if (isCompleted) {
                completeBtn.innerHTML = "↩️ Undo";
                completeBtn.title = "Mark as not completed";
                showNotification("Task completed! 🎉", "success");
            } else {
                completeBtn.innerHTML = "✅ Done";
                completeBtn.title = "Mark as completed";
                showNotification("Task restored! 📝", "info");
            }
        });

        // Delete button functionality
        deleteBtn.addEventListener("click", function () {
            // Add exit animation
            li.style.transform = "translateX(-100%)";
            li.style.opacity = "0";
            
            setTimeout(() => {
                li.remove();
                updateClearButtonVisibility();
                showNotification("Task deleted! 🗑️", "warning");
            }, 300);
        });

        // Due date change handler
        dateInput.addEventListener("change", function () {
            if (dateInput.value) {
                const dueDate = new Date(dateInput.value);
                const now = new Date();
                
                if (dueDate < now) {
                    showNotification("Due date is in the past! ⏰", "warning");
                    dateInput.style.borderColor = "var(--warning-color)";
                } else {
                    showNotification("Due date set! 📅", "success");
                    dateInput.style.borderColor = "var(--success-color)";
                }
                
                setTimeout(() => {
                    dateInput.style.borderColor = "var(--border)";
                }, 2000);
            }
        });

        // Add the task to the list with animation
        taskList.appendChild(li);
        
        // Trigger entrance animation
        setTimeout(() => {
            li.style.transform = "translateY(0)";
            li.style.opacity = "1";
        }, 10);

        showNotification("Task added successfully! ✨", "success");
    }

    // Enhanced enter key handling
    taskInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            taskForm.dispatchEvent(new Event('submit'));
        }
    });

    // Clear all functionality
    clearAllBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete all tasks? This action cannot be undone.")) {
            const tasks = taskList.querySelectorAll("li");
            
            // Animate all tasks out
            tasks.forEach((task, index) => {
                setTimeout(() => {
                    task.style.transform = "translateX(-100%)";
                    task.style.opacity = "0";
                }, index * 100);
            });
            
            // Clear after animations complete
            setTimeout(() => {
                taskList.innerHTML = "";
                updateClearButtonVisibility();
                showNotification("All tasks cleared! 🧹", "info");
            }, tasks.length * 100 + 300);
        }
    });

    // Update clear button visibility
    function updateClearButtonVisibility() {
        const hasTasks = taskList.children.length > 0;
        clearAllBtn.style.display = hasTasks ? "inline-block" : "none";
    }

    // Utility function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Notification system
    function showNotification(message, type = "info") {
        // Remove existing notifications
        const existingNotification = document.querySelector(".notification");
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--border-radius-sm);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            font-weight: 500;
            font-size: 14px;
            max-width: 300px;
            transform: translateX(100%);
            transition: var(--transition);
        `;

        // Type-specific styling
        switch (type) {
            case "success":
                notification.style.borderColor = "var(--success-color)";
                notification.style.color = "var(--success-color)";
                break;
            case "warning":
                notification.style.borderColor = "var(--warning-color)";
                notification.style.color = "var(--warning-color)";
                break;
            case "error":
                notification.style.borderColor = "var(--danger-color)";
                notification.style.color = "var(--danger-color)";
                break;
            default:
                notification.style.borderColor = "var(--primary-color)";
                notification.style.color = "var(--primary-color)";
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = "translateX(0)";
        }, 10);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = "translateX(100%)";
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Add some CSS for animations that couldn't be included in the main CSS
    const style = document.createElement("style");
    style.textContent = `
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        li {
            transform: translateY(20px);
            opacity: 0;
            transition: var(--transition);
        }
        
        .notification {
            backdrop-filter: blur(10px);
        }
    `;
    document.head.appendChild(style);

    // Initialize clear button visibility
    updateClearButtonVisibility();

    // Add welcome message
    setTimeout(() => {
        showNotification("Welcome to your beautiful task manager! ✨", "info");
    }, 500);
});
