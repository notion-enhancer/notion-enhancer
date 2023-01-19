/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState, getState } from "./state.mjs";

// generic

function _Button(
  { type, size, variant, icon, class: cls = "", ...props },
  ...children
) {
  const { html } = globalThis.__enhancerApi,
    iconSize =
      size === "sm" && children.length
        ? "w-[14px] h-[14px]"
        : "w-[18px] h-[18px]";
  return html`<${type}
    class="flex gap-[8px] items-center px-[12px] shrink-0
    rounded-[4px] ${size === "sm" ? "h-[28px]" : "h-[32px]"}
    transition duration-[20ms] ${variant === "primary"
      ? `text-[color:var(--theme--accent-primary\\_contrast)]
      font-medium bg-[color:var(--theme--accent-primary)]
      hover:bg-[color:var(--theme--accent-primary\\_hover)]`
      : variant === "secondary"
      ? `text-[color:var(--theme--accent-secondary)]
      border-(& [color:var(--theme--accent-secondary)])
      hover:bg-[color:var(--theme--accent-secondary\\_hover)]`
      : `border-(& [color:var(--theme--fg-border)])
      hover:bg-[color:var(--theme--bg-hover)]`} ${cls}"
    ...${props}
  >
    ${icon ? html`<i class="i-${icon} ${iconSize}"></i>` : ""}
    <span class="text-[${size === "sm" ? "13" : "14"}px] empty:hidden">
      ${children}
    </span>
  <//>`;
}

function Button(props, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<${_Button} type="button" ...${props}>${children}<//>`;
}

function Label(props, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<${_Button} type="label" ...${props}>${children}<//>`;
}

function Description({ class: cls = "", ...props }, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<p
    class="notion-enhancer--menu-description leading-[16px]
    text-([12px] [color:var(--theme--fg-secondary)]) ${cls}"
    ...${props}
  >
    ${children}
  </p>`;
}

function Icon({ icon, ...props }) {
  const { html } = globalThis.__enhancerApi;
  return html`<button
    class="h-[14px] transition duration-[20ms]
    text-[color:var(--theme--fg-secondary)]
    hover:text-[color:var(--theme--fg-primary)]"
    ...${props}
  >
    <i class="i-${icon} w-[14px] h-[14px]"></i>
  </button>`;
}

// layout

function Sidebar({}, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<aside
    class="notion-enhancer--menu-sidebar z-10 row-span-1
    h-full overflow-y-auto bg-[color:var(--theme--bg-secondary)]"
  >
    ${children}
  </aside>`;
}

function SidebarSection({}, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<h2
    class="text-([11px] [color:var(--theme--fg-secondary)])
    py-[5px] px-[15px] mb-px mt-[18px] first:mt-[10px]
    uppercase font-medium tracking-[0.03em] leading-none"
  >
    ${children}
  </h2>`;
}

function SidebarButton({ id, icon, ...props }, ...children) {
  const { html } = globalThis.__enhancerApi,
    $icon = icon
      ? html`<i
          class="i-${icon} ${icon.startsWith("notion-enhancer")
            ? "w-[17px] h-[17px] ml-[1.5px] mr-[9.5px]"
            : "w-[18px] h-[18px] ml-px mr-[9px]"}"
        ></i>`
      : "",
    $el = html`<${props.href ? "a" : "button"}
      class="flex select-none cursor-pointer w-full
      items-center py-[5px] px-[15px] text-[14px] last:mb-[12px]
      transition hover:bg-[color:var(--theme--bg-hover)]"
      ...${props}
      >${$icon}
      <span class="leading-[20px]">${children}</span>
    <//>`;
  if (!props.href) {
    $el.onclick ??= () => setState({ transition: "fade", view: id });
    useState(["view"], ([view = "welcome"]) => {
      const active = view.toLowerCase() === id.toLowerCase();
      $el.style.background = active ? "var(--theme--bg-hover)" : "";
      $el.style.fontWeight = active ? "600" : "";
    });
  }
  return $el;
}

