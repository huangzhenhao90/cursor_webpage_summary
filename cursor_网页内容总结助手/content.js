function getPageContent() {
  const title = document.title;
  let content = '';
  const articleElements = document.querySelectorAll('article, [role="main"], .main-content, #main-content');
  if (articleElements.length > 0) {
    content = articleElements[0].innerText;
  } else {
    content = document.body.innerText;
  }
  content = content.replace(/\s+/g, ' ').trim();
  return { title, content };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getContent") {
    const pageContent = getPageContent();
    console.log("发送页面内容:", pageContent);
    sendResponse(pageContent);
  }
});