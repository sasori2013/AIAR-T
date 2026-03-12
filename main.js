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
 * AFRAME Component: AIAR-T Target Handler
 * OSS版では注入したデータとA-Frameエンティティの紐付けを手動で行います
 */
AFRAME.registerComponent('xr-target-handler', {
  init: function() {
    this.el.addEventListener('xrimagefound', (e) => {
      log('[OSS] Target Found: ' + e.detail.name);
      if (e.detail.name === 'logo-target') {
        fetchAndUpdateText();
      }
    });
    this.el.addEventListener('xrimagelost', (e) => {
      log('[OSS] Target Lost: ' + e.detail.name);
    });
  }
});

/**
 * AIAR-T: 手動でのターゲットデータ注入 (2026 OSS Pattern)
 */
const onxrloaded = () => {
  log('AIAR-T: Initializing OSS Engine Hook...');
  
  // CLIで生成したJSONを読み込んで注入
  fetch('/targets/logo.json')
    .then(response => {
      if (!response.ok) throw new Error('Target JSON not found');
      return response.json();
    })
    .then(targetData => {
      XR8.XrController.configure({
        imageTargetData: [
          {
            name: 'logo-target', // A-Frame側のnameと一致させる
            metadata: targetData
          }
        ]
      });
      log('AIAR-T: Image Target Data Injected.');
    })
    .catch(err => log('AIAR-T Error: ' + err));

  // Additional session status logs
  window.addEventListener('xrprojectconfigloaded', () => log('[OSS] Project Config Loaded'));
  window.addEventListener('xrsessionstarted', () => log('[OSS] Session Started'));
};

window.addEventListener('keydown', (e) => {
  if (e.key === 't') fetchAndUpdateText(); // Debug manual update
});

window.addEventListener('DOMContentLoaded', () => {
  log('[8thwall.org] DOM Content Loaded');
  // 8th Wall OSS Initialization
  window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded);
});

window.fetchAndUpdateText = fetchAndUpdateText;


