const TASKS_KEY = 'groupTaskBoard.tasks';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const ownerInput = document.getElementById('ownerInput');
const memberList = document.getElementById('memberList');
const priorityInput = document.getElementById('priorityInput');
const statusInput = document.getElementById('statusInput');
const clearBtn = document.getElementById('clearBtn');
const board = document.querySelector('.board');

let tasks = [];

function loadTasks() {
  const saved = localStorage.getItem(TASKS_KEY);
  
  // If there is no saved data, return an empty array (empty board)
  if (saved === null) {
    return [];
  }
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function render() {
  const statuses = ['todo', 'progress', 'done'];
  const isMobile = window.innerWidth <= 800;

  statuses.forEach(function (status) {
    const list = document.getElementById('list-' + status);
    const count = document.getElementById('count-' + status);
    
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

      if (task.status !== 'todo') {
        const prev = document.createElement('button');
        prev.dataset.action = 'prev';
        prev.textContent = isMobile ? '↑ Move Up' : '← Move Left';
        actions.appendChild(prev);
      }

      if (task.status !== 'done') {
        const next = document.createElement('button');
        next.dataset.action = 'next';
        next.textContent = isMobile ? '↓ Move Down' : 'Move Right →';
        actions.appendChild(next);
      }

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
  const ownerName = ownerInput.value.trim();

  if (!name) {
    alert('Please enter a task name.');
    return;
  }

  // Add new owner names to the datalist automatically
  if (ownerName !== "") {
    let exists = false;
    const options = memberList.querySelectorAll('option');
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].value.toLowerCase() === ownerName.toLowerCase()) {
        exists = true;
        break;
      }
    }
    
    if (!exists) {
      const newOption = document.createElement('option');
      newOption.value = ownerName;
      memberList.appendChild(newOption);
    }
  }

  tasks.push({
    id: Date.now(),
    name: name,
    owner: ownerName,
    priority: priorityInput.value,
    status: statusInput.value
  });

  saveTasks();
  render();

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
    
    // Clear the saved names list too
    memberList.innerHTML = ''; 
  }
}

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
window.addEventListener('resize', render);

// Start the app
tasks = loadTasks();
render();
taskInput.focus();
