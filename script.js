class App {
    constructor() {
        this.tasksView = document.getElementById('tasksView');
        this.gamesView = document.getElementById('gamesView');
        this.tasksViewBtn = document.getElementById('tasksViewBtn');
        this.gamesViewBtn = document.getElementById('gamesViewBtn');

        this.taskManager = new TaskManager();
        this.pongGame = new PongGame();
        this.snakeGame = new SnakeGame();

        this.bindNavigation();
        this.setView('tasks');

        window.addEventListener('resize', () => {
            this.pongGame.resizeCanvas();
            this.snakeGame.resizeCanvas();
        });
    }

    bindNavigation() {
        this.tasksViewBtn.addEventListener('click', () => this.setView('tasks'));
        this.gamesViewBtn.addEventListener('click', () => this.setView('games'));
    }

    setView(view) {
        const isTasks = view === 'tasks';
        this.tasksView.classList.toggle('active', isTasks);
        this.gamesView.classList.toggle('active', !isTasks);
        this.tasksViewBtn.classList.toggle('active', isTasks);
        this.gamesViewBtn.classList.toggle('active', !isTasks);

        if (!isTasks) {
            this.pongGame.onShow();
            this.snakeGame.onShow();
        }
        this.pongGame.setActive(!isTasks);
        this.snakeGame.setActive(!isTasks);
    }
}

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

class PongGame {
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreLeftEl = document.getElementById('pongScoreLeft');
        this.scoreRightEl = document.getElementById('pongScoreRight');
        this.resetBtn = document.getElementById('pongReset');

