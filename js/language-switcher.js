/**
 * 语言切换功能
 * 使用URL参数和Cookie结合的方式实现
 */
document.addEventListener('DOMContentLoaded', function() {
  // 获取所有语言切换按钮
  const langBtns = document.querySelectorAll('.lang-btn');
  
  // 从URL获取当前语言
  const currentLang = getCurrentLanguage();
  
  // 初始化语言设置
  setActiveLanguage(currentLang);
  
  // 为所有语言按钮添加点击事件
  langBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      
      // 保存语言偏好
      localStorage.setItem('blog_language', lang);
      
      // 设置Cookie
      setCookie('nf_lang', lang, 365);
      
      // 切换到对应语言的URL
      switchToLanguageURL(lang);
    });
  });
  
  /**
   * 获取当前语言
   * 优先级：URL > localStorage > 默认中文
   */
  function getCurrentLanguage() {
    // 检查URL中是否包含语言信息
    const urlLang = window.location.pathname.split('/')[1];
    if (urlLang === 'en' || urlLang === 'zh-CN') {
      return urlLang;
    }
    
    // 从localStorage获取保存的语言
    const savedLang = localStorage.getItem('blog_language');
    if (savedLang) {
      return savedLang;
    }
    
    // 默认使用中文
    return 'zh-CN';
  }
  
  /**
   * 设置当前激活的语言
   * @param {string} lang - 语言代码
   */
  function setActiveLanguage(lang) {
    // 更新所有语言按钮的激活状态
    langBtns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  /**
   * 切换到对应语言的URL
   * @param {string} lang - 语言代码
   */
  function switchToLanguageURL(lang) {
    // 获取当前路径
    let path = window.location.pathname;
    
    // 移除开头的语言代码（如果有）
    if (path.startsWith('/en/') || path.startsWith('/zh-CN/')) {
      path = path.substring(path.indexOf('/', 1));
    } else if (path === '/en' || path === '/zh-CN') {
      path = '/';
    }
    
    // 构建新的URL
    let newURL;
    if (lang === 'zh-CN') {
      // 中文是默认语言，不需要添加前缀
      newURL = path;
    } else {
      // 英文需要添加/en前缀
      newURL = '/' + lang + (path === '/' ? '' : path);
    }
    
    // 跳转到新URL
    window.location.href = newURL;
  }
  
  /**
   * 设置Cookie
   * @param {string} name - Cookie名称
   * @param {string} value - Cookie值
   * @param {number} days - 过期天数
   */
  function setCookie(name, value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }
});