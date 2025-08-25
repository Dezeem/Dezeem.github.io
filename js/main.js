document.addEventListener('DOMContentLoaded', function () {
  // 初始化主题
  initTheme();

  // 初始化移动导航
  initMobileNav();

  // 初始化目录折叠
  initTOC();

  // 初始化搜索功能
  initSearch();

  initLanguage();

  initCodeCopy();

  handleImageErrors();

  // 确保目录显示/隐藏功能被初始化
  initTOCShowHide();

  // 初始化代码复制功能
  initCodeCopy();

  // 处理图片加载错误
  handleImageErrors();

  // 添加这一行，确保图片点击功能被初始化
  enhancePostInteraction();

  // 初始化电影风格动画
  initMovieStyleAnimation();

  initJQueryDependentFeatures();
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
  // 从localStorage获取保存的语言，默认为中文
  const savedLang = localStorage.getItem('blog_language') || 'zh-CN';
  
  // 设置HTML标签的lang属性
  document.documentElement.setAttribute('lang', savedLang);
  
  // 更新语言按钮的激活状态
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === savedLang);
  });
}

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

  btn.addEventListener('click', function () {
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
  $tocLinks.on('click', function (e) {
    e.preventDefault();
    // 获取 href 并解码
    const href = this.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const decodedId = decodeURIComponent(href.slice(1));
    // 用原生方法查找目标元素
    const target = document.getElementById(decodedId);
    if (target) {
      // 平滑滚动到目标
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - 100,
        behavior: 'smooth'
      });
    }
  });

  // 滚动监听
  let scrollTimer;
  $window.on('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateTOCState, 50);
  });

  function updateTOCState() {
    const scrollTop = $window.scrollTop();
    const windowHeight = $window.height();

    // 高亮逻辑
    let currentActive;
    $headers.each(function () {
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
  $('#back-to-top').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });
}

// 在文件顶部添加 jQuery 检查
function initJQueryDependentFeatures() {
  // 所有依赖 jQuery 的功能
  $(document).ready(function () {
    try {
      initTOCScroll();
      initBackToTop();
    } catch (e) {
      console.error('Error initializing jQuery features:', e);
    }
  });
}

