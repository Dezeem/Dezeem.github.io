document.addEventListener('DOMContentLoaded', function() {
  // 初始化主题
  initTheme();
  
  // 初始化语言切换
  initLanguageSwitch();
  
  // 初始化移动导航
  initMobileNav();
  
  // 初始化目录折叠
  initTOC();
  
  // 初始化搜索功能
  initSearch();
  
  // 初始化代码复制功能
  initCodeCopy();
  
  // 处理图片加载错误
  handleImageErrors();
});

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
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
}

// 初始化语言切换
function initLanguageSwitch() {
  const langBtns = document.querySelectorAll('.lang-btn');
  
  langBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      // 这里可以添加语言切换的逻辑
      console.log('切换到语言：', lang);
    });
  });
}

// 初始化移动导航
function initMobileNav() {
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
}

// 初始化目录折叠
function initTOC() {
  const tocToggle = document.querySelector('.toc-toggle');
  const tocContent = document.querySelector('.toc-content');
  
  if (tocToggle && tocContent) {
    tocToggle.addEventListener('click', function() {
      tocContent.classList.toggle('collapsed');
      this.classList.toggle('collapsed');
    });
  }
}

// 初始化搜索功能
function initSearch() {
  const searchBtn = document.querySelector('.search-btn');
  const searchContainer = document.querySelector('.search-container');
  const searchClose = document.querySelector('.search-close');
  
  if (searchBtn && searchContainer && searchClose) {
    searchBtn.addEventListener('click', function() {
      searchContainer.classList.add('active');
      document.querySelector('.search-input').focus();
    });
    
    searchClose.addEventListener('click', function() {
      searchContainer.classList.remove('active');
    });
  }
}

// 初始化代码复制功能
function initCodeCopy() {
  const codeBlocks = document.querySelectorAll('pre');
  
  codeBlocks.forEach(block => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '复制';
    block.appendChild(copyBtn);
    
    copyBtn.addEventListener('click', function() {
      const code = block.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
          copyBtn.textContent = '复制';
        }, 2000);
      });
    });
  });
}

// 处理图片加载错误
function handleImageErrors() {
  document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
      // 替换为默认图片或隐藏
      if (this.src.includes('avatar.png')) {
        this.src = '/img/default-avatar.png';
      } else if (this.src.includes('favicon.png')) {
        // 对于 favicon 错误，我们可以忽略
      } else {
        this.src = '/img/placeholder.png';
      }
      this.onerror = null; // 防止无限循环
    };
  });
}