function List({ id, description }, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<div class="flex flex-col gap-y-[14px]">
    <${Search} type=${id} items=${children} />
    <${Description} innerHTML=${description} />
    ${children}
  </div>`;
}

function Footer({}, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<div
    class="flex w-full px-[60px] py-[16px]
    border-t-(& [color:var(--theme--fg-border)])
    bg-[color:var(--theme--bg-primary)]"
  >
    ${children}
  </div>`;
}

function View({ id }, ...children) {
  const { html } = globalThis.__enhancerApi,
    $el = html`<article
      id=${id}
      class="notion-enhancer--menu-view h-full w-full
      absolute overflow-y-auto px-[60px] py-[36px]"
    >
      ${children}
    </article>`;
  useState(["view"], ([view = "welcome"]) => {
    const [transition] = getState(["transition"]),
      isVisible = $el.style.display !== "none",
      nowActive = view.toLowerCase() === id.toLowerCase();
    switch (transition) {
      case "fade": {
        const duration = 100,
          cssTransition = `opacity ${duration}ms`;
        if (isVisible && !nowActive) {
          $el.style.transition = cssTransition;
          $el.style.opacity = "0";
          setTimeout(() => ($el.style.display = "none"), duration);
        } else if (!isVisible && nowActive) {
          setTimeout(() => {
            $el.style.opacity = "0";
            $el.style.display = "";
            requestIdleCallback(() => {
              $el.style.transition = cssTransition;
              $el.style.opacity = "1";
            });
          }, duration);
        }
        break;
      }
      case "slide-to-left":
      case "slide-to-right": {
        const duration = 200,
          cssTransition = `opacity ${duration}ms, transform ${duration}ms`,
          transformOut = `translateX(${
            transition === "slide-to-right" ? "-100%" : "100%"
          })`,
          transformIn = `translateX(${
            transition === "slide-to-right" ? "100%" : "-100%"
          })`;
        if (isVisible && !nowActive) {
          $el.style.transition = cssTransition;
          $el.style.transform = transformOut;
          $el.style.opacity = "0";
          setTimeout(() => {
            $el.style.display = "none";
            $el.style.transform = "";
          }, duration);
        } else if (!isVisible && nowActive) {
          $el.style.transform = transformIn;
          $el.style.opacity = "0";
          $el.style.display = "";
          requestIdleCallback(() => {
            $el.style.transition = cssTransition;
            $el.style.transform = "";
            $el.style.opacity = "1";
          });
        }
        break;
      }
      default:
        $el.style.transition = "";
        $el.style.opacity = nowActive ? "1" : "0";
        $el.style.display = nowActive ? "" : "none";
    }
  });
  return $el;
}

function Popup(
  { for: $trigger, onopen, onclose, onbeforeclose, ...props },
  ...children
) {
  const { html } = globalThis.__enhancerApi,
    $popup = html`<div
      class="notion-enhancer--menu-popup
      group absolute top-0 left-0 w-full h-full
      flex flex-col justify-center items-end
      pointer-events-none z-20"
      ...${props}
    >
      <div class="relative right-[100%]">
        <div
          class="bg-[color:var(--theme--bg-secondary)]
          w-[250px] max-w-[calc(100vw-24px)] max-h-[70vh]
          py-[6px] px-[4px] drop-shadow-xl overflow-y-auto
          transition duration-[200ms] opacity-0 scale-95 rounded-[4px]
          group-open:(pointer-events-auto opacity-100 scale-100)"
        >
          ${children}
        </div>
      </div>
    </div>`;

  const { onclick, onkeydown } = $trigger,
    enableTabbing = () => {
      $popup
        .querySelectorAll("[tabindex]")
        .forEach(($el) => ($el.tabIndex = 0));
    },
    disableTabbing = () => {
      $popup
        .querySelectorAll("[tabindex]")
        .forEach(($el) => ($el.tabIndex = -1));
    },
    openPopup = () => {
      $popup.setAttribute("open", true);
      enableTabbing();
      onopen?.();
      setState({ popupOpen: true });
    },
    closePopup = () => {
      $popup.removeAttribute("open");
      disableTabbing();
      onbeforeclose?.();
      setTimeout(() => {
        onclose?.();
        setState({ popupOpen: false });
      }, 200);
    };
  disableTabbing();
  $trigger.onclick = (event) => {
    onclick?.(event);
    openPopup();
  };
  $trigger.onkeydown = (event) => {
    onkeydown?.(event);
    if (event.key === "Enter") openPopup();
  };
  useState(["rerender"], () => {
    if ($popup.hasAttribute("open")) closePopup();
  });
  document.addEventListener("click", (event) => {
    if (!$popup.hasAttribute("open")) return;
    if ($popup.contains(event.target) || $popup === event.target) return;
    if ($trigger.contains(event.target) || $trigger === event.target) return;
    closePopup();
  });

  return $popup;
}

