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

  handleImageErrors();

  // 确保目录显示/隐藏功能被初始化
  initTOCShowHide();

  // 初始化代码复制功能
  initCodeCopy();

  // 处理图片加载错误
  handleImageErrors();

  // 添加这一行，确保图片点击功能被初始化
  enhancePostInteraction();

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
const $headerHeight = 70; // 默认 header 高度，可根据实际情况调整

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

// 更新激活状态的函数
function updateActiveState(activeHeading) {
  // 移除所有标题的激活状态
  document.querySelectorAll('.post-toc .toc-content a').forEach(link => {
    link.classList.remove('active')
  })
  
  if (activeHeading) {
    // 激活对应的目录链接
    const activeId = '#' + activeHeading.id
    const activeLink = document.querySelector(`.post-toc .toc-content a[href="${activeId}"]`)
    if (activeLink) {
      activeLink.classList.add('active')
    }
  }
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

// 初始化性能优化
function initPerformanceOptimizations() {
  cacheHeadings()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', cacheHeadings)
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
  console.log('Initializing mobile nav...');
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav-close');

  console.log('Elements found:', {
    mobileNavToggle: !!mobileNavToggle,
    mobileNav: !!mobileNav,
    mobileNavClose: !!mobileNavClose
  });

  // 创建遮罩层
  let overlay = document.querySelector('.mobile-nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);
    console.log('Created mobile nav overlay');
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', function () {
      console.log('Mobile nav toggle clicked');
      mobileNav.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
    console.log('Added click listener to mobile nav toggle');
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', function () {
      console.log('Mobile nav close clicked');
      mobileNav.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = ''; // 恢复滚动
    });
    console.log('Added click listener to mobile nav close');
  }

  // 点击遮罩层关闭导航
  overlay.addEventListener('click', function () {
    console.log('Mobile nav overlay clicked');
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // 恢复滚动
  });
  console.log('Added click listener to mobile nav overlay');

  // 添加触摸滑动关闭导航
  let touchStartX = 0;
  let touchEndX = 0;

  if (mobileNav) {
    mobileNav.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, false);

    mobileNav.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX < -50) { // 向右滑动
        console.log('Mobile nav swipe right detected');
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // 恢复滚动
      }
    }, false);
    console.log('Added touch listeners to mobile nav');
  }
  
  console.log('Mobile nav initialization complete');
}

