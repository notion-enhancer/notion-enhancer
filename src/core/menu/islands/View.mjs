/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

function View({ id }, ...children) {
  const { html, setState, useState } = globalThis.__enhancerApi,
    // set padding on last child to maintain pad on overflow
    $view = html`<article
      id=${id}
      class="notion-enhancer--menu-view min-h-full w-full
      absolute px-[60px] py-[36px] min-w-[580px]"
    >
      ${children}
    </article>`;

  useState(["view"], ([view = "welcome"]) => {
    const [transition] = useState(["transition"]),
      isVisible = $view.style.display !== "none",
      nowActive = view.toLowerCase() === id.toLowerCase();

    switch (transition) {
      case "fade": {
        const duration = 100,
          cssTransition = `opacity ${duration}ms`;
        if (isVisible && !nowActive) {
          $view.parentElement.style.overflow = "hidden";
          requestAnimationFrame(() => {
            $view.style.transition = cssTransition;
            $view.style.opacity = "0";
            setTimeout(() => ($view.style.display = "none"), duration);
          });
        } else if (!isVisible && nowActive) {
          setTimeout(() => {
            $view.style.opacity = "0";
            $view.style.display = "";
            requestAnimationFrame(() => {
              $view.style.transition = cssTransition;
              $view.style.opacity = "1";
              $view.parentElement.style.overflow = "";
            });
          }, duration);
        }
        break;
      }

      case "slide-to-left":
      case "slide-to-right": {
        const duration = 200,
          cssTransition = `opacity ${duration}ms, transform ${duration}ms`;
        if (isVisible && !nowActive) {
          $view.parentElement.style.overflow = "hidden";
          requestAnimationFrame(() => {
            $view.style.transition = cssTransition;
            $view.style.transform = `translateX(${
              transition === "slide-to-right" ? "-100%" : "100%"
            })`;
            $view.style.opacity = "0";
            setTimeout(() => {
              $view.style.display = "none";
              $view.style.transform = "";
            }, duration);
          });
        } else if (!isVisible && nowActive) {
          $view.style.transform = `translateX(${
            transition === "slide-to-right" ? "100%" : "-100%"
          })`;
          $view.style.opacity = "0";
          $view.style.display = "";
          requestAnimationFrame(() => {
            $view.style.transition = cssTransition;
            $view.style.transform = "";
            $view.style.opacity = "1";
            setTimeout(() => {
              $view.parentElement.style.overflow = "";
            }, duration);
          });
        }
        break;
      }

      default:
        $view.style.transition = "";
        $view.style.opacity = nowActive ? "1" : "0";
        $view.style.display = nowActive ? "" : "none";
    }
  });
  return $view;
}

export { View };
