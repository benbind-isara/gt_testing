// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.selectedDate = null;
        const today = new Date();
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();
        
        this.taskInput = document.getElementById('taskInput');
        this.dueDateInput = document.getElementById('dueDateInput');
        this.notesInput = document.getElementById('notesInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.validationMessage = document.getElementById('validationMessage');

        this.calendarGrid = document.getElementById('calendarGrid');
        this.calendarLabel = document.getElementById('calendarLabel');
        this.filterInfo = document.getElementById('filterInfo');
        this.clearFilterBtn = document.getElementById('clearFilter');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        this.dueDateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearFilterBtn.addEventListener('click', () => this.clearDateFilter());
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

        // Default date
        this.dueDateInput.value = this.formatDateInput(new Date());
        
        // Render initial tasks
        this.render();
    }
    
    addTask() {
        const taskText = this.taskInput.value.trim();
        const dueDate = this.dueDateInput.value;
        const notes = this.notesInput.value.trim();
        
        if (taskText === '') {
            this.showValidation('Please add a title before saving.');
            this.taskInput.focus();
            return;
        }

        if (!dueDate) {
            this.showValidation('Choose a due date to place this on the calendar.');
            this.dueDateInput.focus();
            return;
        }

        this.showValidation('');
        
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            dueDate,
            notes
        };
        
        this.tasks.push(task);
        this.taskInput.value = '';
        this.notesInput.value = '';
        this.taskInput.focus();
        this.saveTasks();
        this.render();
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }
    
    clearCompleted() {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.render();
    }
    
    render() {
        const filteredTasks = this.getFilteredTasks();
        this.renderTasks(filteredTasks);
        this.renderCalendar();
        this.updateCounts(filteredTasks);
    }

    renderTasks(taskList) {
        // Clear the list
        this.taskList.innerHTML = '';
        
        // Show empty state if no tasks
        if (taskList.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = this.selectedDate
                ? `No tasks due ${this.formatDisplayDate(this.selectedDate)}.`
                : 'No tasks yet. Add one above!';
            this.taskList.appendChild(emptyState);
            return;
        }
        
        // Render tasks
        const sortedTasks = [...taskList].sort((a, b) => {
            if (a.dueDate === b.dueDate) {
                return a.id - b.id;
            }
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleTask(task.id));
            
            const text = document.createElement('span');
            text.className = 'task-text';
            text.textContent = task.text;

            const meta = document.createElement('div');
            meta.className = 'task-meta';
            meta.textContent = `Due ${this.formatDisplayDate(task.dueDate)}`;

            const textWrapper = document.createElement('div');
            textWrapper.style.flex = '1';
            textWrapper.appendChild(text);
            textWrapper.appendChild(meta);

            if (task.notes) {
                const notes = document.createElement('div');
                notes.className = 'task-notes';
                notes.textContent = task.notes;
                textWrapper.appendChild(notes);
            }
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            
            li.appendChild(checkbox);
            li.appendChild(textWrapper);
            li.appendChild(deleteBtn);
            
            this.taskList.appendChild(li);
        });
    }
    
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    loadTasks() {
        const saved = localStorage.getItem('tasks');
        const parsed = saved ? JSON.parse(saved) : [];
        return parsed.map(task => ({
            ...task,
            dueDate: task.dueDate || this.formatDateInput(new Date()),
            notes: task.notes || ''
        }));
    }

    getFilteredTasks() {
        if (!this.selectedDate) return this.tasks;
        return this.tasks.filter(t => t.dueDate === this.selectedDate);
    }

    renderCalendar() {
        this.calendarGrid.innerHTML = '';
        const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
        const startDay = firstDayOfMonth.getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        this.calendarLabel.textContent = `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${this.currentYear}`;

        // leading blanks
        for (let i = 0; i < startDay; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'calendar-day placeholder';
            placeholder.setAttribute('aria-hidden', 'true');
            this.calendarGrid.appendChild(placeholder);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.formatDateInput(new Date(this.currentYear, this.currentMonth, day));
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            const hasTask = this.tasks.some(t => t.dueDate === dateStr);
            if (hasTask) {
                dayEl.classList.add('has-task');
            }

            if (this.selectedDate === dateStr) {
                dayEl.classList.add('selected');
            }

            dayEl.addEventListener('click', () => {
                this.selectedDate = dateStr;
                this.render();
            });

            this.calendarGrid.appendChild(dayEl);
        }
    }

    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear -= 1;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear += 1;
        }
        this.render();
    }

    clearDateFilter() {
        this.selectedDate = null;
        this.render();
    }

    updateCounts(filteredTasks) {
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const label = this.selectedDate 
            ? `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'} due ${this.formatDisplayDate(this.selectedDate)}`
            : `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} active`;
        this.taskCount.textContent = label;

        this.filterInfo.textContent = this.selectedDate 
            ? `Filtering by ${this.formatDisplayDate(this.selectedDate)}`
            : 'Showing all tasks';

        this.clearFilterBtn.disabled = !this.selectedDate;
    }

    formatDateInput(dateObj) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDisplayDate(dateStr) {
        const date = new Date(`${dateStr}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
            return dateStr;
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    showValidation(message) {
        this.validationMessage.textContent = message;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
