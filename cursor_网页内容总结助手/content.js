function getPageContent() {
  console.log("getPageContent 函数被调用");
  const title = document.title;
  console.log("页面标题:", title);
  let content = '';
  const articleElements = document.querySelectorAll('article, [role="main"], .main-content, #main-content');
  if (articleElements.length > 0) {
    console.log("找到了主要内容元素");
    content = articleElements[0].innerText;
  } else {
    console.log("未找到主要内容元素，使用 body 内容");
    content = document.body.innerText;
  }
  content = content.replace(/\s+/g, ' ').trim();
  console.log("内容长度:", content.length);
  return { title, content };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content.js 收到消息:", request);
  if (request.action === "getContent") {
    const pageContent = getPageContent();
    console.log("发送页面内容:", pageContent);
    sendResponse(pageContent);
    return true; // 保持消息通道开放
  }
});

console.log("content.js 已加载");