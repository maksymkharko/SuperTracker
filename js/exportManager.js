// Менеджер экспорта данных
const ExportManager = {
    // Константа для Варшавского часового пояса
    WARSAW_TIMEZONE: 'Europe/Warsaw',

    // Конвертация даты в Варшавское время
    formatDateTime(date) {
        return new Date(date).toLocaleString('en-US', {
            timeZone: this.WARSAW_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+)/, '$3-$1-$2T$4:$5');
    },

    // Генерация MD формата
    generateMarkdown(goals, events) {
        let markdown = '## Цели\n';
        
        // Сортируем цели по дате создания
        const sortedGoals = [...goals].sort((a, b) => 
            new Date(a.startDate) - new Date(b.startDate)
        );

        // Добавляем цели
        sortedGoals.forEach(goal => {
            const warsawTime = this.formatDateTime(goal.startDate);
            markdown += `- [<${goal.name} / ${warsawTime}]\n`;
        });

        markdown += '\n## События\n';

        // Сортируем события по дате
        const sortedEvents = [...events].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        // Добавляем события
        sortedEvents.forEach(event => {
            const warsawTime = this.formatDateTime(event.date);
            markdown += `[>${event.name} / ${warsawTime}]\n`;
        });

        return markdown;
    },

    // Парсинг MD формата
    parseMarkdown(markdown) {
        const goals = [];
        const events = [];
        let currentSection = '';
        
        const lines = markdown.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            
            if (line === '## Цели') {
                currentSection = 'goals';
                return;
            }
            if (line === '## События') {
                currentSection = 'events';
                return;
            }
            
            if (line) {
                if (currentSection === 'goals' && line.startsWith('- [<')) {
                    const match = line.match(/- \[<(.+?) \/ (.+?)\]/);
                    if (match) {
                        const [_, name, dateStr] = match;
                        const startDate = new Date(dateStr);
                        const endDate = new Date(startDate);
                        endDate.setFullYear(endDate.getFullYear() + 1);
                        
                        goals.push({
                            type: 'goal',
                            name,
                            startDate,
                            endDate,
                            milestones: {}
                        });
                    }
                }
                else if (currentSection === 'events' && line.startsWith('[>')) {
                    const match = line.match(/\[>(.+?) \/ (.+?)\]/);
                    if (match) {
                        const [_, name, dateStr] = match;
                        events.push({
                            type: 'event',
                            name,
                            date: new Date(dateStr),
                            notified: false
                        });
                    }
                }
            }
        });
        
        return { goals, events };
    },

    // Показ модального окна с экспортированными данными
    showExportModal(markdown) {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Экспорт данных</h2>
                <button class="close-button">&times;</button>
            </div>
            <div class="form-group">
                <textarea class="export-textarea" readonly>${markdown}</textarea>
            </div>
            <div class="modal-buttons">
                <button class="copy-button">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                        <path d="M13.5 4.5h-7a2 2 0 00-2 2v7a2 2 0 002 2h7a2 2 0 002-2v-7a2 2 0 00-2-2z"/>
                        <path d="M4.5 11.5v-7a2 2 0 012-2h7"/>
                    </svg>
                    Копировать
                </button>
            </div>
        `;

        modal.appendChild(modalContent);

        // Добавляем обработчики событий
        const closeButton = modalContent.querySelector('.close-button');
        const copyButton = modalContent.querySelector('.copy-button');
        const textarea = modalContent.querySelector('.export-textarea');

        closeButton.onclick = () => modal.remove();

        copyButton.onclick = async () => {
            try {
                await navigator.clipboard.writeText(textarea.value);
                copyButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                        <path d="M13.5 4.5l-8 8L2 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Скопировано!
                `;
                setTimeout(() => {
                    copyButton.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                            <path d="M13.5 4.5h-7a2 2 0 00-2 2v7a2 2 0 002 2h7a2 2 0 002-2v-7a2 2 0 00-2-2z"/>
                            <path d="M4.5 11.5v-7a2 2 0 012-2h7"/>
                        </svg>
                        Копировать
                    `;
                }, 2000);
            } catch (error) {
                console.error('Ошибка при копировании:', error);
            }
        };

        // Закрытие по клику вне модального окна
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        // Добавляем стили
        const styles = `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal.active {
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 1;
            }

            .modal-content {
                background: var(--background-color);
                padding: 2rem;
                border-radius: var(--card-radius);
                box-shadow: var(--shadow-lg);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
            }

            .export-textarea {
                width: 100%;
                min-height: 200px;
                padding: 1rem;
                font-family: monospace;
                font-size: 14px;
                line-height: 1.5;
                border: 1px solid var(--accent-color);
                border-radius: var(--card-radius);
                background: var(--background-color);
                color: var(--text-color);
                resize: vertical;
                margin: 1rem 0;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }

            .close-button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-color);
                padding: 0.5rem;
            }

            .copy-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                background: var(--primary-color);
                color: var(--background-color);
                border: none;
                border-radius: var(--card-radius);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .copy-button:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            .copy-button svg {
                width: 16px;
                height: 16px;
                stroke: currentColor;
                stroke-width: 2;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Добавляем модальное окно на страницу
        document.body.appendChild(modal);
        
        // Даем время для добавления стилей и анимации
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    },

    // Основная функция экспорта
    async export() {
        try {
            // Получаем данные из localStorage
            const goals = JSON.parse(localStorage.getItem('goals') || '[]');
            const events = JSON.parse(localStorage.getItem('events') || '[]');

            // Генерируем markdown
            const markdown = this.generateMarkdown(goals, events);

            // Показываем модальное окно
            this.showExportModal(markdown);

            return true;
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            return false;
        }
    },

    // Основная функция импорта
    async import(markdown) {
        try {
            const { goals, events } = this.parseMarkdown(markdown);
            
            // Сохраняем данные
            localStorage.setItem('goals', JSON.stringify(goals));
            localStorage.setItem('events', JSON.stringify(events));
            
            return true;
        } catch (error) {
            console.error('Ошибка при импорте:', error);
            return false;
        }
    }
};

export default ExportManager; 