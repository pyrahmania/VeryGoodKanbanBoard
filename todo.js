// Constants for Selectors and Limits
const TODO_FORM = document.getElementById('todo-form');
const TODO_INPUT = document.getElementById('todo-input');
const DOING_LANE = document.getElementById('doing-lane');
const WIP_LIMIT_INPUT = document.getElementById('wip-limit');
const DEFAULT_WIP_LIMIT = 0;

// Global State
let currentWipLimit = parseInt(WIP_LIMIT_INPUT.value, 10) || DEFAULT_WIP_LIMIT;

// Initialize
initializeBoard();

// Initialize the board and setup event listeners
function initializeBoard() {
    TODO_FORM.addEventListener('submit', handleTaskSubmit);
    WIP_LIMIT_INPUT.addEventListener('input', handleWipLimitChange);
    document.querySelectorAll('.lane').forEach(lane => initializeLane(lane));
}

// Handle Task Submission
function handleTaskSubmit(event) {
    event.preventDefault();
    const taskText = TODO_INPUT.value.trim();
    if (taskText) {
        const task = createTaskElement(taskText);
        document.getElementById('todo-lane').appendChild(task);
        TODO_INPUT.value = '';
        updateAverageAge('todo-lane');
    }
}

// Update WIP limit based on input change
function handleWipLimitChange(event) {
    currentWipLimit = parseInt(event.target.value, 10) || DEFAULT_WIP_LIMIT;
    updateColumnAppearance();
}

// Initialize lane for drag-and-drop and WIP checking
function initializeLane(lane) {
    lane.addEventListener('dragover', handleDragOver);
    lane.addEventListener('drop', handleDrop);
}

// Handle dragover for placing task
function handleDragOver(event) {
    event.preventDefault();
    const draggingTask = document.querySelector('.is-dragging');
    const afterElement = getDragAfterElement(event.currentTarget, event.clientY);
    if (afterElement == null) {
        event.currentTarget.appendChild(draggingTask);
    } else {
        event.currentTarget.insertBefore(draggingTask, afterElement);
    }
}

// Handle drop to update WIP status
function handleDrop(event) {
    updateAverageAge(event.currentTarget.id);
    updateColumnAppearance(); // Update color based on WIP limit
}

// Create a task element with necessary events and data
function createTaskElement(text) {
    const task = document.createElement('div');
    task.classList.add('task');
    task.setAttribute('draggable', 'true');
    task.dataset.createdAt = Date.now();

    task.innerHTML = `
        <p>${text}</p>
        <span class="timestamp">${formatTimestamp(new Date())}</span>
    `;

    task.addEventListener('dragstart', () => task.classList.add('is-dragging'));
    task.addEventListener('dragend', () => {
        task.classList.remove('is-dragging');
        updateColumnAppearance();
    });

    return task;
}

// Format timestamp for display
function formatTimestamp(date) {
    return `${date.getHours()}:${date.getMinutes()} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Check and update the appearance of the "Doing" column based on WIP limit
function updateColumnAppearance() {
    const tasksInDoing = DOING_LANE.querySelectorAll('.task').length;
    if (tasksInDoing > currentWipLimit && currentWipLimit > 0) {
        DOING_LANE.classList.add('wip-exceeded');
    } else {
        DOING_LANE.classList.remove('wip-exceeded');
    }
}

// Calculate and update average age of tasks in a column
function updateAverageAge(laneId) {
    if (laneId === 'done-lane') return; // Skip for Done lane
    const lane = document.getElementById(laneId);
    const tasks = lane.querySelectorAll('.task');
    const now = Date.now();

    const totalAge = Array.from(tasks).reduce((sum, task) => {
        return sum + (now - parseInt(task.dataset.createdAt, 10));
    }, 0);

    const averageDays = Math.floor(totalAge / (tasks.length || 1) / (1000 * 60 * 60 * 24));
    document.getElementById(`${laneId.split('-')[0]}-average`).textContent = `${averageDays} days`;
}

// Utility to get the nearest element below the cursor
function getDragAfterElement(lane, y) {
    return [...lane.querySelectorAll('.task:not(.is-dragging)')].reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
