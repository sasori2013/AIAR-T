/**
 * main.js - 8thwall.org Image Target Logic
 */
const debugPanel = document.createElement('div');
debugPanel.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100px;background:rgba(0,0,0,0.8);color:#0f0;font-size:10px;overflow:auto;z-index:10000;pointer-events:none;';
document.body.appendChild(debugPanel);

const log = (msg) => {
  const p = document.createElement('p');
  p.style.margin = '2px';
  p.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
  debugPanel.prepend(p);
  console.log(msg);
};

window.onerror = (msg, url, line) => log(`ERR: ${msg} @ ${line}`);
log('main.js loading...');


const API_ENDPOINT = './config.json';

/**
 * Fetch dynamic text from JSON and update the A-Frame entity
 */
async function fetchAndUpdateText() {
  const textEntity = document.querySelector('#lab-text');
  
  try {
    log('Fetching dynamic data via 8thwall.org hook...');
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data && data.text) {
      log('Updating text to: ' + data.text);
      textEntity.setAttribute('text', 'value', data.text);
    }
  } catch (error) {
    log('Fetch failed: ' + error);
  }
}

/**
 * Initialize 8thwall.org Image Target tracking events
 */
const initAR = () => {
  // 8thwall.org specific event names (matching OSS spec)
  const onImageFound = (event) => {
    const {name} = event.detail;
    log(`[8thwall.org] Found Target: ${name}`);
    if (name === 'logo-target') {
      fetchAndUpdateText();
    }
  };

  const onImageLost = (event) => {
    log(`[8thwall.org] Lost Target: ${event.detail.name}`);
  };

// OSS version events are dispatched to the window or scene
  window.addEventListener('xrimagefound', onImageFound);
  window.addEventListener('xrimagelost', onImageLost);

  // Debug: Listen for engine status
  window.addEventListener('xrprojectconfigloaded', () => log('[8thwall.org] Project Config Loaded'));
  window.addEventListener('xrsessionstarted', () => log('[8thwall.org] Session Started'));
};

window.addEventListener('keydown', (e) => {
  if (e.key === 't') fetchAndUpdateText(); // Debug manual update
});

window.addEventListener('DOMContentLoaded', () => {
  log('[8thwall.org] DOM Content Loaded');
  initAR();
});

window.fetchAndUpdateText = fetchAndUpdateText;

