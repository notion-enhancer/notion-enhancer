/*
 * view-scale
 * (c) 2020 SP12893678 (https://github.com/SP12893678)
 * under the MIT license
 */

'use strict';
const electron = require('electron');
const { createElement } = require('../../pkg/helpers.js');

module.exports = {
  id: 'e71ce1e0-024c-435e-a25e-7dd50448d1df',
  tags: ['extension'],
  name: 'view-scale',
  desc: 'scale the notion view',
  version: '1.0.0',
  author: 'SP12893678',
  options: [
    {
      key: 'showUI',
      label: 'show scale ui',
      type: 'toggle',
      value: true,
    },
    {
        key: 'canMouseWheel',
        label: 'use mouse wheel to scale',
        type: 'toggle',
        value: true,
    },
    {
        key: 'canHotkey',
        label: 'use keyboard hotkey to scale',
        type: 'toggle',
        value: true,
    },
    {
      key: 'offset',
      label: 'set scale plus and minus offset',
      type: 'input',
      value: 10,
    },
    {
        key: 'zoom',
        label: 'set scale default value',
        type: 'input',
        value: 100,
    }
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
        document.addEventListener('readystatechange', (event) => {
            if (document.readyState !== 'complete') return false;
            
            const attempt_interval = setInterval(enhance, 500);
            function enhance() {
                if (!document.querySelector('.notion-frame')) return;
                if (!document.querySelector('.notion-topbar-actions')) return;
                clearInterval(attempt_interval);

                electron.webFrame.setZoomFactor(store().zoom / 100) 
                let zoom = store().zoom / 100
                let offset = store().offset / 100
                let minZoom = 0.5
                let maxZoom = 2

                const $topBarActionShareMenu = document.querySelector('.notion-topbar-share-menu');
                const $scaleSet = createElement('<div class="notion-scale-contaienr"></div>');
                const $scalePlusButton = createElement('<div class="notion-scale-button">＋</div>');
                const $scaleView = createElement('<div class="notion-scale-view">100%</div>');
                const $scaleMinusButton = createElement('<div class="notion-scale-button">－</div>');

                if(store().showUI){
                    $scalePlusButton.addEventListener('click',()=>{
                        zoomPlus()
                        if(store().showUI) changeScaleViewUIValue()
                    })
                    $scaleMinusButton.addEventListener('click',()=>{
                        zoomMinus()
                        if(store().showUI) changeScaleViewUIValue()
                    })
    
                    $scaleSet.append($scalePlusButton)
                    $scaleSet.append($scaleView)
                    $scaleSet.append($scaleMinusButton)
                    
                    $topBarActionShareMenu.before($scaleSet);

                    changeScaleViewUIValue()
                }
                if(store().canMouseWheel){
                    document.defaultView.addEventListener('wheel', (event)=>{
                        if (event.ctrlKey && event.deltaY < 0){
                            zoomPlus()
                            if(store().showUI) changeScaleViewUIValue()
                        }
    
                        if (event.ctrlKey && event.deltaY > 0){
                            zoomMinus()
                            if(store().showUI) changeScaleViewUIValue()
                        }
                    });
                }

                if(store().canHotkey){
                    document.defaultView.addEventListener('keydown', (event) => {
                        if (event.key == '+' && event.ctrlKey){
                            zoomPlus()
                            if(store().showUI) changeScaleViewUIValue()
                        }
                            
                        if (event.key == '-' && event.ctrlKey){
                            zoomMinus()
                            if(store().showUI) changeScaleViewUIValue()
                        }
                    })
                }
                
                const observer = new MutationObserver((list, observer) => {
                    electron.webFrame.setZoomFactor(zoom)
                    if(store().showUI) changeScaleViewUIValue()
                });

                observer.observe(document.querySelector('.notion-frame'), {
                    childList: true
                });

                function zoomPlus() {
                    if(zoom + offset > maxZoom) return
                    zoom += offset
                    electron.webFrame.setZoomFactor(zoom)
                }
        
                function zoomMinus() {
                    if(zoom + offset < minZoom) return
                    zoom -= offset
                    electron.webFrame.setZoomFactor(zoom)    
                }

                function changeScaleViewUIValue() {
                    $scaleView.innerHTML = Math.round(zoom * 100) + "%"
                }
            }
        })
    },
  },
};
