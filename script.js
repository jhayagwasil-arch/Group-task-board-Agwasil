const TASKS_KEY = 'groupTaskBoard.tasks';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const ownerInput = document.getElementById('ownerInput');
const priorityInput = document.getElementById('priorityInput');
const statusInput = document.getElementById('statusInput');
const clearBtn = document.getElementById('clearBtn');
const board = document.querySelector('.board');

// Start with a couple of example tasks if localStorage is empty
const defaultTasks = [
  { id: 1, name: 'Design homepage mockup', owner: 'Mia', priority: 'high', status: 'todo' },
  { id: 2, name: 'Set up project repo', owner: 'Leo', priority: 'medium', status: 'progress' },
  { id: 3, name: 'Write README', owner: 'Sam', priority: 'low', status: 'done' }
];

let tasks = [];

function loadTasks() {
  const saved = localStorage.getItem(TASKS_KEY);
  if (saved === null) {
    return defaultTasks.slice();
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return defaultTasks.slice();
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function render() {
  const statuses = ['todo', 'progress', 'done'];

  statuses.forEach(function (status) {
    const list = document.getElementById('list-' + status);
    const count = document.getElementById('count-' + status);
    
    // Filter tasks for this specific column
    const filtered = tasks.filter(function (t) {
      return t.status === status;
    });

    list.innerHTML = '';
    count.textContent = filtered.length;

    if (filtered.length === 0) {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = 'No tasks here';
      list.appendChild(p);
      return;
    }

    filtered.forEach(function (task) {
      const card = document.createElement('div');
      card.className = 'task-card priority-' + task.priority;
      card.dataset.id = task.id;

      const name = document.createElement('p');
      name.className = 'task-name';
      name.textContent = task.name;

      const owner = document.createElement('p');
      owner.className = 'task-owner';
      owner.textContent = 'Assigned to: ' + (task.owner || 'Unassigned');

      const actions = document.createElement('div');
      actions.className = 'task-actions';

      // Back button (if not in To Do)
      if (task.status !== 'todo') {
        const prev = document.createElement('button');
        prev.dataset.action = 'prev';
        prev.textContent = '← Move Left';
        actions.appendChild(prev);
      }

      // Next button (if not in Done)
      if (task.status !== 'done') {
        const next = document.createElement('button');
        next.dataset.action = 'next';
        next.textContent = 'Move Right →';
        actions.appendChild(next);
      }

      // Delete button
      const del = document.createElement('button');
      del.dataset.action = 'delete';
      del.className = 'del';
      del.textContent = 'Delete';
      actions.appendChild(del);

      card.appendChild(name);
      card.appendChild(owner);
      card.appendChild(actions);
      list.appendChild(card);
    });
  });
}

function addTask(e) {
  e.preventDefault();

  const name = taskInput.value.trim();
  if (!name) {
    alert('Please enter a task name.');
    return;
  }

  tasks.push({
    id: Date.now(),
    name: name,
    owner: ownerInput.value.trim(),
    priority: priorityInput.value,
    status: statusInput.value
  });

  saveTasks();
  render();

  // Reset form
  taskInput.value = '';
  ownerInput.value = '';
  taskInput.focus();
}

function moveTask(id, direction) {
  const order = ['todo', 'progress', 'done'];
  const task = tasks.find(function (t) {
    return t.id === id;
  });
  
  if (!task) return;

  const currentIndex = order.indexOf(task.status);
  const newIndex = currentIndex + direction;

  if (newIndex >= 0 && newIndex < order.length) {
    task.status = order[newIndex];
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(function (t) {
    return t.id !== id;
  });
  saveTasks();
  render();
}

function clearAll() {
  if (confirm('Are you sure you want to clear all tasks?')) {
    tasks = [];
    saveTasks();
    render();
  }
}

// Event Listeners
board.addEventListener('click', function (e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const card = btn.closest('.task-card');
  if (!card) return;

  const id = Number(card.dataset.id);
  const action = btn.dataset.action;

  if (action === 'prev') {
    moveTask(id, -1);
  } else if (action === 'next') {
    moveTask(id, 1);
  } else if (action === 'delete') {
    deleteTask(id);
  }
});

taskForm.addEventListener('submit', addTask);
clearBtn.addEventListener('click', clearAll);

// Initialize App
tasks = loadTasks();
render();
taskInput.focus();