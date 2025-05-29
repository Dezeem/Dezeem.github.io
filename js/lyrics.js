// 歌词格式处理
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否是歌词页面
  const lyricsBody = document.querySelector('.lyrics-body');
  if (!lyricsBody) return;
  
  // 处理歌词段落
  const lyricsParagraphs = lyricsBody.querySelectorAll('p');
  
  lyricsParagraphs.forEach(paragraph => {
    // 获取原始文本内容，保留<br>标签
    const originalHtml = paragraph.innerHTML;
    
    // 清空段落内容，准备添加打字机效果
    paragraph.innerHTML = '';
    
    // 将HTML内容按<br>分割成行
    const lines = originalHtml.split(/<br\s*\/?>/gi);
    
    // 为每行创建一个容器
    lines.forEach((line, lineIndex) => {
      const lineContainer = document.createElement('div');
      lineContainer.className = 'lyric-line';
      lineContainer.setAttribute('data-text', line);
      lineContainer.innerHTML = '<span class="typed-text"></span><span class="cursor">|</span>';
      paragraph.appendChild(lineContainer);
      
    });
    
    // 开始打字机效果
    startTypingEffect(paragraph);
  });
  
  // 添加歌词标题动画
  const title = lyricsBody.querySelector('h1');
  if (title) {
    title.style.animation = 'fadeIn 0.8s ease-out';
  }
});

// 打字机效果函数
function startTypingEffect(paragraph) {
  const lines = paragraph.querySelectorAll('.lyric-line');
  let currentLineIndex = 0;
  
  function typeLine(line) {
    const text = line.getAttribute('data-text');
    const typedTextElement = line.querySelector('.typed-text');
    const cursorElement = line.querySelector('.cursor');
    let charIndex = 0;
    
    // 显示当前行
    line.style.opacity = '1';
    
    // 打字效果间隔
    const typingInterval = setInterval(() => {
      if (charIndex < text.length) {
        typedTextElement.textContent += text.charAt(charIndex);
        charIndex++;
      } else {
        // 完成当前行
        clearInterval(typingInterval);
        
        // 短暂延迟后开始下一行
        setTimeout(() => {
          // 隐藏当前行的光标
          cursorElement.style.display = 'none';
          
          // 移动到下一行
          currentLineIndex++;
          if (currentLineIndex < lines.length) {
            typeLine(lines[currentLineIndex]);
          }
        }, 50);
      }
    }, 50); // 打字速度，可以调整
  }
  
  // 开始第一行
  if (lines.length > 0) {
    typeLine(lines[0]);
  }
}