// input

function Input({
  size,
  icon,
  transparent,
  onrerender,
  class: cls = "",
  ...props
}) {
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      class="${size === "lg"
        ? "h-[36px] pl-[12px] pr-[40px]"
        : "h-[28px] pl-[8px] pr-[32px]"}
      w-full pb-px text-[14px] leading-[1.2]
      appearance-none bg-transparent"
      ...${props}
    />`,
    $icon = html`<i
      class="i-${icon} absolute w-[16px] h-[16px] pointer-events-none
      ${size === "lg" ? "right-[12px] top-[10px]" : "right-[8px] top-[6px]"}
      text-[color:var(--theme--fg-secondary)]"
    ></i>`;
  useState(["rerender"], () => onrerender?.($input, $icon));
  return html`<label
    focus=${() => $input.focus()}
    class="notion-enhancer--menu-input
    relative overflow-hidden rounded-[4px]
    focus-within:ring-(& [color:var(--theme--accent-primary)])
    ${size === "lg" ? "h-[36px] block w-full" : ""}
    ${size === "md" ? "h-[28px] block w-full" : ""}
    ${size === "sm" ? "h-[28px] shrink-0 w-[192px]" : ""}
    bg-${transparent
      ? `([image:repeating-linear-gradient(45deg,#aaa_25%,transparent_25%,transparent_75%,#aaa_75%,#aaa),repeating-linear-gradient(45deg,#aaa_25%,#fff_25%,#fff_75%,#aaa_75%,#aaa)]
         [position:0_0,4px_4px] [size:8px_8px])`
      : "[color:var(--theme--bg-hover)]"} ${cls}"
    >${$input}${$icon}
  </label>`;
}

function TextInput({ _get, _set, onchange, ...props }) {
  const { html } = globalThis.__enhancerApi;
  return html`<${Input}
    size="md"
    type="text"
    icon="text-cursor"
    class="mt-[4px] mb-[8px]"
    onchange=${(event) => {
      onchange?.(event);
      _set?.(event.target.value);
    }}
    onrerender=${($input) => {
      _get?.().then((value) => ($input.value = value));
    }}
    ...${props}
  />`;
}

function NumberInput({ _get, _set, onchange, ...props }) {
  const { html } = globalThis.__enhancerApi;
  return html`<${Input}
    size="sm"
    type="number"
    icon="hash"
    onchange=${(event) => {
      onchange?.(event);
      _set?.(event.target.value);
    }}
    onrerender=${($input) => {
      _get?.().then((value) => ($input.value = value));
    }}
    ...${props}
  />`;
}

function HotkeyInput({ _get, _set, onkeydown, ...props }) {
  const { html } = globalThis.__enhancerApi,
    updateHotkey = (event) => {
      event.preventDefault();
      const keys = [];
      for (const modifier of ["metaKey", "ctrlKey", "altKey", "shiftKey"]) {
        if (!event[modifier]) continue;
        const alias = modifier[0].toUpperCase() + modifier.slice(1, -3);
        keys.push(alias);
      }
      if (!keys.length && ["Backspace", "Delete"].includes(event.key)) {
        event.target.value = "";
      } else if (event.key) {
        let key = event.key;
        if (key === " ") key = "Space";
        if (["+", "="].includes(key)) key = "Plus";
        if (key === "-") key = "Minus";
        if (event.code === "Comma") key = ",";
        if (event.code === "Period") key = ".";
        if (key === "Control") key = "Ctrl";
        // avoid e.g. Shift+Shift, force inclusion of non-modifier
        if (keys.includes(key)) return;
        keys.push(key.length === 1 ? key.toUpperCase() : key);
        event.target.value = keys.join("+");
      }
      event.target.dispatchEvent(new Event("input"));
      event.target.dispatchEvent(new Event("change"));
    };
  return html`<${Input}
    size="sm"
    type="text"
    icon="command"
    onkeydown=${(event) => {
      updateHotkey(event);
      onkeydown?.(event);
      _set?.(event.target.value);
    }}
    onrerender=${($input) => {
      _get?.().then((value) => ($input.value = value));
    }}
    ...${props}
  />`;
}

function ColorInput({ _get, _set, oninput, ...props }) {
  Coloris({ format: "rgb" });
  const { html } = globalThis.__enhancerApi,
    updateContrast = ($input, $icon) => {
      $input.style.background = $input.value;
      const [r, g, b, a = 1] = $input.value
        .replace(/^rgba?\(/, "")
        .replace(/\)$/, "")
        .split(",")
        .map((n) => parseFloat(n));
      if (a > 0.5) {
        // pick a contrasting foreground for an rgb background
        // using the percieved brightness constants from http://alienryderflex.com/hsp.html
        const brightness = 0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b);
        $input.style.color = Math.sqrt(brightness) > 165.75 ? "#000" : "#fff";
      } else $input.style.color = "#000";
      $icon.style.color = $input.style.color;
      $icon.style.opacity = "0.7";
    };
  return html`<${Input}
    transparent
    size="sm"
    type="text"
    icon="pipette"
    data-coloris
    oninput=${(event) => {
      oninput?.(event);
      _set?.(event.target.value);
    }}
    onrerender=${($input, $icon) => {
      _get?.().then((value) => {
        $input.value = value;
        updateContrast($input, $icon);
      });
    }}
    ...${props}
  />`;
}

function FileInput({ extensions, _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $filename = html`<span>Upload a file</span>`,
    $clear = html`<${Icon}
      icon="x"
      style="display: none"
      onclick=${() => {
        $filename.innerText = "Upload a file";
        $clear.style.display = "none";
        _set?.({ filename: "", content: "" });
      }}
    />`;

  const { onchange } = props;
  props.onchange = (event) => {
    const file = event.target.files[0],
      reader = new FileReader();
    reader.onload = async (progress) => {
      const content = progress.currentTarget.result,
        upload = { filename: file.name, content };
      $filename.innerText = file.name;
      $clear.style.display = "";
      _set?.(upload);
    };
    reader.readAsText(file);
    onchange?.(event);
  };
  useState(["rerender"], () => {
    _get?.().then((file) => {
      $filename.innerText = file?.filename || "Upload a file";
      $clear.style.display = file?.filename ? "" : "none";
    });
  });

  return html`<div
    class="notion-enhancer--menu-file-input
    shrink-0 flex items-center gap-[8px]"
  >
    <label
      tabindex="0"
      class="flex items-center cursor-pointer select-none
      h-[28px] px-[8px] bg-[color:var(--theme--bg-secondary)]
      text-([14px] [color:var(--theme--fg-secondary)]) rounded-[4px]
      transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
    >
      <input
        type="file"
        class="hidden"
        accept=${extensions
          ?.map((ext) => (ext.startsWith(".") ? ext : `.${ext}`))
          .join(",")}
        ...${props}
      />
      <i class="i-file-up w-[16px] h-[16px] mr-[6px]"></i>
      ${$filename}
    </label>
    ${$clear}
  </div>`;
}

function Select({ values, _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $select = html`<div
      dir="rtl"
      role="button"
      tabindex="0"
      class="appearance-none bg-transparent rounded-[4px] cursor-pointer
      text-[14px] leading-[28px] h-[28px] max-w-[256px] pl-[8px] pr-[28px]
      transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
      ...${props}
    ></div>`,
    $options = values.map((value) => {
      return html`<${SelectOption} ...${{ value, _get, _set }} />`;
    });
  useState(["rerender"], () => {
    _get?.().then((value) => ($select.innerText = value));
  });

  return html`<div class="notion-enhancer--menu-select relative">
    ${$select}
    <${Popup}
      for=${$select}
      onbeforeclose=${() => {
        $select.style.width = `${$select.offsetWidth}px`;
        $select.style.background = "transparent";
      }}
      onclose=${() => {
        $select.style.width = "";
        $select.style.background = "";
      }}
    >
      ${$options}
    <//>
    <i
      class="i-chevron-down pointer-events-none
      absolute right-[6px] top-[6px] w-[16px] h-[16px]
      text-[color:var(--theme--fg-secondary)]"
    ></i>
  </div>`;
}

function SelectOption({ value, _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $selected = html`<i class="ml-auto i-check w-[16px] h-[16px]"></i>`,
    $option = html`<div
      tabindex="0"
      role="button"
      class="select-none cursor-pointer rounded-[3px]
      flex items-center w-full h-[28px] px-[12px] leading-[1.2]
      transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
      ...${props}
    >
      <div class="mr-[6px] text-[14px] text-ellipsis overflow-hidden">
        ${value}
      </div>
    </div>`;

  const { onclick, onkeydown } = $option;
  $option.onclick = (event) => {
    onclick?.(event);
    _set?.(value);
  };
  $option.onkeydown = (event) => {
    onkeydown?.(event);
    if (event.key === "Enter") _set?.(value);
  };
  useState(["rerender"], () => {
    _get?.().then((actualValue) => {
      if (actualValue === value) {
        $option.append($selected);
      } else $selected.remove();
    });
  });

  return $option;
}

function Toggle({ _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      type="checkbox"
      class="hidden checked:sibling:children:(
      bg-[color:var(--theme--accent-primary)] after:translate-x-[12px])"
      ...${props}
    />`;

  const { onchange } = $input;
  $input.onchange = (event) => {
    onchange?.(event);
    _set?.($input.checked);
  };
  useState(["rerender"], () => {
    _get?.().then((checked) => ($input.checked = checked));
  });

  return html`<div class="notion-enhancer--menu-toggle shrink-0">
    ${$input}
    <div
      tabindex="0"
      class="w-[30px] h-[18px] rounded-[44px] cursor-pointer
      transition duration-200 bg-[color:var(--theme--bg-hover)]"
    >
      <div
        class="w-full h-full rounded-[44px] text-[12px]
        p-[2px] hover:bg-[color:var(--theme--bg-hover)]
        transition duration-200 after:(
          inline-block w-[14px] h-[14px] rounded-[44px]
          bg-[color:var(--theme--accent-primary\\_contrast)]
          transition duration-200
        )"
      ></div>
    </div>
  </div>`;
}

