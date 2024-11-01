function addDragAndDropEvents(task) {
    task.addEventListener('dragstart', () => {
        task.classList.add('is-dragging');
    });

    task.addEventListener('dragend', () => {
        task.classList.remove('is-dragging');
    });
}

document.querySelectorAll('.lane').forEach(lane => {
    lane.addEventListener('dragover', event => {
        event.preventDefault();
        const draggingTask = document.querySelector('.is-dragging');
        const afterElement = getDragAfterElement(lane, event.clientY);
        if (afterElement == null) {
            lane.appendChild(draggingTask);
        } else {
            lane.insertBefore(draggingTask, afterElement);
        }
    });
});

function getDragAfterElement(lane, y) {
    const tasks = [...lane.querySelectorAll('.task:not(.is-dragging)')];

    return tasks.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
