/*
 * scroll-to-top
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

"use strict";

const { createElement } = require("../../pkg/helpers.js");

module.exports = {
    id: "0a958f5a-17c5-48b5-8713-16190cae1959",
    tags: ["extension"],
    name: "scroll-to-top",
    desc: "add a scroll to top button.",
    version: "1.0.0",
    author: "CloudHill",
    options: [
        {
            key: "smooth",
            label: "smooth scrolling",
            type: "toggle",
            value: true,
        },
        {
            key: "top",
            label: "scroll down distance to show button",
            type: "input",
            value: 100,
        },
    ],
    hacks: {
        "renderer/preload.js"(store, __exports) {
            document.addEventListener("readystatechange", (event) => {
                if (document.readyState !== "complete") return false;
                const attempt_interval = setInterval(enhance, 500);
                function enhance() {
                    if (!document.querySelector(".notion-frame")) return;
                    clearInterval(attempt_interval);
                    
                    const container = document.createElement('div');
                    const help = document.querySelector('.notion-help-button');
                    const scroll = createElement(
                        '<div class="notion-scroll-button" role="button">&#129049;</div>' // 🠙;
                    )
                    
                    container.className = "bottom-right-buttons";
                    help.after(container);
                    container.append(scroll);
                    container.append(help);
                    
                    scroll.addEventListener('click', () => {
                        document
                        .querySelector('.notion-frame > .notion-scroller')
                        .scroll({
                            top: 0,
                            left: 0,
                            behavior: store().smooth ? 'smooth' : 'auto',
                        });
                    })

                    let queue = [];
                    const observer = new MutationObserver((list, observer) => {
                    if (!queue.length) requestAnimationFrame(() => process(queue));
                        queue.push(...list);
                    });
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                    });
                    function process(list) {
                        queue = [];
                        for (let { addedNodes } of list) {
                            if (
                              addedNodes[0] && (
                                addedNodes[0].className === 'notion-page-content' ||
                                addedNodes[0].className === 'notion-scroller'
                              )
                            ) {
                                if (store().top> 0) {
                                    scroll.classList.add('hidden');
                                
                                    document
                                        .querySelector('.notion-frame > .notion-scroller')
                                        .addEventListener('scroll', (event) => {
                                            if (event.target.scrollTop < store().top)
                                                scroll.classList.add('hidden');
                                            else
                                                scroll.classList.remove('hidden');
                                        })
                                }
                            }
                        }
                    }
                }
            });
        }
    },
};
