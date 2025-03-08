function updateClock() {
    const now = new Date();
    
    // Форматирование времени
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Форматирование даты
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
    };
    const dateStr = now.toLocaleDateString('ru-RU', options);
    
    // Обновление времени в шапке
    const headerTime = document.querySelector('.header-time');
    const headerDate = document.querySelector('.header-date');
    if (headerTime && headerDate) {
        headerTime.textContent = `${hours}:${minutes}:${seconds}`;
        headerDate.textContent = dateStr;
    }
}

// Обновление каждую секунду
setInterval(updateClock, 1000);

// Начальное обновление
updateClock(); 
