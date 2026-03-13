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
  const startEngine = (targetData) => {
    log('AIAR-T: Starting OSS Engine...');

    // Register modules to link chunks to physical files
    XR8.addModule('image', {filename: 'xr-image.js'});
    XR8.addModule('slam', {filename: 'xr-slam.js'});
    log('AR Modules registered: image, slam');
    
    // XrControllerの設定を注入
    // 注意: imageTargets は非推奨のため imageTargetData を使用
    XR8.XrController.configure({
      imageTargetData: [targetData]
    });
    log('XR8.XrController.configure completed.');
  };

  async function init() {
    log('[8thwall.org] Initializing App...');
    
    try {
      // 1. Target JSON 読み込みを優先 (順序保証)
      log('Fetching Target JSON...');
      const response = await fetch('/targets/logo.json');
      if (!response.ok) throw new Error('Target JSON not found');
      const targetData = await response.json();
      log('Target JSON Data Loaded (OSS)');

      // 2. エンジン読み込み待機
      if (!window.XR8) {
        log('Waiting for XR8...');
        await new Promise(resolve => window.addEventListener('xrloaded', resolve, {once: true}));
      }
      log('XR8 Ready.');

      // 3. A-Frame Sceneにコンポーネントを追加して起動をトリガー
      const scene = document.querySelector('a-scene');
      
      // エンジン開始直前に設定
      startEngine(targetData);

      // xrwebコンポーネントを動的に追加してエンジンを起動
      scene.setAttribute('xrweb', 'disableWorldTracking: true; allowedDevices: any');
      log('Engine Started via xrweb component.');

    } catch (err) {
      log('Initialization Error: ' + err.message);
    }
  }

  init();

  window.addEventListener('keydown', (e) => {
    if (e.key === 't') fetchAndUpdateText(); // Debug manual update
  });

  window.fetchAndUpdateText = fetchAndUpdateText;
});
