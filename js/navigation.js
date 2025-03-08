document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    // Function to switch pages
    function switchPage(pageId) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const selectedPage = document.getElementById(pageId);
        if (selectedPage) {
            selectedPage.classList.add('active');
        }

        // Update navigation buttons
        navButtons.forEach(btn => {
            if (btn.dataset.page === pageId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Add click event listeners to navigation buttons
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.dataset.page;
            switchPage(pageId);
        });
    });

    // Update export/import button handlers
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const copyMdBtn = document.getElementById('copyMdBtn');
    const pasteMdBtn = document.getElementById('pasteMdBtn');

    if (exportDataBtn && copyMdBtn) {
        exportDataBtn.addEventListener('click', () => {
            copyMdBtn.click();
        });
    }

    if (importDataBtn && pasteMdBtn) {
        importDataBtn.addEventListener('click', () => {
            pasteMdBtn.click();
        });
    }
}); 