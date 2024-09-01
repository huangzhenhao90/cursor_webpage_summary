chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize" || request.action === "chat") {
    console.log("收到请求:", request);

    chrome.storage.sync.get(['apiKey', 'apiUrl', 'model'], function(items) {
      const apiKey = items.apiKey;
      const apiUrl = items.apiUrl;
      const model = items.model || 'gpt-3.5-turbo';

      if (!apiKey || !apiUrl) {
        sendResponse({ error: "API密钥或URL未设置。请在选项页面进行设置。" });
        return;
      }

      let prompt;
      if (request.action === "summarize") {
        prompt = `请严格按照以下格式对内容进行总结，每个部分请用相应的标题标记：

[一句话总结]
用一句话概括整个内容的主旨。

[摘要]
用约100字总结内容的要点。

[核心观点]
列出3-5个核心观点，每个观点用一个短句表达。
1. 
2. 
3. 
(如果有更多，继续列出4和5)

[金句提取]
提取3-5句最有价值或最有影响力的句子。
1. "..."
2. "..."
3. "..."
(如果有更多，继续列出4和5)

请基于以下内容进行总结：

标题：${request.title}
内容：${request.content}`;
      } else {
        prompt = `基于以下内容回答问题：
内容：${request.pageContent}
问题：${request.content}`;
      }

      console.log("发送到API的提示:", prompt);

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }]
        })
      })
      .then(response => {
        console.log('Response status:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Response text:', text);
        try {
          return JSON.parse(text);
        } catch (error) {
          console.error('JSON parsing error:', error);
          throw new Error('Invalid JSON response');
        }
      })
      .then(data => {
        if (data.error) {
          sendResponse({ error: data.error.message });
        } else {
          sendResponse({ result: data.choices[0].message.content });
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        sendResponse({ error: error.toString() });
      });
    });
    return true; // 保持消息通道开放
  }
});