chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize" || request.action === "chat") {
    console.log("收到请求:", request);

    chrome.storage.sync.get(['apiKey', 'apiUrl', 'model'], function(items) {
      const apiKey = items.apiKey;
      const apiUrl = items.apiUrl;
      const model = items.model || 'deepseek-ai/DeepSeek-V2-Chat';

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
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 10000
        })
      })
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', JSON.stringify([...response.headers]));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        console.log('Raw response text:', text);
        try {
          return JSON.parse(text);
        } catch (error) {
          console.error('JSON parsing error:', error);
          throw new Error('Invalid JSON response');
        }
      })
      .then(data => {
        console.log('Parsed API response data:', JSON.stringify(data, null, 2));
        if (data.error) {
          throw new Error(data.error.message || 'Unknown API error');
        }
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
          sendResponse({ result: data.choices[0].message.content });
        } else {
          throw new Error('Unexpected API response structure');
        }
      })
      .catch(error => {
        console.error('API request error:', error);
        sendResponse({ error: error.toString() });
      });
    });
    return true; // 保持消息通道开放
  }
});