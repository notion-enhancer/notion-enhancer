function userscript() {
    /* Style Injecting */
    var fs = require("fs");
    let css = fs.readFileSync("full_path_to_custom_style"); //will be replaced in python patcher
    let head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style); 
    /* Style Injecting */

    /* Window Control Buttons */
    var buttonsIntervalId = window.setInterval(addButtonsOnLoad,100);
    function addButtonsOnLoad() {
        if(document.querySelector('div.notion-topbar > div') == undefined) {
            return;
        }
        var browserWindow = require('electron').remote.getCurrentWindow();
        var element = document.createElement("div");
        element.id = "window-buttons-area";
        var node = document.querySelector('div.notion-topbar > div');
        node.appendChild(element);

        node = document.querySelector("#window-buttons-area");

        /* AlwaysOnTop Button */
        element = document.createElement("button");
        element.classList.add("window-buttons");
        element.innerHTML = "&#129051;";
        element.onclick = function () { 
            if(!browserWindow.isAlwaysOnTop()) {
                browserWindow.setAlwaysOnTop(true);
                this.innerHTML = "&#129049;";
            } else {
                browserWindow.setAlwaysOnTop(false);
                this.innerHTML = "&#129051;";
            }
        };
        node.appendChild(element);
        /* AlwaysOnTop Button */

        /* Minimize Button */
        element = document.createElement("button");
        element.classList.add("window-buttons");
        element.innerHTML = "&#9866;";
        element.onclick = function () { browserWindow.minimize(); };
        node.appendChild(element);
        /* Minimize Button */

        /* Maximize Button */
        element = document.createElement("button");
        element.classList.add("window-buttons");
        element.innerHTML = "&#9634;";
        element.onclick = function () { 
            if (!browserWindow.isMaximized()) {
                browserWindow.maximize();          
            } else {
                browserWindow.unmaximize();
            } 
        };
        node.appendChild(element);
        /* Maximize Button */

        /* Close Button */
        const path = require("path")
        element = document.createElement("button");
        element.classList.add("window-buttons");
        element.innerHTML = "&#10761;";
        element.onclick = function () { 
            const Store = require(path.join(__dirname,'../','store.js'));
            const store = new Store({
             configName: "user-preferences",
             defaults: {
               CloseToTrayCheckbox: false
             }
            });
            var CloseToTrayCheckboxState = store.get("CloseToTrayCheckbox");
            if(CloseToTrayCheckboxState) {
               browserWindow.hide(); 
            } else {
               browserWindow.close(); 
            }
        };
        node.appendChild(element);
        /* Close Button */

        window.clearInterval(buttonsIntervalId);
    }
    /* Window Control Buttons */
}
require('electron').remote.getGlobal('setTimeout')(() => {  userscript();}, 100);