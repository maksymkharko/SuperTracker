document.addEventListener('DOMContentLoaded', function() {
    const transferBtn = document.querySelector('.transfer-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    let timeoutId;

    // Функция для показа выпадающего меню
    function showDropdown() {
        dropdownContent.classList.add('show', 'active');
        // Очищаем предыдущий таймер, если он есть
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // Устанавливаем новый таймер на 5 секунд
        timeoutId = setTimeout(() => {
            hideDropdown();
        }, 5000);
    }

    // Функция для скрытия выпадающего меню
    function hideDropdown() {
        dropdownContent.classList.remove('show', 'active');
    }

    // Обработчик клика по кнопке
    transferBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDropdown();
    });

    // Сброс таймера при наведении на меню
    dropdownContent.addEventListener('mouseenter', () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    });

    // Запуск таймера при уходе с меню
    dropdownContent.addEventListener('mouseleave', () => {
        timeoutId = setTimeout(() => {
            hideDropdown();
        }, 1000);
    });

    // Предотвращаем скрытие при клике на элементы меню
    dropdownContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Скрываем меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!dropdownContent.contains(e.target) && !transferBtn.contains(e.target)) {
            hideDropdown();
        }
    });
}); 
