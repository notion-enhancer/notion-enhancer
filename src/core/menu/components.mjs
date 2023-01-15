/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState, getState } from "./state.mjs";

function Sidebar({}, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<aside
    class="notion-enhancer--menu-sidebar min-w-[224.14px] max-w-[250px]
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

function SidebarButton({ icon, ...props }, ...children) {
  const { html } = globalThis.__enhancerApi,
    iconSize = icon.startsWith("notion-enhancer")
      ? "w-[17px] h-[17px] ml-[1.5px] mr-[9.5px]"
      : "w-[18px] h-[18px] ml-px mr-[9px]",
    $el = html`<${props.href ? "a" : "button"}
      class="flex select-none cursor-pointer w-full
      items-center py-[5px] px-[15px] text-[14px] last:mb-[12px]
      transition hover:bg-[color:var(--theme--bg-hover)]"
      ...${props}
    >
      <i class="i-${icon} ${iconSize}"></i>
      <span class="leading-[20px]">${children}</span>
    <//>`;
  if (!props.href) {
    const id = $el.innerText;
    $el.onclick ??= () => setState({ transition: "fade", view: id });
    useState(["view"], ([view = "welcome"]) => {
      const active = view.toLowerCase() === id.toLowerCase();
      $el.style.background = active ? "var(--theme--bg-hover)" : "";
      $el.style.fontWeight = active ? "600" : "";
    });
  }
  return $el;
}

function View({ id }, ...children) {
  const { html } = globalThis.__enhancerApi,
    duration = 100,
    $el = html`<article
      id=${id}
      class="notion-enhancer--menu-view h-full
      grow overflow-y-auto px-[60px] py-[36px]"
    >
      ${children}
    </article>`;
  useState(["view"], ([view = "welcome"]) => {
    const [transition] = getState(["transition"]),
      isVisible = $el.style.display !== "none",
      nowActive = view.toLowerCase() === id.toLowerCase();
    if (transition === "fade") {
      $el.style.opacity = "0";
      $el.style.transition = `opacity ${duration}ms`;
      if (isVisible && !nowActive) {
        setTimeout(() => ($el.style.display = "none"), duration);
      } else if (!isVisible && nowActive) {
        setTimeout(() => {
          $el.style.display = "";
          requestIdleCallback(() => ($el.style.opacity = "1"));
        }, duration);
      }
    } else {
      $el.style.transition = "";
      $el.style.opacity = nowActive ? "1" : "0";
      $el.style.display = nowActive ? "" : "none";
    }
  });
  return $el;
}

function List({}, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<div class="flex flex-col gap-y-[14px]">${children}</div>`;
}

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
          duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
          onclick=${() => setState({ transition: "none", view: id })}
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
      <p
        class="text-[12px] leading-[16px] mb-[6px]
        text-[color:var(--theme--fg-secondary)]"
        innerHTML=${description}
      ></p>
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
        border-b border-b-[color:var(--theme--fg-border)]"
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
    ><div class="flex flex-col ${type === "text" ? "w-full" : "mr-[10%]"}">
      <h5 class="text-[14px] mb-[2px] mt-0">${label}</h5>
      ${type === "text" ? $input : ""}
      <p
        class="text-[12px] leading-[16px]
        text-[color:var(--theme--fg-secondary)]"
        innerHTML=${description}
      ></p>
    </div>
    ${type === "text" ? "" : $input}
  <//>`;
}

function TextInput({ _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      type="text"
      class="appearance-none text-[14px] leading-[1.2] rounded-[4px] pb-px
      h-[28px] w-full pl-[8px] pr-[30px] bg-[color:var(--theme--bg-hover)]"
      ...${props}
    />`;

  const { onchange } = $input;
  $input.onchange = (event) => {
    onchange?.(event);
    _set?.($input.value);
  };
  useState(["rerender"], () => {
    _get?.().then((value) => ($input.value = value));
  });

  return html`<label
    class="notion-enhancer--menu-text-input
    relative block w-full mt-[4px] mb-[8px]"
    >${$input}
    <i
      class="i-text-cursor pointer-events-none
      absolute right-[8px] top-[6px] w-[16px] h-[16px]
      text-[color:var(--theme--fg-secondary)]"
    ></i>
  </label>`;
}

function NumberInput({ _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      type="text"
      class="appearance-none text-[14px] leading-[1.2] rounded-[4px] pb-px
      h-[28px] w-full pl-[8px] pr-[32px] bg-[color:var(--theme--bg-hover)]"
      ...${props}
    />`;

  const { onchange } = $input;
  $input.onchange = (event) => {
    onchange?.(event);
    _set?.($input.value);
  };
  useState(["rerender"], () => {
    _get?.().then((value) => ($input.value = value));
  });

  return html`<label
    class="notion-enhancer--menu-number-input
    relative shrink-0 w-[192px]"
    >${$input}
    <i
      class="i-hash pointer-events-none
      absolute right-[8px] top-[6px] w-[16px] h-[16px]
      text-[color:var(--theme--fg-secondary)]"
    ></i>
  </label>`;
}

function HotkeyInput({ _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      type="text"
      class="appearance-none text-[14px] leading-[1.2] rounded-[4px] pb-px
      h-[28px] w-full pl-[8px] pr-[32px] bg-[color:var(--theme--bg-hover)]"
      ...${props}
    />`,
    updateHotkey = (event) => {
      event.preventDefault();
      const keys = [];
      for (const modifier of ["metaKey", "ctrlKey", "altKey", "shiftKey"]) {
        if (!event[modifier]) continue;
        const alias = modifier[0].toUpperCase() + modifier.slice(1, -3);
        keys.push(alias);
      }
      if (!keys.length && ["Backspace", "Delete"].includes(event.key)) {
        $input.value = "";
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
        $input.value = keys.join("+");
      }
      $input.dispatchEvent(new Event("input"));
      $input.dispatchEvent(new Event("change"));
    };

  const { onkeydown } = $input;
  $input.onkeydown = (event) => {
    updateHotkey(event);
    onkeydown?.(event);
    _set?.($input.value);
  };
  useState(["rerender"], () => {
    _get?.().then((value) => ($input.value = value));
  });

  return html`<label
    class="notion-enhancer--menu-hotkey-input
    relative shrink-0 w-[192px]"
    >${$input}
    <i
      class="i-command pointer-events-none
      absolute right-[8px] top-[6px] w-[16px] h-[16px]
      text-[color:var(--theme--fg-secondary)]"
    ></i>
  </label>`;
}

function ColorInput({ _get, _set, ...props }) {
  Coloris({ format: "rgb" });
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      type="text"
      class="appearance-none text-[14px] leading-[1.2]
      h-[28px] w-full pl-[8px] pr-[32px] pb-px"
      data-coloris
      ...${props}
    />`,
    $icon = html`<i
      class="i-pipette pointer-events-none absolute opacity-70
      right-[8px] top-[6px] w-[16px] h-[16px] text-current"
    ></i>`,
    updateContrast = () => {
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
    };

  const { oninput } = $input;
  $input.oninput = (event) => {
    oninput?.(event);
    _set?.($input.value);
    updateContrast();
  };
  useState(["rerender"], () => {
    _get?.().then((value) => {
      $input.value = value;
      updateContrast();
    });
  });

  return html`<label
    class="notion-enhancer--menu-color-input shrink-0
    relative overflow-hidden rounded-[4px] w-[192px] bg-(
      [image:repeating-linear-gradient(45deg,#aaa_25%,transparent_25%,transparent_75%,#aaa_75%,#aaa),repeating-linear-gradient(45deg,#aaa_25%,#fff_25%,#fff_75%,#aaa_75%,#aaa)]
      [position:0_0,4px_4px]
      [size:8px_8px]
    )"
    >${$input}${$icon}
  </label>`;
}

function FileInput({ extensions, _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $filename = html`<span>Upload a file</span>`,
    $clear = html`<button
      class="ml-[8px] h-[14px] cursor-pointer text-[color:var(--theme--fg-secondary)]
      transition duration-[20ms] hover:text-[color:var(--theme--fg-primary)] flex"
      style="display: none"
      onclick=${() => {
        $filename.innerText = "Upload a file";
        $clear.style.display = "none";
        _set?.({ filename: "", content: "" });
      }}
    >
      <i class="i-x w-[14px] h-[14px]"></i>
    </button>`;

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
    class="notion-enhancer--menu-file-input shrink-0 flex items-center"
  >
    <label
      tabindex="0"
      class="flex items-center cursor-pointer select-none
      h-[28px] text-[14px] leading-[1.2] px-[8px] rounded-[4px]
      text-[color:var(--theme--fg-secondary)] bg-[color:var(--theme--bg-secondary)] 
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
    $popup = html`<div
      class="group absolute top-0 left-0
      flex flex-col justify-center items-end
      pointer-events-none w-full h-full"
    >
      <div class="relative right-[100%]">
        <div
          class="bg-[color:var(--theme--bg-secondary)]
          w-[250px] max-w-[calc(100vw-24px)] max-h-[70vh]
          py-[6px] px-[4px] drop-shadow-xl overflow-y-auto
          transition duration-[200ms] opacity-0 scale-95 rounded-[4px]
          group-open:(pointer-events-auto opacity-100 scale-100)"
        >
          ${values.map((value) => {
            return html`<${SelectOption} ...${{ value, _get, _set }} />`;
          })}
        </div>
      </div>
    </div>`;

  const { onclick } = $select;
  $select.onclick = (event) => {
    onclick?.(event);
    $popup.setAttribute("open", true);
    setState({ popupOpen: true });
  };
  useState(["rerender"], () => {
    _get?.().then((value) => {
      if ($popup.hasAttribute("open")) {
        $popup.removeAttribute("open");
        $select.style.width = `${$select.offsetWidth}px`;
        $select.style.background = "transparent";
        $select.innerText = value;
        setTimeout(() => {
          $select.style.width = "";
          $select.style.background = "";
          setState({ popupOpen: false });
        }, 200);
      } else $select.innerText = value;
    });
  });
  document.addEventListener("click", (event) => {
    if (!$popup.hasAttribute("open")) return;
    if ($popup.contains(event.target) || event.target === $select) return;
    _set?.($select.innerText);
  });

  return html`<div class="notion-enhancer--menu-select relative">
    ${$select}${$popup}
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
      role="button"
      tabindex="0"
      class="select-none cursor-pointer rounded-[3px]
      flex items-center w-full h-[28px] px-[12px] leading-[1.2]
      transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
      ...${props}
    >
      <div class="mr-[6px] text-[14px] text-ellipsis overflow-hidden">
        ${value}
      </div>
    </div>`;

  const { onclick } = $option;
  $option.onclick = (event) => {
    onclick?.(event);
    _set?.(value);
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
      tabindex="-1"
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

export {
  Sidebar,
  SidebarSection,
  SidebarButton,
  View,
  List,
  Mod,
  Option,
  TextInput,
  NumberInput,
  HotkeyInput,
  ColorInput,
  FileInput,
  Select,
  Toggle,
};