function initSearch() {
  const searchBtn = document.querySelector('.search-btn');
  const searchContainer = document.querySelector('.search-container');
  const searchClose = document.querySelector('.search-close');
  const searchInput = document.querySelector('.search-input');
  const searchForm = document.querySelector('.search-form');
  
  if (!searchBtn || !searchContainer || !searchClose || !searchInput || !searchForm) return;

  // 创建搜索结果容器
  let searchResults = document.querySelector('.search-results');
  if (!searchResults) {
    searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchContainer.querySelector('.container').appendChild(searchResults);
  }

  // 搜索状态管理
  let isSearching = false;
  let searchTimer = null;
  let currentQuery = '';

  // 搜索功能
  function performSearch(query) {
    currentQuery = query.trim();
    
    if (!currentQuery) {
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
      return;
    }

    // 显示搜索中状态
    searchResults.style.display = 'block';
    searchResults.innerHTML = '<div class="search-loading">搜索中...</div>';
    isSearching = true;

    // 使用Hexo的搜索API
    if (window.searchJson) {
      // 使用更智能的搜索算法
      const results = window.searchJson.filter(item => {
        const title = item.title.toLowerCase();
        const content = item.content.toLowerCase();
        const queryLower = currentQuery.toLowerCase();
        
        // 权重计算：标题匹配权重更高
        const titleScore = title.includes(queryLower) ? 2 : 0;
        const contentScore = content.includes(queryLower) ? 1 : 0;
        
        // 支持多关键词搜索
        const keywords = queryLower.split(/\s+/).filter(k => k.length > 1);
        let keywordScore = 0;
        
        keywords.forEach(keyword => {
          if (title.includes(keyword)) keywordScore += 1.5;
          if (content.includes(keyword)) keywordScore += 0.5;
        });
        
        return (titleScore + contentScore + keywordScore) > 0;
      });

      // 按相关性排序
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const queryLower = currentQuery.toLowerCase();
        
        const aTitleMatch = aTitle.includes(queryLower) ? 2 : 0;
        const bTitleMatch = bTitle.includes(queryLower) ? 2 : 0;
        
        return bTitleMatch - aTitleMatch;
      });

      // 延迟显示结果，提供更好的用户体验
      setTimeout(() => {
        displayResults(results, currentQuery);
        isSearching = false;
      }, 300);
      
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
          
          const filteredResults = results.filter(item =>
            item.title.toLowerCase().includes(currentQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(currentQuery.toLowerCase())
          );
          
          displayResults(filteredResults, currentQuery);
          isSearching = false;
        })
        .catch(error => {
          console.error('搜索失败:', error);
          searchResults.innerHTML = '<div class="no-results">搜索服务暂时不可用</div>';
          isSearching = false;
        });
    }
  }

  // 高亮搜索词函数
  function highlightText(text, query) {
    if (!query.trim()) return text;
    
    const queryTerms = query.trim().toLowerCase().split(/\s+/).filter(term => term.length > 1);
    let highlightedText = text;
    
    queryTerms.forEach(term => {
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
      searchResults.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <div>没有找到与 "${query}" 相关的结果</div>
          <div style="margin-top: 8px; font-size: 14px; opacity: 0.7;">尝试使用其他关键词或检查拼写</div>
        </div>
      `;
      return;
    }

    const resultsHTML = results.map((result, index) => {
      // 智能提取匹配上下文
      let excerpt = result.content;
      const queryLower = query.toLowerCase();
      const contentLower = result.content.toLowerCase();
      
      // 查找最佳匹配位置
      let bestIndex = -1;
      let bestScore = 0;
      
      const keywords = queryLower.split(/\s+/).filter(k => k.length > 1);
      keywords.forEach(keyword => {
        const index = contentLower.indexOf(keyword);
        if (index > -1) {
          const score = keyword.length;
          if (score > bestScore) {
            bestScore = score;
            bestIndex = index;
          }
        }
      });
      
      if (bestIndex > -1) {
        // 从最佳匹配位置前后各取文本
        const start = Math.max(0, bestIndex - 80);
        const end = Math.min(result.content.length, bestIndex + keywords[0].length + 80);
        excerpt = result.content.substring(start, end);
        
        // 添加省略号
        if (start > 0) excerpt = '...' + excerpt;
        if (end < result.content.length) excerpt += '...';
      } else {
        // 如果没有匹配，取前180个字符
        excerpt = result.content.substring(0, 180) + '...';
      }
      
      // 高亮标题和摘要中的搜索词
      const highlightedTitle = highlightText(result.title, query);
      const highlightedExcerpt = highlightText(excerpt, query);
      
      return `
        <div class="search-result-item" data-index="${index}">
          <a href="${result.url}" class="search-result-title">${highlightedTitle}</a>
          <div class="search-result-excerpt">${highlightedExcerpt}</div>
        </div>
      `;
    }).join('');
    
    searchResults.innerHTML = resultsHTML;
    
    // 添加结果统计
    const resultsCount = document.createElement('div');
    resultsCount.className = 'search-results-count';
    resultsCount.innerHTML = `找到 ${results.length} 个结果`;
    searchResults.insertBefore(resultsCount, searchResults.firstChild);
  }

  // 输入防抖和优化
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // 清除之前的定时器
    clearTimeout(searchTimer);
    
    // 如果查询为空，立即清除结果
    if (!query) {
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
      return;
    }
    
    // 如果查询太短，显示提示
    if (query.length < 2) {
      searchResults.style.display = 'block';
      searchResults.innerHTML = '<div class="no-results">请输入至少2个字符进行搜索</div>';
      return;
    }
    
    // 设置新的定时器
    searchTimer = setTimeout(() => {
      if (query === currentQuery && isSearching) return;
      performSearch(query);
    }, 400);
  });
  
  // 表单提交处理
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
    }
  });

  // 增强交互逻辑
  searchBtn.addEventListener('click', () => {
    searchContainer.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
    
    // 延迟聚焦，确保动画完成
    setTimeout(() => {
      searchInput.focus();
      searchInput.select();
    }, 300);
  });

  function closeSearch() {
    searchContainer.classList.remove('active');
    document.body.style.overflow = ''; // 恢复背景滚动
    
    // 延迟清除内容，确保动画完成
    setTimeout(() => {
      searchInput.value = '';
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
      currentQuery = '';
    }, 200);
  }

  searchClose.addEventListener('click', closeSearch);

  // 点击背景关闭搜索
  searchContainer.addEventListener('click', (e) => {
    if (e.target === searchContainer) {
      closeSearch();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
      closeSearch();
    }
    
    // 支持Ctrl+K快速打开搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (!searchContainer.classList.contains('active')) {
        searchBtn.click();
      }
    }
  });
  
  // 添加键盘导航支持
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstResult = searchResults.querySelector('.search-result-item');
      if (firstResult) {
        firstResult.focus();
      }
    }
  });
  
  // 搜索结果键盘导航
  searchResults.addEventListener('keydown', (e) => {
    const currentItem = e.target.closest('.search-result-item');
    if (!currentItem) return;
    
    const items = Array.from(searchResults.querySelectorAll('.search-result-item'));
    const currentIndex = items.indexOf(currentItem);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1].focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex - 1].focus();
        } else {
          searchInput.focus();
        }
        break;
      case 'Enter':
        e.preventDefault();
        currentItem.querySelector('a').click();
        break;
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