const READ_URL = 'ws://127.0.0.1:9000';
const LIST_SIZE = 100;
const olNew = document.querySelector('ol.new');
const olOld = document.querySelector('ol.old');

const display = async (data, ol) => {
  data = JSON.parse(data.replace(/\[\{/, '$1 [{'));
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = data.title;
      a.href = data.meta.uri;
      li.append(a);
      if (ol.children.length === LIST_SIZE) {
        ol.firstChild.remove();
      }
      ol.append(li);
      return resolve();
    }, 500);
  });
};

(async () => {
  if (!('WebSocketStream' in window)) {
    const li = document.createElement('li');
    li.textContent = '😔 The WebSocketStream API is not supported in your browser.';
    olNew.append(li);
    return;
  }
  const readWSS = new WebSocketStream(`${READ_URL}?stream=${Math.random()}&transport=websocket`);  
  const {readable} = await readWSS.connection;      
  const reader = readable.getReader();
  // When `readWSS` closes, also close `writeWSS`
  readWSS.closed.then((err) => {    
    console.error('reader closed', err.code, err.reason);
  });

  while (true) {
    const {value, done} = await reader.read();    
    if (done) {
      break;
    }    
    await display(value, olNew);      
  }    
})();
