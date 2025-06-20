// Simple tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    const pages = ['inventory', 'sales', 'finance', 'promotions'];
    
    pages.forEach(page => {
        const tab = document.getElementById(`${page}-tab`);
        const pageEl = document.getElementById(`${page}-page`);
        
        tab.addEventListener('click', function() {
            // Hide all pages
            pages.forEach(p => {
                document.getElementById(`${p}-page`).classList.remove('active');
                document.getElementById(`${p}-tab`).classList.remove('active');
            });
            
            // Show selected page
            pageEl.classList.add('active');
            tab.classList.add('active');
        });
    });
    
    // Make first tab active by default
    document.getElementById('inventory-tab').classList.add('active');
    
    // Add Promotion button functionality
    const newPromotionBtn = document.getElementById('new-promotion-btn');
    const promotionDialog = document.querySelector('.promotion-dialog');
    const cancelBtn = document.querySelector('.cancel-btn');
    
    newPromotionBtn.addEventListener('click', function() {
        promotionDialog.style.display = 'block';
    });
    
    cancelBtn.addEventListener('click', function() {
        promotionDialog.style.display = 'none';
    });
    
    // This is just a demo - in a real implementation, we would fetch data from the API
    // and implement all the functionality for CRUD operations
});