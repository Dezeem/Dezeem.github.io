document.addEventListener('DOMContentLoaded', function() {
  // 暗黑模式切换
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 检查本地存储中的主题设置
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  // 主题切换按钮点击事件
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      let theme = 'light';
      
      if (document.documentElement.getAttribute('data-theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        theme = 'dark';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
      
      localStorage.setItem('theme', theme);
    });
  }
  
  // 搜索功能
  const searchBtn = document.querySelector('.search-btn');
  const searchContainer = document.querySelector('.search-container');
  const searchClose = document.querySelector('.search-close');
  
  if (searchBtn && searchContainer && searchClose) {
    searchBtn.addEventListener('click', function() {
      searchContainer.classList.add('active');
      setTimeout(() => {
        document.querySelector('.search-input').focus();
      }, 300);
    });
    
    searchClose.addEventListener('click', function() {
      searchContainer.classList.remove('active');
    });
    
    // 点击 ESC 键关闭搜索
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
        searchContainer.classList.remove('active');
      }
    });
  }
  
  // 语言切换
  const langBtns = document.querySelectorAll('.lang-btn');
  
  langBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      localStorage.setItem('lang', lang);
      
      // 重新加载页面以应用新语言
      window.location.reload();
    });
  });
  
  // 文章目录功能
  const tocToggle = document.querySelector('.toc-toggle');
  const tocContent = document.querySelector('.toc-content');
  
  if (tocToggle && tocContent) {
    tocToggle.addEventListener('click', function() {
      tocContent.classList.toggle('collapsed');
      this.classList.toggle('collapsed');
    });
    
    // 目录项点击事件
    const tocLinks = document.querySelectorAll('.toc a');
    
    tocLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 获取目标元素
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // 平滑滚动到目标位置
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
          
          // 更新活动状态
          tocLinks.forEach(l => l.parentElement.classList.remove('active'));
          this.parentElement.classList.add('active');
        }
      });
    });
    
    // 处理目录折叠/展开
    const tocItems = document.querySelectorAll('.toc li');
    
    tocItems.forEach(item => {
      if (item.querySelector('ol')) {
        item.classList.add('has-children');
        
        const link = item.querySelector('a');
        link.addEventListener('click', function(e) {
          e.stopPropagation();
          const parent = this.parentElement;
          parent.classList.toggle('collapsed');
          const subList = parent.querySelector('ol');
          if (subList) {
            subList.classList.toggle('active');
          }
        });
      }
    });
    
    // 滚动时更新目录活动状态
    window.addEventListener('scroll', function() {
      const headings = document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6');
      let currentActive = null;
      
      headings.forEach(heading => {
        const id = heading.getAttribute('id');
        if (id && heading.getBoundingClientRect().top <= 150) {
          currentActive = id;
        }
      });
      
      if (currentActive) {
        tocLinks.forEach(link => {
          link.parentElement.classList.remove('active');
          if (link.getAttribute('href') === `#${currentActive}`) {
            link.parentElement.classList.add('active');
            
            // 展开父级目录
            let parent = link.parentElement.parentElement;
            while (parent && !parent.classList.contains('toc')) {
              if (parent.classList.contains('collapsed')) {
                parent.classList.remove('collapsed');
                const subList = parent.querySelector('ol');
                if (subList) {
                  subList.classList.add('active');
                }
              }
              parent = parent.parentElement;
            }
          }
        });
      }
    });
  }
  
  // 代码块复制按钮
  const codeBlocks = document.querySelectorAll('.post-body pre');
  
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
      }).catch(err => {
        console.error('复制失败:', err);
      });
    });
  });
  
  // 初始化 KaTeX 渲染 LaTeX 公式
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });
  }
  // 在现有的 DOMContentLoaded 事件处理程序中添加以下代码
  
  // 移动导航菜单
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  
  if (mobileNavToggle && mobileNav && mobileNavClose) {
    mobileNavToggle.addEventListener('click', function() {
      mobileNav.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    mobileNavClose.addEventListener('click', function() {
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    // 点击移动导航外部关闭导航
    document.addEventListener('click', function(e) {
      if (mobileNav.classList.contains('active') && 
          !mobileNav.contains(e.target) && 
          !mobileNavToggle.contains(e.target)) {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // 移动端主题切换
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('click', function() {
        let theme = 'light';
        
        if (document.documentElement.getAttribute('data-theme') === 'light') {
          document.documentElement.setAttribute('data-theme', 'dark');
          theme = 'dark';
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
        
        localStorage.setItem('theme', theme);
      });
    }
  }
});