// 增强文章页面交互效果
function enhancePostInteraction() {
  // 仅在文章页面执行
  if (!document.querySelector('.post-container')) return;

  document.querySelectorAll('.post-body h2, .post-body h3, .post-body h4').forEach(heading => {
    // 确保标题有ID以便于目录跳转
    if (!heading.id) {
      heading.id = heading.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    }
  });

  // 优化图片点击放大效果
  const imgOverlayClass = 'img-overlay';

  // 确保不会重复添加事件监听器
  document.querySelectorAll('.post-body img').forEach(img => {
    // 检查是否已经添加了点击事件
    if (img.getAttribute('data-zoom-enabled')) return;

    img.setAttribute('data-zoom-enabled', 'true');
    img.style.cursor = 'zoom-in';

    img.addEventListener('click', () => {
      // 检查是否已存在遮罩层
      if (document.querySelector(`.${imgOverlayClass}`)) return;

      // 创建遮罩和放大图片容器
      const overlay = document.createElement('div');
      overlay.className = imgOverlayClass;
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.cursor = 'zoom-out';

      const imgClone = document.createElement('img');
      imgClone.src = img.src;
      imgClone.style.minWidth = 'min(50%, 95vw)';
      imgClone.style.minHeight = 'min(50%, 95vh)';
      imgClone.style.objectFit = 'contain';
      imgClone.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.3)';
      imgClone.style.transform = 'scale(0.9)';
      imgClone.style.opacity = '0';
      imgClone.style.transition = 'all 0.3s ease';

      overlay.appendChild(imgClone);
      document.body.appendChild(overlay);

      // 触发动画
      setTimeout(() => {
        imgClone.style.transform = 'scale(1)';
        imgClone.style.opacity = '1';
      }, 50);

      // 点击关闭
      overlay.addEventListener('click', () => {
        imgClone.style.transform = 'scale(0.9)';
        imgClone.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      });

      // ESC键关闭
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          imgClone.style.transform = 'scale(0.9)';
          imgClone.style.opacity = '0';
          setTimeout(() => {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
          }, 300);
        }
      };

      document.addEventListener('keydown', escHandler);
    });
  });

  // 简化代码块行号显示，减少DOM操作
  document.querySelectorAll('pre code').forEach(block => {
    if (block.parentNode.querySelector('.line-numbers-rows')) return;

    const lines = block.innerHTML.split('\n').length;
    if (lines <= 1) return; // 单行代码不添加行号

    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers-rows';
    lineNumbers.style.position = 'absolute';
    lineNumbers.style.top = '0';
    lineNumbers.style.left = '0';
    lineNumbers.style.width = '3em';
    lineNumbers.style.textAlign = 'right';
    lineNumbers.style.paddingRight = '0.5em';
    lineNumbers.style.paddingTop = '1em';
    lineNumbers.style.color = 'var(--color-text-light)';
    lineNumbers.style.opacity = '0.5';
    lineNumbers.style.userSelect = 'none';

    // 使用文档片段减少重排
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < lines; i++) {
      const line = document.createElement('span');
      line.textContent = i + 1;
      fragment.appendChild(line);
    }

    lineNumbers.appendChild(fragment);
    block.parentNode.style.position = 'relative';
    block.parentNode.insertBefore(lineNumbers, block);
  });

  // 添加触摸友好的图片查看
  document.querySelectorAll('.post-body img').forEach(img => {
    // ... 现有代码 ...
    
    // 添加双指缩放支持
    let initialDistance = 0;
    let currentScale = 1;
    
    img.addEventListener('touchstart', function(e) {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
      }
    });
    
    img.addEventListener('touchmove', function(e) {
      if (e.touches.length === 2) {
        e.preventDefault(); // 防止页面滚动
        
        const currentDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        
        const newScale = (currentDistance / initialDistance) * currentScale;
        
        if (newScale >= 0.5 && newScale <= 3) {
          img.style.transform = `scale(${newScale})`;
        }
      }
    });
    
    img.addEventListener('touchend', function() {
      if (img.style.transform) {
        currentScale = parseFloat(img.style.transform.replace('scale(', '').replace(')', ''));
        
        // 如果缩放比例接近1，重置为原始大小
        if (currentScale < 1.1 && currentScale > 0.9) {
          img.style.transform = '';
          currentScale = 1;
        }
      }
    });
  });
  
  // 优化代码块在移动端的显示
  document.querySelectorAll('pre').forEach(pre => {
    pre.style.overflowX = 'auto';
    pre.style.WebkitOverflowScrolling = 'touch'; // 增强iOS滚动体验
    
    // 添加左右滑动提示
    if (!pre.querySelector('.scroll-hint') && pre.scrollWidth > pre.clientWidth) {
      const hint = document.createElement('div');
      hint.className = 'scroll-hint';
      hint.innerHTML = '<i class="fas fa-arrows-alt-h"></i>';
      hint.style.position = 'absolute';
      hint.style.right = '10px';
      hint.style.top = '10px';
      hint.style.background = 'rgba(0,0,0,0.3)';
      hint.style.color = 'white';
      hint.style.padding = '4px 8px';
      hint.style.borderRadius = '4px';
      hint.style.fontSize = '12px';
      hint.style.opacity = '0.7';
      hint.style.transition = 'opacity 0.3s';
      
      pre.style.position = 'relative';
      pre.appendChild(hint);
      
      // 滚动时隐藏提示
      pre.addEventListener('scroll', function() {
        hint.style.opacity = '0';
        setTimeout(() => {
          hint.remove();
        }, 300);
      });
    }
  });
}

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


// 在initMobileNav函数中添加遮罩层处理
function initMobileNav() {
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav-close');

  // 创建遮罩层
  let overlay = document.querySelector('.mobile-nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', function () {
      mobileNav.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', function () {
      mobileNav.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = ''; // 恢复滚动
    });
  }

  // 点击遮罩层关闭导航
  overlay.addEventListener('click', function () {
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // 恢复滚动
  });

  // 添加触摸滑动关闭导航
  let touchStartX = 0;
  let touchEndX = 0;

  mobileNav.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  mobileNav.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX < -50) { // 向右滑动
      mobileNav.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = ''; // 恢复滚动
    }
  }, false);
}

