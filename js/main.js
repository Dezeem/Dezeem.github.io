document.addEventListener('DOMContentLoaded', function() {
  // 初始化主题
  initTheme();
  
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
  // initMobileNav();
  
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
  // initLanguageSwitch();
  // initMobileNav();
  initTOC();
  // initThemeToggle();
  // initSearch();
  initCodeCopy();
  handleImageErrors();
  
  // 确保目录显示/隐藏功能被初始化
  initTOCShowHide();
});

function initTOC() {
  const toc = document.querySelector('.post-toc');
  
  if (!toc) return;
  
  // 初始化目录高亮
  setTimeout(() => {
    initTOCHighlight();
  }, 100);
}

// 修正后的选择器配置
function initTOCHighlight() {
  // 支持中文标题的CSS选择器处理
  const decodeHash = hash => {
    try {
      return decodeURIComponent(hash).toLowerCase()
        .replace(/\s+/g, '-')       // Hexo默认slug处理
        .replace(/[^\-a-z0-9\u4e00-\u9fa5]/g, '') // 过滤特殊字符
    } catch {
      return hash
    }
  }

  // 选择所有正文标题
  const headings = document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5');
  // 选择目录中的所有锚点
  const tocLinks = document.querySelectorAll('.post-toc .toc-content a');
  // 选择目录中的所有li
  const tocLis = document.querySelectorAll('.post-toc .toc-content li');

  if (headings.length === 0 || tocLinks.length === 0) return;

  function updateTOC() {
    let currentId = '';
    let minDiff = Infinity;
    const scrollY = window.scrollY + 120;
  
    // 找到当前滚动到的标题
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
      const level = parseInt(li.className.match(/toc-level-(\d)/)?.[1]) || 1;
      
      // 默认折叠所有标题
      const subOl = li.querySelector('ol');
      if (subOl) subOl.style.display = 'none';
    });
  
    // 展开当前链路的所有层级
    if (currentId) {
      const normalizedId = decodeHash(currentId);
      const activeLink = Array.from(tocLinks).find(link => {
        const linkHash = decodeHash(link.getAttribute('href').substring(1));
        return linkHash === normalizedId;
      });
  
      if (activeLink) {
        let li = activeLink.parentElement;
        while (li && li.matches('li')) {
          const subOl = li.querySelector('ol');
          if (subOl) {
            subOl.style.display = 'block';
            li.classList.add('toc-open');
          }
          li.classList.add('active');
          li = li.parentElement.closest('li');
        }
      }
    }
  }

  window.addEventListener('scroll', updateTOC, { passive: true });
  updateTOC();
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

function initTOCScroll() {
  const $window = $(window);
  const $article = $('.post-main');
  const $tocLinks = $('.toc-content a');
  const $headers = $('.post-body h1, .post-body h2, .post-body h3, .post-body h4');

  // 平滑滚动
  $tocLinks.on('click', function(e) {
    e.preventDefault();
    const target = $(this.getAttribute('href'));
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top - 100
      }, 500);
    }
  });

  // 滚动监听
  let scrollTimer;
  $window.on('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateTOCState, 50);
  });

  function updateTOCState() {
    const scrollTop = $window.scrollTop();
    const windowHeight = $window.height();
    
    // 高亮逻辑
    let currentActive;
    $headers.each(function() {
      const $header = $(this);
      const headerTop = $header.offset().top;
      
      if (headerTop - scrollTop < windowHeight * 0.3) {
        currentActive = $header;
      }
    });

    $tocLinks.removeClass('active');
    if (currentActive) {
      const activeId = '#' + currentActive.attr('id');
      $(`.toc-content a[href="${activeId}"]`)
        .addClass('active')
        .parents('li').addClass('active')
        .siblings().removeClass('active');
    }

    // 显示/隐藏返回顶部
    if (scrollTop > 800) {
      $('#back-to-top').fadeIn();
    } else {
      $('#back-to-top').fadeOut();
    }
  }
}

// 返回顶部按钮
function initBackToTop() {
  $('#back-to-top').on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });
}

$(document).ready(function() {
  initTOCScroll();
  initBackToTop();
});

// 添加性能优化逻辑
let rafId = null
const headingsCache = []

function cacheHeadings() {
  headingsCache.length = 0
  document.querySelectorAll('.post-body h1, h2, h3').forEach(el => {
    const rect = el.getBoundingClientRect()
    headingsCache.push({
      el,
      top: rect.top + window.pageYOffset - $headerHeight
    })
  })
}

// 优化后的滚动处理
function handleScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const threshold = window.innerHeight * 0.2
    
    let activeHeading = null
    headingsCache.some(({ el, top }) => {
      if (scrollTop >= top - threshold) {
        activeHeading = el
        return true
      }
      return false
    })

    updateActiveState(activeHeading)
    rafId = null
  })
}

// 边界条件处理
function shouldEnableScroll() {
  return document.body.scrollHeight > window.innerHeight * 2
}

// 在 initCodeCopy 函数中添加以下内容
function initCodeCopy() {
  document.querySelectorAll('.highlight').forEach(block => {
    // 创建复制按钮
    const btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.textContent = 'Copy';
    block.appendChild(btn);

    // 复制功能
    btn.addEventListener('click', () => {
      const code = block.querySelector('.code pre').innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        btn.textContent = 'Error';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    });
  });
}