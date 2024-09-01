document.addEventListener('DOMContentLoaded', function() {
  const summaryDiv = document.getElementById('summary');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');
  const chatInput = document.getElementById('chatInput');
  const sendChatButton = document.getElementById('sendChat');
  const chatResponseDiv = document.getElementById('chatResponse');
  const openOptionsButton = document.getElementById('openOptions');

  let pageContent = '';

  function showLoading(message = "正在处理...") {
    loadingDiv.textContent = message;
    loadingDiv.classList.remove('hidden');
    summaryDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
  }

  function hideLoading() {
    loadingDiv.classList.add('hidden');
    summaryDiv.classList.remove('hidden');
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    summaryDiv.classList.add('hidden');
    loadingDiv.classList.add('hidden');
  }

  function summarizeContent(title, content) {
    console.log("开始总结内容");
    showLoading("正在总结...");
    pageContent = content; // 存储页面内容
    chrome.runtime.sendMessage({
      action: "summarize",
      title: title,
      content: content
    }, function(response) {
      console.log("收到总结响应:", response);
      hideLoading();
      if (response && response.result) {
        const result = response.result;
        console.log("总结结果:", result);
        
        document.getElementById('oneSentence').textContent = result.match(/\[一句话总结\]\n([\s\S]*?)\n\[/)?.[1] || '无法提取一句话总结';
        document.getElementById('abstract').textContent = result.match(/\[摘要\]\n([\s\S]*?)\n\[/)?.[1] || '无法提取摘要';
        
        const keyPointsUl = document.getElementById('keyPoints');
        keyPointsUl.innerHTML = '';
        const keyPoints = result.match(/\[核心观点\]\n([\s\S]*?)\n\[/)?.[1]?.split('\n') || [];
        keyPoints.forEach(point => {
          if (point.trim()) {
            const li = document.createElement('li');
            li.textContent = point.trim().replace(/^\d+\.\s*/, '');
            keyPointsUl.appendChild(li);
          }
        });

        const quotesUl = document.getElementById('quotes');
        quotesUl.innerHTML = '';
        const quotes = result.match(/\[金句提取\]\n([\s\S]*?)$/)?.[1]?.split('\n') || [];
        quotes.forEach(quote => {
          if (quote.trim()) {
            const li = document.createElement('li');
            li.textContent = quote.trim().replace(/^\d+\.\s*/, '').replace(/^"(.*)"$/, '$1');
            quotesUl.appendChild(li);
          }
        });
      } else if (response && response.error) {
        showError("错误：" + response.error);
      } else {
        showError("未知错误：无法获取总结结果");
      }
    });
  }

  function sendChatMessage(message) {
    chatResponseDiv.textContent = "正在处理...";
    chrome.runtime.sendMessage({
      action: "chat",
      content: message,
      pageContent: pageContent
    }, function(response) {
      if (response && response.result) {
        chatResponseDiv.textContent = response.result;
      } else if (response && response.error) {
        chatResponseDiv.textContent = "错误：" + response.error;
      } else {
        chatResponseDiv.textContent = "未知错误：无法获取回复";
      }
    });
  }

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log("开始获取页面内容");
    chrome.tabs.sendMessage(tabs[0].id, {action: "getContent"}, function(response) {
      console.log("收到页面内容响应:", response);
      if (response && response.content) {
        pageContent = response.content;
        summarizeContent(response.title, response.content);
      } else {
        showError("无法获取页面内容");
      }
    });
  });

  sendChatButton.addEventListener('click', function() {
    const message = chatInput.value;
    if (message) {
      sendChatMessage(message);
    }
  });

  openOptionsButton.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
});