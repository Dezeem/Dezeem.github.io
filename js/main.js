document.addEventListener('DOMContentLoaded', function() {
  // 初始化主题
  initTheme();
  
  // 初始化语言切换
  initLanguageSwitch();
  
  // 确保在DOM加载完成后初始化
  document.addEventListener('DOMContentLoaded', function() {
    initMobileNav();
    initTOC();
    initThemeToggle();
    initSearch();
    initCodeCopy();
    handleImageErrors();
    initLanguageSwitch();
  });
  
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
      const lang = this.dataset.lang;
      const currentPath = window.location.pathname;
      
      // 处理多语言路径转换
      const newPath = currentPath.replace(/^\/(en|zh-CN)\//, '/'); // 移除现有语言前缀
      window.location.pathname = lang === 'en' ? newPath : `/${lang}${newPath}`;
    });
  });
}

function initLanguage() {
  // 从 HTML 标签获取语言配置
  const getCurrentLang = () => {
    return document.documentElement.lang || 'en';
  };

  // 设置按钮高亮
  const setPageLanguage = (lang) => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  };
  
  setPageLanguage(getCurrentLang());
}

// DOM加载后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 移除重复的初始化调用
  initLanguage();
  initLanguageSwitch();
  initMobileNav();
  initTOC();
  initThemeToggle();
  initSearch();
  initCodeCopy();
  handleImageErrors();
  
  // 确保目录显示/隐藏功能被初始化
  initTOCShowHide();
});

function initTOC() {
  const toc = document.querySelector('.post-toc');
  
  if (!toc) return;

  // 仅保留目录项类添加功能
  const tocItems = document.querySelectorAll('.toc-content li');
  tocItems.forEach(item => {
    item.classList.add('toc-item');
    
    const subList = item.querySelector('ol');
    if (subList) {
      item.classList.add('has-children');
    }
  });

  // 初始化目录高亮
  initTOCHighlight();
}

/**
 * 初始化目录高亮和跟随功能
 */
function initTOCHighlight() {
  const headings = document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6');
  const tocLinks = document.querySelectorAll('.toc-content a');
  const tocLis = document.querySelectorAll('.toc-content li');

  if (headings.length === 0 || tocLinks.length === 0) return;

  function updateTOC() {
    let currentId = '';
    let minDiff = Infinity;
    const scrollY = window.scrollY + 120;

    // 找到当前滚动位置对应的标题
    headings.forEach(heading => {
      const headingTop = heading.getBoundingClientRect().top + window.scrollY;
      if (headingTop - scrollY <= 0 && scrollY - headingTop < minDiff) {
        minDiff = scrollY - headingTop;
        currentId = heading.id;
      }
    });

    // 重置所有目录项状态
    tocLis.forEach(li => {
      li.classList.remove('active');
      li.classList.remove('toc-open');
      // 默认折叠所有子目录
      const subOl = li.querySelector('ol');
      if (subOl) {
        subOl.style.display = 'none';
      }
    });

    // 如果找到当前标题，高亮并展开其父级
    if (currentId) {
      const activeLink = document.querySelector(`.toc-content a[href="#${CSS.escape(currentId)}"]`);
      if (activeLink) {
        // 记录需要展开的所有父级元素
        const parentsToOpen = [];
        let li = activeLink.parentElement;
        
        // 向上查找所有父级
        while (li && li.matches('.toc-item')) {
          parentsToOpen.push(li);
          li = li.parentElement.closest('.toc-item');
        }
        
        // 展开所有父级
        parentsToOpen.forEach(parent => {
          parent.classList.add('active');
          parent.classList.add('toc-open');
          
          // 展开当前项的子目录
          const subOl = parent.querySelector('ol');
          if (subOl) {
            subOl.style.display = 'block';
          }
          
          // 展开父级的子目录（确保路径可见）
          const parentOl = parent.parentElement;
          if (parentOl && parentOl.tagName.toLowerCase() === 'ol') {
            parentOl.style.display = 'block';
          }
        });
      }
    }
  }

  // 使用节流函数优化滚动性能
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateTOC();
        ticking = false;
      });
      ticking = true;
    }
  });

  // 初始化时执行一次
  updateTOC();
  
  // 窗口大小改变时重新计算
  window.addEventListener('resize', updateTOC);
}

function initTOCShowHide() {
  const tocWrapper = document.querySelector('.post-toc-wrapper');
  const toc = document.querySelector('.post-toc');
  const btn = document.querySelector('.toc-toggle-btn');
  if (!tocWrapper || !toc || !btn) return;

  // 读取本地存储的显示状态
  let show = localStorage.getItem('tocShow') !== 'false';
  toc.classList.toggle('hide', !show);

  btn.addEventListener('click', function() {
    show = !show;
    toc.classList.toggle('hide', !show);
    localStorage.setItem('tocShow', show);
  });
}