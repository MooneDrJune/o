const READ_URL = 'ws://127.0.0.1:9000';
const WRITE_URL = 'wss://echo.websocket.events/';

const LIST_SIZE = 25;
const olNew = document.querySelector('ol.new');
const olOld = document.querySelector('ol.old');

const display = async (data, ol) => {
  if (!data.startsWith('42[')) {
    return Promise.resolve();
  }
  data = JSON.parse(data.replace(/^42\[(.*?)\]$/, '$1'));
  if (!data?.meta?.uri) {
    return Promise.resolve();      
  }
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
  
  const writeWSS = new WebSocketStream(`${WRITE_URL}?stream=${Math.random()}`);
  const {writable} = await writeWSS.connection;  
  const writer = writable.getWriter();

  // When `readWSS` closes, also close `writeWSS`
  readWSS.closed.then((err) => {    
    writeWSS.close({code: 1000, reason: 'Corresponding reader got closed'});
    console.error('reader closed', err.code, err.reason);
  });
  
  // When `writeWSS` closes, also close `readWSS`
  writeWSS.closed.then((err) => {    
    readWSS.close({code: 1000, reason: 'Corresponding writer got closed'});
    console.error('writer closed', err.code, err.reason);
  });
  
  while (true) {
    const {value, done} = await reader.read();    
    if (done) {
      break;
    }    
    // This function is artificially slowed down.
    await display(value, olNew);    
    try {            
      // Awaiting applies backpressure
      await writer.write(value);      
    } catch (err) {
      console.error('write error', err.name, err.message);
      writeWSS.close({code: 1000, reason: 'write error'});
    }    
  }    
})();

(async () => {
  const readWSS = new WebSocket(`${READ_URL}?regular=${Math.random()}&transport=websocket`);
    
  const writeWSS = new WebSocket(`${WRITE_URL}?regular=${Math.random()}`);
  
  // When `readWSS` closes, also close `writeWSS`
  readWSS.onclose = (err) => {    
    writeWSS.close(1000, 'Corresponding reader got closed');
    console.error('reader closed', err.code, err.reason);
  };
  
  // When `writeWSS` closes, also close `readWSS`
  writeWSS.onclose = (err) => {    
    readWSS.close(1000, 'Corresponding writer got closed');
    console.error('writer closed', err.code, err.reason);
  };
  
  writeWSS.onopen = () => {
    readWSS.onmessage = async (ev) => {
      const value = ev.data;
      // This function is artificially slowed down.    
      await display(value, olOld);        
      try {
        writeWSS.send(value);  
      } catch (err) {
        console.error('write error', err.name, err.message);
        writeWSS.close(1000, 'write error');
      }
    };
  };  
})();
