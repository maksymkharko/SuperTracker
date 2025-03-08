// Utility functions
function formatDateTime(date) {
    return date.toISOString().slice(0, 16);
}

function getTimeRemaining(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    
    // Check for invalid date
    if (isNaN(target.getTime())) {
        return {
            total: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    const total = target.getTime() - now.getTime();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
        total,
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds)
    };
}

function getTimeElapsed(startDate) {
    const now = new Date();
    const start = new Date(startDate);
    
    // Check for invalid date
    if (isNaN(start.getTime())) {
        return {
            total: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    const total = now.getTime() - start.getTime();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
        total,
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds)
    };
}

// Data management
class DataManager {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.events = JSON.parse(localStorage.getItem('events')) || [];
    }

    addGoal(name, date = new Date()) {
        const goal = {
            id: Date.now(),
            name,
            date,
            completed: false
        };
        this.goals.push(goal);
        this.saveGoals();
        return goal;
    }

    addEvent(name, date) {
        const event = {
            id: Date.now(),
            name,
            date
        };
        this.events.push(event);
        this.saveEvents();
        return event;
    }

    toggleGoalCompletion(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            this.saveGoals();
        }
    }

    deleteGoal(id) {
        this.goals = this.goals.filter(g => g.id !== id);
        this.saveGoals();
    }

    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveEvents();
    }

    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }

    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }

    exportData() {
        let output = '## Цели\n';
        this.goals.forEach(goal => {
            output += `- [${goal.completed ? 'x' : ' '}] ${goal.name} / ${goal.date}\n`;
        });

        output += '\n## События\n';
        this.events.forEach(event => {
            output += `- ${event.name} / ${event.date}\n`;
        });

        return output;
    }

    importData(text) {
        const lines = text.split('\n');
        let currentSection = '';
        const newGoals = [];
        const newEvents = [];

        lines.forEach(line => {
            if (line.startsWith('## Цели')) {
                currentSection = 'goals';
            } else if (line.startsWith('## События')) {
                currentSection = 'events';
            } else if (line.trim() && line.includes('/')) {
                const [info, date] = line.split('/').map(s => s.trim());
                
                if (currentSection === 'goals') {
                    const completed = info.includes('[x]');
                    const name = info.replace(/- \[[x ]\]/, '').trim();
                    newGoals.push({
                        id: Date.now() + Math.random(),
                        name,
                        date,
                        completed
                    });
                } else if (currentSection === 'events') {
                    const name = info.replace('-', '').trim();
                    newEvents.push({
                        id: Date.now() + Math.random(),
                        name,
                        date
                    });
                }
            }
        });

        this.goals = newGoals;
        this.events = newEvents;
        this.saveGoals();
        this.saveEvents();
    }
}

// UI Management
class UI {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.initializeElements();
        this.setupEventListeners();
        this.setupClock();
        this.setupTheme();
        
        // Initial UI update
        this.updateUI();
        
