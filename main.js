/**
 * main.js - 8thwall.org Image Target Logic
 */
window.addEventListener('DOMContentLoaded', () => {
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
  log('main.js starting...');

  const API_ENDPOINT = './config.json';
  let configData = null;

  async function fetchAndUpdateText() {
    try {
      const resp = await fetch(API_ENDPOINT);
      configData = await resp.json();
      log('Dynamic Config Loaded: ' + JSON.stringify(configData));
      
      const textEntity = document.querySelector('#lab-text');
      if (textEntity && configData.text) {
        textEntity.setAttribute('text', 'value', configData.text);
      }
    } catch (e) {
      log('Config Fetch Error: ' + e.message);
    }
  }

  // A-Frame Component for Image Target events
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

  // OSS版 8th WallエンジンのHook
  const onxrloaded = () => {
    log('AIAR-T: Initializing OSS Engine Hook...');
    
    // CLIで生成したJSONを読み込んで注入
    fetch('/targets/logo.json')
      .then(response => {
        if (!response.ok) throw new Error('Target JSON not found');
        return response.json();
      })
      .then(targetData => {
        log('Target JSON Data Loaded (OSS Inject)');
        
        // 2026年2月以降のOSS版パターン: 直接注入
        XR8.XrController.configure({
          imageTargets: [targetData]
        });
        log('XR8.XrController.configure completed.');
      })
      .catch(err => {
        log('Error loading target JSON: ' + err.message);
      });
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 't') fetchAndUpdateText(); // Debug manual update
  });

  log('[8thwall.org] Initializing...');
  // 8th Wallのロード完了を待機
  if (window.XR8) {
    onxrloaded()
  } else {
    window.addEventListener('xrloaded', onxrloaded)
  }
  
  window.fetchAndUpdateText = fetchAndUpdateText;
});