        this.active = false;
        this.frameId = null;
        this.lastTime = 0;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };
        this.paddleHeight = 70;
        this.paddleWidth = 10;
        this.ballSize = 12;
        this.paddleSpeed = 360;
        this.ballSpeed = 320;
        this.scoreLeft = 0;
        this.scoreRight = 0;

        this.resetGame();
        this.bindEvents();
        this.resizeCanvas();
        this.draw();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.active) return;
            if (e.key in this.keys) {
                this.keys[e.key] = true;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (!this.active) return;
            if (e.key in this.keys) {
                this.keys[e.key] = false;
            }
        });

        this.resetBtn.addEventListener('click', () => this.resetGame());
    }

    setActive(isActive) {
        this.active = isActive;
        if (isActive && !this.frameId) {
            this.resizeCanvas(true);
            this.lastTime = performance.now();
            this.frameId = requestAnimationFrame((t) => this.loop(t));
        } else if (!isActive && this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    onShow() {
        // Ensure canvas has real dimensions once the tab is visible
        this.resizeCanvas(true);
    }

    resizeCanvas(forceCenter = false) {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width > 40 ? rect.width : 700;
        const height = Math.max(240, Math.min(420, Math.round(width * 0.55)));
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        if (this.leftPaddle) {
            this.leftPaddle.x = 16;
            this.leftPaddle.y = Math.min(this.leftPaddle.y, this.height - this.paddleHeight);
        }
        if (this.rightPaddle) {
            this.rightPaddle.x = this.width - 16 - this.paddleWidth;
            this.rightPaddle.y = Math.min(this.rightPaddle.y, this.height - this.paddleHeight);
        }
        if (this.ball) {
            this.ball.x = Math.min(Math.max(this.ball.x, this.ballSize / 2), this.width - this.ballSize / 2);
            this.ball.y = Math.min(Math.max(this.ball.y, this.ballSize / 2), this.height - this.ballSize / 2);
            if (forceCenter) {
                this.resetBall(Math.sign(this.ball.vx) || 1);
            }
        }
        this.draw();
    }

    resetGame() {
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.leftPaddle = { x: 16, y: this.height / 2 - this.paddleHeight / 2 };
        this.rightPaddle = { x: this.width - 16 - this.paddleWidth, y: this.height / 2 - this.paddleHeight / 2 };
        this.resetBall();
        this.updateScoreboard();
    }

    resetBall(direction = 1) {
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            vx: this.ballSpeed * direction * (Math.random() > 0.5 ? 1 : -1),
            vy: (Math.random() * 2 - 1) * (this.ballSpeed * 0.6)
        };
    }

    loop(timestamp) {
        if (!this.active) {
            this.frameId = null;
            return;
        }

        const delta = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        this.update(delta);
        this.draw();
        this.frameId = requestAnimationFrame((t) => this.loop(t));
    }

    update(delta) {
        // Move paddles
        if (this.keys.w) this.leftPaddle.y -= this.paddleSpeed * delta;
        if (this.keys.s) this.leftPaddle.y += this.paddleSpeed * delta;
        if (this.keys.ArrowUp) this.rightPaddle.y -= this.paddleSpeed * delta;
        if (this.keys.ArrowDown) this.rightPaddle.y += this.paddleSpeed * delta;

        this.leftPaddle.y = Math.max(0, Math.min(this.height - this.paddleHeight, this.leftPaddle.y));
        this.rightPaddle.y = Math.max(0, Math.min(this.height - this.paddleHeight, this.rightPaddle.y));

        // Move ball
        this.ball.x += this.ball.vx * delta;
        this.ball.y += this.ball.vy * delta;

        // Collide with top/bottom
        if (this.ball.y - this.ballSize / 2 <= 0 || this.ball.y + this.ballSize / 2 >= this.height) {
            this.ball.vy *= -1;
        }

        // Collide with paddles
        this.handlePaddleCollision(this.leftPaddle, 1);
        this.handlePaddleCollision(this.rightPaddle, -1);

        // Score
        if (this.ball.x < 0) {
            this.scoreRight += 1;
            this.updateScoreboard();
            this.resetBall(1);
        } else if (this.ball.x > this.width) {
            this.scoreLeft += 1;
            this.updateScoreboard();
            this.resetBall(-1);
        }
    }

    handlePaddleCollision(paddle, direction) {
        const withinX = direction === 1
            ? this.ball.x - this.ballSize / 2 <= paddle.x + this.paddleWidth && this.ball.x > paddle.x
            : this.ball.x + this.ballSize / 2 >= paddle.x && this.ball.x < paddle.x + this.paddleWidth;

        const withinY = this.ball.y + this.ballSize / 2 >= paddle.y && this.ball.y - this.ballSize / 2 <= paddle.y + this.paddleHeight;

        if (withinX && withinY) {
            this.ball.vx = Math.abs(this.ball.vx) * direction * -1;
            const hitPos = (this.ball.y - paddle.y) / this.paddleHeight - 0.5;
            this.ball.vy = hitPos * this.ballSpeed * 1.2;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Mid line
        this.ctx.setLineDash([6, 10]);
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Paddles
        this.ctx.fillStyle = '#667eea';
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.paddleWidth, this.paddleHeight);

        // Ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
    }

    updateScoreboard() {
        this.scoreLeftEl.textContent = this.scoreLeft;
        this.scoreRightEl.textContent = this.scoreRight;
    }
}

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('snakeScore');
        this.startBtn = document.getElementById('snakeStart');
        this.restartBtn = document.getElementById('snakeRestart');

        this.cellSize = 18;
        this.cols = 0;
        this.rows = 0;
        this.direction = { x: 1, y: 0 };
        this.pendingDirection = { x: 1, y: 0 };
        this.snake = [];
        this.food = null;
        this.score = 0;
        this.isRunning = false;
        this.gameOver = false;
        this.speedMs = 120;
        this.lastTick = 0;
        this.frameId = null;
        this.active = false;

        this.resizeCanvas();
        this.resetGame();
        this.bindEvents();
        this.draw();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.active) return;
            if (e.key === 'ArrowUp' && this.direction.y !== 1) this.pendingDirection = { x: 0, y: -1 };
            else if (e.key === 'ArrowDown' && this.direction.y !== -1) this.pendingDirection = { x: 0, y: 1 };
            else if (e.key === 'ArrowLeft' && this.direction.x !== 1) this.pendingDirection = { x: -1, y: 0 };
            else if (e.key === 'ArrowRight' && this.direction.x !== -1) this.pendingDirection = { x: 1, y: 0 };
        });

        this.startBtn.addEventListener('click', () => this.start());
        this.restartBtn.addEventListener('click', () => this.resetGame(true));
    }

    setActive(isActive) {
        this.active = isActive;
        if (!isActive && this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        } else if (isActive && this.isRunning && !this.frameId) {
            this.resizeCanvas();
            this.lastTick = performance.now();
            this.frameId = requestAnimationFrame((t) => this.loop(t));
        }
    }

    onShow() {
        this.resizeCanvas();
        this.draw();
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width > 40 ? rect.width : 700;
        const height = Math.max(220, Math.min(420, Math.round(width * 0.55)));
        this.cols = Math.max(12, Math.floor(width / this.cellSize));
        this.rows = Math.max(12, Math.floor(height / this.cellSize));
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
    }

    resetGame(keepActive = false) {
        this.score = 0;
        this.direction = { x: 1, y: 0 };
        this.pendingDirection = { x: 1, y: 0 };
        const startX = Math.floor(this.cols / 4);
        const startY = Math.floor(this.rows / 2);
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        this.placeFood();
        this.scoreEl.textContent = this.score;
        this.gameOver = false;
        this.isRunning = keepActive;
        this.lastTick = performance.now();
        if (this.active && this.isRunning) {
            this.frameId = requestAnimationFrame((t) => this.loop(t));
        } else {
            this.draw();
        }
    }

    start() {
        if (this.gameOver) {
            this.resetGame(true);
            return;
        }
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTick = performance.now();
            if (this.active) {
                this.frameId = requestAnimationFrame((t) => this.loop(t));
            }
        }
    }

    loop(timestamp) {
        if (!this.active) {
            this.frameId = null;
            return;
        }
        const delta = timestamp - this.lastTick;
        if (delta >= this.speedMs) {
            this.update();
            this.lastTick = timestamp;
        }
        this.draw();
        this.frameId = requestAnimationFrame((t) => this.loop(t));
    }

    update() {
        if (!this.isRunning || this.gameOver) return;
        this.direction = this.pendingDirection;
        const newHead = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // collisions
        if (
            newHead.x < 0 || newHead.x >= this.cols ||
            newHead.y < 0 || newHead.y >= this.rows ||
            this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
            this.gameOver = true;
            this.isRunning = false;
            return;
        }

        this.snake.unshift(newHead);

        if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.scoreEl.textContent = this.score;
            this.placeFood();
        } else {
            this.snake.pop();
        }
    }

    placeFood() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
        } while (this.snake.some(seg => seg.x === position.x && seg.y === position.y));
        this.food = position;
    }

    draw() {
        // Background gradient
        const bg = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        bg.addColorStop(0, '#f8f9ff');
        bg.addColorStop(1, '#eef2ff');
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // subtle grid
        this.ctx.strokeStyle = 'rgba(102,126,234,0.08)';
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }

        // snake with rounded segments
        this.snake.forEach((seg, index) => {
            const x = seg.x * this.cellSize;
            const y = seg.y * this.cellSize;
            const radius = Math.min(6, this.cellSize / 3);
            const opacity = Math.max(0.35, 1 - index * 0.02);
            this.ctx.fillStyle = `rgba(102, 126, 234, ${opacity})`;
            this.drawRoundedRect(x, y, this.cellSize, this.cellSize, radius);

            // Head glow
            if (index === 0) {
                this.ctx.strokeStyle = 'rgba(118, 75, 162, 0.6)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            }
        });

        // food
        if (this.food) {
            const centerX = this.food.x * this.cellSize + this.cellSize / 2;
            const centerY = this.food.y * this.cellSize + this.cellSize / 2;
            const radius = this.cellSize / 2 - 2;
            const gradient = this.ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, radius);
            gradient.addColorStop(0, '#ffb347');
            gradient.addColorStop(1, '#ff6b6b');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over - Restart to play again', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawRoundedRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