        // Setup UI update interval
        this.setupUIInterval();
    }

    initializeElements() {
        // Lists
        this.goalsList = document.getElementById('goalsList');
        this.eventsList = document.getElementById('eventsList');

        // Forms
        this.goalForm = document.getElementById('goalForm');
        this.eventForm = document.getElementById('eventForm');

        // Buttons
        this.addGoalBtn = document.getElementById('addGoalBtn');
        this.addEventBtn = document.getElementById('addEventBtn');
        this.exportDataBtn = document.getElementById('exportDataBtn');
        this.importDataBtn = document.getElementById('importDataBtn');
        this.themeToggle = document.getElementById('themeToggle');

        // Modals
        this.goalModal = document.getElementById('goalModal');
        this.eventModal = document.getElementById('eventModal');
        this.dataModal = document.getElementById('dataModal');
    }

    setupEventListeners() {
        // Add goal
        this.addGoalBtn.addEventListener('click', () => this.showModal(this.goalModal));
        this.goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('goalName').value;
            this.dataManager.addGoal(name);
            this.hideModal(this.goalModal);
            this.updateUI();
            this.goalForm.reset();
        });

        // Add event
        this.addEventBtn.addEventListener('click', () => this.showModal(this.eventModal));
        this.eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('eventName').value;
            const date = document.getElementById('eventDateTime').value;
            this.dataManager.addEvent(name, date);
            this.hideModal(this.eventModal);
            this.updateUI();
            this.eventForm.reset();
        });

        // Export/Import
        this.exportDataBtn.addEventListener('click', () => {
            const data = this.dataManager.exportData();
            const exportModal = document.getElementById('exportModal');
            const exportPreview = document.getElementById('exportPreview');
            exportPreview.textContent = data;
            this.showModal(exportModal);

            const copyBtn = document.getElementById('copyExportBtn');
            const closeBtn = document.getElementById('closeExportBtn');

            const copyHandler = () => {
                navigator.clipboard.writeText(data).then(() => {
                    copyBtn.textContent = 'Скопировано!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Копировать';
                    }, 2000);
                });
            };

            const closeHandler = () => {
                this.hideModal(exportModal);
                copyBtn.removeEventListener('click', copyHandler);
                closeBtn.removeEventListener('click', closeHandler);
            };

            copyBtn.addEventListener('click', copyHandler);
            closeBtn.addEventListener('click', closeHandler);
        });

        this.importDataBtn.addEventListener('click', () => {
            const dataModal = document.getElementById('dataModal');
            document.getElementById('dataModalTitle').textContent = 'Импорт данных';
            document.getElementById('dataField').placeholder = 'Вставьте данные для импорта';
            this.showModal(dataModal);
        });

        document.getElementById('saveDataBtn').addEventListener('click', () => {
            const data = document.getElementById('dataField').value;
            this.dataManager.importData(data);
            this.hideModal(this.dataModal);
            this.updateUI();
            document.getElementById('dataField').value = '';
        });

        // Close modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal(modal);
            });
        });
    }

    showModal(modal) {
        modal.classList.add('active');
    }

    hideModal(modal) {
        modal.classList.remove('active');
    }

    updateUI() {
        this.updateGoalsList();
        this.updateEventsList();
    }

    updateGoalsList() {
        this.goalsList.innerHTML = '';
        this.dataManager.goals.forEach(goal => {
            const timeElapsed = getTimeElapsed(goal.date);
            const element = document.createElement('div');
            element.className = 'goal-item';
            element.innerHTML = `
                <h3>${goal.name}</h3>
                <div class="time-info">
                    <p>Прошло времени:</p>
                    <div class="time-display">
                        <div class="time-unit">
                            <span>${timeElapsed.days}</span>
                            <span>дней</span>
                        </div>
                        <div class="time-unit">
                            <span>${timeElapsed.hours}</span>
                            <span>часов</span>
                        </div>
                        <div class="time-unit">
                            <span>${timeElapsed.minutes}</span>
                            <span>минут</span>
                        </div>
                        <div class="time-unit">
                            <span>${timeElapsed.seconds}</span>
                            <span>секунд</span>
                        </div>
                    </div>
                </div>
                <button class="delete-cross" onclick="ui.deleteGoal(${goal.id})"></button>
            `;
            this.goalsList.appendChild(element);
        });
    }

    updateEventsList() {
        this.eventsList.innerHTML = '';
        this.dataManager.events.forEach(event => {
            const timeRemaining = getTimeRemaining(event.date);
            const element = document.createElement('div');
            element.className = 'event-item';
            element.innerHTML = `
                <h3>${event.name}</h3>
                <div class="time-info">
                    <p>До события осталось:</p>
                    <div class="time-display">
                        <div class="time-unit">
                            <span>${timeRemaining.days}</span>
                            <span>дней</span>
                        </div>
                        <div class="time-unit">
                            <span>${timeRemaining.hours}</span>
                            <span>часов</span>
                        </div>
                        <div class="time-unit">
                            <span>${timeRemaining.minutes}</span>
                            <span>минут</span>
                        </div>
                        <div class="time-unit">
                            <span>${timeRemaining.seconds}</span>
                            <span>секунд</span>
                        </div>
                    </div>
                </div>
                <button class="delete-cross" onclick="ui.deleteEvent(${event.id})"></button>
            `;
            this.eventsList.appendChild(element);
        });
    }

    deleteGoal(id) {
        this.dataManager.deleteGoal(id);
        this.updateUI();
    }

    deleteEvent(id) {
        this.dataManager.deleteEvent(id);
        this.updateUI();
    }

    toggleGoal(id) {
        this.dataManager.toggleGoalCompletion(id);
        this.updateUI();
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            
            // Format time for Warsaw timezone
            const warsawTime = new Intl.DateTimeFormat('ru-RU', {
                timeZone: 'Europe/Warsaw',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(now);
            
            // Format date for Warsaw timezone
            const warsawDate = new Intl.DateTimeFormat('ru-RU', {
                timeZone: 'Europe/Warsaw',
                day: 'numeric',
                month: 'long'
            }).format(now);
            
            const clockElement = document.getElementById('humanClock');
            const dateElement = document.getElementById('humanDate');
            
            if (clockElement) clockElement.textContent = warsawTime;
            if (dateElement) dateElement.textContent = warsawDate;
        };

        // Initial update
        updateClock();
        
        // Update every second
        const intervalId = setInterval(updateClock, 1000);
        
        // Store interval ID for cleanup
        this.clockIntervalId = intervalId;
    }

    setupUIInterval() {
        // Clear existing interval if any
        if (this.uiIntervalId) {
            clearInterval(this.uiIntervalId);
        }
        
        // Update UI every second
        this.uiIntervalId = setInterval(() => {
            this.updateGoalsList();
            this.updateEventsList();
        }, 1000);
    }

    cleanup() {
        // Clear all intervals
        if (this.clockIntervalId) {
            clearInterval(this.clockIntervalId);
        }
        if (this.uiIntervalId) {
            clearInterval(this.uiIntervalId);
        }
    }

    setupTheme() {
        const html = document.documentElement;
        const currentTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', currentTheme);

        const themeButtons = document.querySelectorAll('.theme-btn');
        
        // Update active states
        const updateActiveStates = (selectedTheme) => {
            themeButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.theme === selectedTheme) {
                    btn.classList.add('active');
                }
            });
        };

        // Set initial active state
        updateActiveStates(currentTheme);

        // Add click handlers with smooth transition
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newTheme = btn.dataset.theme;
                
                // Add transition class to body
                document.body.style.transition = 'background-color 0.2s ease, color 0.2s ease';
                
                // Update theme
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateActiveStates(newTheme);
                
                // Remove transition after it's complete
                setTimeout(() => {
                    document.body.style.transition = '';
                }, 200);
            });
        });
    }
}

// Initialize
const dataManager = new DataManager();
const ui = new UI(dataManager);

// Cleanup on page unload
window.addEventListener('unload', () => {
    ui.cleanup();
}); 