function Checkbox({ _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      type="checkbox"
      class="hidden checked:sibling:(px-[1px]
        bg-[color:var(--theme--accent-primary)])
        not-checked:sibling:(children:text-transparent
          border-(& [color:var(--theme--fg-primary)])
          hover:bg-[color:var(--theme--bg-hover)])"
      ...${props}
    />`;

  const { onchange } = $input;
  $input.onchange = (event) => {
    onchange?.(event);
    _set?.($input.checked);
  };
  useState(["rerender"], () => {
    _get?.().then((checked) => ($input.checked = checked));
  });

  return html`<label tabindex="0" class="cursor-pointer">
    ${$input}
    <div class="flex items-center h-[16px] transition duration-[200ms]">
      <i
        class="i-check w-[14px] h-[14px]
        text-[color:var(--theme--accent-primary\\_contrast)]"
      ></i>
    </div>
  </label>`;
}

function Search({ type, items, oninput, ...props }) {
  const { html, addKeyListener } = globalThis.__enhancerApi,
    $search = html`<${Input}
      size="lg"
      type="text"
      placeholder="Search ${items.length} ${items.length === 1
        ? type.replace(/s$/, "")
        : type} (Press '/' to focus)"
      icon="search"
      oninput=${(event) => {
        oninput?.(event);
        const query = event.target.value.toLowerCase();
        for (const $item of items) {
          const matches = $item.innerText.toLowerCase().includes(query);
          $item.style.display = matches ? "" : "none";
        }
      }}
      ...${props}
    />`;
  addKeyListener("/", (event) => {
    if (document.activeElement?.nodeName === "INPUT") return;
    // offsetParent == null if parent has "display: none;"
    if ($search.offsetParent) {
      event.preventDefault();
      $search.focus();
    }
  });
  return $search;
}

// representative

function Mod({
  id,
  name,
  version,
  description,
  thumbnail,
  tags = [],
  authors,
  options = [],
  _get,
  _set,
  _src,
}) {
  const { html, enhancerUrl } = globalThis.__enhancerApi,
    toggleId = Math.random().toString(36).slice(2, 5),
    $thumbnail = thumbnail
      ? html`<img
          src="${enhancerUrl(`${_src}/${thumbnail}`)}"
          class="rounded-[4px] mr-[12px] h-[74px] my-auto"
        />`
      : "",
    $options = options.length
      ? html`<button
          class="flex items-center p-[4px] rounded-[4px] transition
          text-[color:var(--theme--fg-secondary)] my-auto mr-[8px]
          duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]
          active:text-[color:var(--theme--fg-primary)]"
          onclick=${() => setState({ transition: "slide-to-right", view: id })}
        >
          <i class="i-settings w-[18px] h-[18px]"></i>
        </button>`
      : "";
  return html`<label
    for=${toggleId}
    class="notion-enhancer--menu-mod flex items-stretch rounded-[4px]
    bg-[color:var(--theme--bg-secondary)] w-full py-[18px] px-[16px]
    border border-[color:var(--theme--fg-border)] cursor-pointer
    transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
  >
    ${$thumbnail}
    <div class="flex flex-col max-w-[50%]">
      <div class="flex items-center text-[14px] mb-[5px]">
        <h3 class="my-0">${name}</h3>
        ${[`v${version}`, ...tags].map((tag) => {
          return html`<span
            class="text-([12px] [color:var(--theme--fg-secondary)])
            ml-[8px] py-[2px] px-[6px] leading-tight tracking-wide
            rounded-[3px] bg-[color:var(--theme--bg-hover)]"
          >
            ${tag}
          </span>`;
        })}
      </div>
      <${Description} class="mb-[6px]" innerHTML=${description} />
      <div class="mt-auto flex gap-x-[8px] text-[12px] leading-[16px]">
        ${authors.map((author) => {
          return html`<a href=${author.homepage} class="flex items-center">
            <img src=${author.avatar} alt="" class="h-[12px] rounded-full" />
            <span class="ml-[6px]">${author.name}</span>
          </a>`;
        })}
      </div>
    </div>
    <div class="flex ml-auto">
      ${$options}
      <div class="my-auto scale-[1.15]">
        <${Toggle} id=${toggleId} ...${{ _get, _set }} />
      </div>
    </div>
  </label>`;
}

function Option({ type, value, description, _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    camelToSentenceCase = (string) =>
      string[0].toUpperCase() +
      string.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`).slice(1);

  let $input;
  const label = props.label ?? camelToSentenceCase(props.key);
  switch (type) {
    case "heading":
      return html`<h4
        class="notion-enhancer--menu-heading font-semibold
        mb-[16px] mt-[48px] first:mt-0 pb-[12px] text-[16px]
        border-b-(& [color:var(--theme--fg-border)])"
      >
        ${label}
      </h4>`;
    case "text":
      $input = html`<${TextInput} ...${{ _get, _set }} />`;
      break;
    case "number":
      $input = html`<${NumberInput} ...${{ _get, _set }} />`;
      break;
    case "hotkey":
      $input = html`<${HotkeyInput} ...${{ _get, _set }} />`;
      break;
    case "color":
      $input = html`<${ColorInput} ...${{ _get, _set }} />`;
      break;
    case "file":
      $input = html`<${FileInput}
        extensions="${props.extensions}"
        ...${{ _get, _set }}
      />`;
      break;
    case "select":
      $input = html`<${Select} values=${props.values} ...${{ _get, _set }} />`;
      break;
    case "toggle":
      $input = html`<${Toggle} ...${{ _get, _set }} />`;
  }
  return html`<${type === "toggle" ? "label" : "div"}
    class="notion-enhancer--menu-option flex items-center justify-between
    mb-[18px] ${type === "toggle" ? "cursor-pointer" : ""}"
  >
    <div class="flex flex-col ${type === "text" ? "w-full" : "mr-[10%]"}">
      <h5 class="text-[14px] mb-[2px] mt-0">${label}</h5>
      ${type === "text" ? $input : ""}
      <${Description} innerHTML=${description} />
    </div>
    ${type === "text" ? "" : $input}
  <//>`;
}

