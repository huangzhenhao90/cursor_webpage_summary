document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('optionsForm');
  const message = document.getElementById('message');

  // 加载保存的设置
  chrome.storage.sync.get(['apiKey', 'apiUrl', 'model'], function(items) {
    document.getElementById('apiKey').value = items.apiKey || '';
    document.getElementById('apiUrl').value = items.apiUrl || '';
    document.getElementById('model').value = items.model || 'deepseek-ai/DeepSeek-V2-Chat';
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const apiKey = document.getElementById('apiKey').value;
    const apiUrl = document.getElementById('apiUrl').value;
    const model = document.getElementById('model').value;

    chrome.storage.sync.set({
      apiKey: apiKey,
      apiUrl: apiUrl,
      model: model
    }, function() {
      message.textContent = '设置已保存';
      message.style.color = 'green';
      setTimeout(() => {
        message.textContent = '';
      }, 3000);
    });
  });
});