function initSearch() {
  const searchBtn = document.querySelector('.search-btn');
  const searchContainer = document.querySelector('.search-container');
  const searchClose = document.querySelector('.search-close');
  const searchInput = document.querySelector('.search-input');
  const searchResults = document.createElement('div');
  searchResults.className = 'search-results';

  if (!searchBtn || !searchContainer || !searchClose || !searchInput) return;

  // 添加搜索结果容器
  searchContainer.querySelector('.container').appendChild(searchResults);

  // 搜索功能
  function performSearch(query) {
    if (!query.trim()) {
      searchResults.innerHTML = '';
      return;
    }

    // 使用Hexo的搜索API
    if (window.searchJson) {
      const results = window.searchJson.filter(item => {
        return item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.content.toLowerCase().includes(query.toLowerCase());
      });

      displayResults(results, query);
    } else {
      // 如果没有预加载的搜索数据，使用fetch获取
      fetch('/search.xml')
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
          const items = data.querySelectorAll('entry');
          const results = Array.from(items).map(item => ({
            title: item.querySelector('title').textContent,
            url: item.querySelector('url').textContent,
            content: item.querySelector('content').textContent
          }));
          displayResults(results.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.content.toLowerCase().includes(query.toLowerCase())
          ), query);
        });
    }
  }

  // 高亮搜索词函数
  function highlightText(text, query) {
    if (!query.trim()) return text;
    
    const queryTerms = query.trim().toLowerCase().split(/\s+/);
    let highlightedText = text;
    
    queryTerms.forEach(term => {
      if (term.length < 2) return; // 忽略过短的词
      
      const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="highlight-text">$1</span>');
    });
    
    return highlightedText;
  }
  
  // 转义正则表达式特殊字符
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 显示搜索结果
  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">没有找到匹配的结果</div>';
      return;
    }

    searchResults.innerHTML = results.map(result => {
      // 提取匹配上下文
      let excerpt = result.content;
      const queryLower = query.toLowerCase();
      const contentLower = result.content.toLowerCase();
      const index = contentLower.indexOf(queryLower);
      
      if (index > -1) {
        // 从匹配位置前后各取一些文本
        const start = Math.max(0, index - 60);
        const end = Math.min(result.content.length, index + query.length + 60);
        excerpt = result.content.substring(start, end);
        
        // 如果不是从头开始，添加省略号
        if (start > 0) excerpt = '...' + excerpt;
        if (end < result.content.length) excerpt += '...';
      } else {
        // 如果没有直接匹配，取前150个字符
        excerpt = result.content.substring(0, 150) + '...';
      }
      
      // 高亮标题和摘要中的搜索词
      const highlightedTitle = highlightText(result.title, query);
      const highlightedExcerpt = highlightText(excerpt, query);
      
      return `
        <div class="search-result-item">
          <a href="${result.url}" class="search-result-title">${highlightedTitle}</a>
          <div class="search-result-excerpt">${highlightedExcerpt}</div>
        </div>
      `;
    }).join('');
  }

  // 输入防抖
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      performSearch(e.target.value);
    }, 300);
  });

  // 原有交互逻辑保持不变
  searchBtn.addEventListener('click', () => {
    searchContainer.classList.add('active');
    searchInput.focus();
  });

  searchClose.addEventListener('click', () => {
    searchContainer.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchContainer.classList.remove('active');
      searchInput.value = '';
      searchResults.innerHTML = '';
    }
  });
}

// 初始化电影风格动画
function initMovieStyleAnimation() {
  // 检查是否存在电影风格的个人介绍部分
  const movieStyleSection = document.querySelector('.profile-section.movie-style');
  if (!movieStyleSection) return;

  // 添加淡入动画
  const elements = [
    '.movie-quote',
    '.profile-content .avatar',
    '.profile-content .profile-info'
  ];

  elements.forEach((selector, index) => {
    const element = movieStyleSection.querySelector(selector);
    if (element) {
      element.style.opacity = '1';
      // element.style.animation = `fadeIn 1s ease forwards ${index * 0.5}s`;
    }
  });
}

function handleImageErrors() {
  document.querySelectorAll('img').forEach(img => {
    // Add error handler for broken images
    img.addEventListener('error', function () {
      // Replace broken image with placeholder or hide it
      this.style.display = 'none';

      // Alternatively, you could set a placeholder image:
      // this.src = '/path/to/placeholder-image.png';
      // this.alt = 'Image failed to load';

      // Or show an error message
      const errorSpan = document.createElement('span');
      errorSpan.className = 'image-error';
      errorSpan.textContent = 'Image failed to load';
      this.parentNode.insertBefore(errorSpan, this.nextSibling);
    });
  });
}