function Profile({
  getName,
  setName,
  isActive,
  setActive,
  exportJson,
  importJson,
  deleteProfile,
  ...props
}) {
  const { html } = globalThis.__enhancerApi,
    uploadProfile = (event) => {
      const file = event.target.files[0],
        reader = new FileReader();
      reader.onload = async (progress) => {
        const res = progress.currentTarget.result;
        importJson(res);
      };
      reader.readAsText(file);
    },
    downloadProfile = async () => {
      const now = new Date(),
        year = now.getFullYear().toString(),
        month = (now.getMonth() + 1).toString().padStart(2, "0"),
        day = now.getDate().toString().padStart(2, "0"),
        hour = now.getHours().toString().padStart(2, "0"),
        min = now.getMinutes().toString().padStart(2, "0"),
        sec = now.getSeconds().toString().padStart(2, "0"),
        date = year + month + day + hour + min + sec;

      const $a = html`<a
        class="hidden"
        download="notion-enhancer_${await getName()}_${date}.json"
        href="data:text/json;charset=utf-8,${encodeURIComponent(
          await exportJson()
        )}"
      />`;
      document.body.append($a);
      $a.click();
      $a.remove();
    };

  const $delete = html`<${Icon} icon="x" />`,
    $name = html`<mark></mark>`,
    $confirmation = html`<${Popup}
      for=${$delete}
      onopen=${async () => ($name.innerText = await getName())}
    >
      <p class="text-[14px] pt-[2px] px-[8px]">
        Are you sure you want to delete the profile ${$name} permanently?
      </p>
      <div class="flex flex-col gap-[8px] pt-[8px] pb-[6px] px-[8px]">
        <${Button}
          tabindex="0"
          icon="trash"
          class="justify-center"
          variant="secondary"
          onclick=${() => deleteProfile()}
        >
          Delete
        <//>
        <${Button}
          tabindex="0"
          class="justify-center"
          onclick=${() => setState({ rerender: true })}
        >
          Cancel
        <//>
      </div>
    <//>`;

  return html`<li class="flex items-center my-[14px] gap-[8px]" ...${props}>
    <${Checkbox}
      ...${{ _get: isActive, _set: setActive }}
      onchange=${(event) => (event.target.checked = true)}
    />
    <${Input}
      size="md"
      type="text"
      icon="file-cog"
      onchange=${(event) => setName(event.target.value)}
      onrerender=${($input) =>
        getName().then((value) => ($input.value = value))}
    />
    <${Label} size="sm" icon="import">
      <input
        type="file"
        class="hidden"
        accept=".json"
        onchange=${uploadProfile}
      />
      Import
    <//>
    <${Button} size="sm" icon="upload" onclick=${downloadProfile}>Export<//>
    <div class="relative">${$delete}${$confirmation}</div>
  </li>`;
}

export {
  Button,
  Label,
  Description,
  Icon,
  Sidebar,
  SidebarSection,
  SidebarButton,
  List,
  Footer,
  View,
  Input,
  TextInput,
  NumberInput,
  HotkeyInput,
  ColorInput,
  FileInput,
  Select,
  Toggle,
  Checkbox,
  Search,
  Mod,
  Option,
  Profile,
};
