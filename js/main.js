document.addEventListener('DOMContentLoaded', function() {
  // Handle image loading errors
  document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
      // Replace with a default image or hide
      this.src = '/img/favicon.png';
      this.onerror = null; // Prevent infinite loops
    };
  });
  
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
  
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', toggleTheme);
  }
  
  // Mobile navigation toggle
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  
  if (mobileNavToggle && mobileNav && mobileNavClose) {
    mobileNavToggle.addEventListener('click', function() {
      mobileNav.classList.add('active');
    });
    
    mobileNavClose.addEventListener('click', function() {
      mobileNav.classList.remove('active');
    });
  }
});