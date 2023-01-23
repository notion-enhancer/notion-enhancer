/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { extendProps, useState } from "../state.mjs";

const updateHotkey = (event) => {
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
  },
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
  },
  readUpload = async (event) => {
    const file = event.target.files[0],
      reader = new FileReader();
    return new Promise((res) => {
      reader.onload = async (progress) => {
        const content = progress.currentTarget.result,
          upload = { filename: file.name, content };
        res(upload);
      };
      reader.readAsText(file);
    });
  };

function Input({
  type,
  icon,
  variant,
  extensions,
  class: className,
  _get,
  _set,
  ...props
}) {
  let $filename, $clear;
  const { html } = globalThis.__enhancerApi;
  Coloris({ format: "rgb" });

  type ??= "text";
  if (type === "text") icon ??= "text-cursor";
  if (type === "number") icon ??= "hash";
  if (type === "hotkey") icon ??= "command";
  if (type === "color") icon ??= "pipette";

  if (type === "file") {
    icon ??= "file-up";
    $filename = html`<span class="ml-[6px]">Upload a file</span>`;
    $clear = html`<button
      style="display: none"
      class="h-[14px] transition duration-[20ms]
      text-[color:var(--theme--fg-secondary)]
      hover:text-[color:var(--theme--fg-primary)]"
      onclick=${() => _set?.({ filename: "", content: "" })}
    >
      <i class="i-x w-[14px] h-[14px]"></i>
    </button>`;
    props.accept = extensions
      ?.map((ext) => (ext.startsWith(".") ? ext : `.${ext}`))
      .join(",");
  }

  const $input = html`<input
      type=${["hotkey", "color"].includes(type) ? "text" : type}
      class="h-full w-full pb-px text-[14px] leading-[1.2]
      ${variant === "lg" ? "pl-[12px] pr-[40px]" : "pl-[8px] pr-[32px]"}
      appearance-none bg-transparent ${type === "file" ? "hidden" : ""}
      ${type === "color" ? "font-medium" : ""}"
      data-coloris=${type === "color"}
      ...${props}
    />`,
    $icon = html`<span
      class="${variant === "lg" ? "pr-[12px]" : "pr-[8px]"}
      absolute flex items-center h-full pointer-events-none
      text-[color:var(--theme--fg-secondary)] right-0 top-0"
      ><i class="i-${icon} w-[16px] h-[16px]"></i>
    </span>`;

  extendProps($input, {
    onchange: (event) => {
      if (_set && type === "file") {
        readUpload(event).then(_set);
      } else _set?.($input.value);
    },
    onrerender: async () => {
      _get?.().then((value) => {
        value ??= "";
        if (type === "file") {
          $filename.innerText = value?.filename || "Upload a file";
          $clear.style.display = value?.filename ? "" : "none";
        } else if ($input.value !== value) $input.value = value;
        if (type === "color") updateContrast($input, $icon);
      });
    },
    onkeydown: type === "hotkey" ? updateHotkey : undefined,
    oninput: type === "color" ? () => _set?.($input.value) : undefined,
  });
  useState(["rerender"], () => $input.onrerender?.());

  return type === "file"
    ? html`<div
        class="notion-enhancer--menu-file-input shrink-0
        flex items-center gap-[8px] ${className ?? ""}"
      >
        <label
          tabindex="0"
          class="flex items-center cursor-pointer select-none
          h-[28px] px-[8px] bg-[color:var(--theme--bg-secondary)]
          text-([14px] [color:var(--theme--fg-secondary)]) rounded-[4px]
          transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
          >${$input}${$icon.children[0]}${$filename}
        </label>
        ${$clear}
      </div>`
    : html`<label
        class="notion-enhancer--menu-input 
        ${variant === "lg" ? "h-[32px]" : "h-[28px]"}
        relative overflow-hidden rounded-[4px] w-full inline-block
        focus-within:ring-(& [color:var(--theme--accent-primary)])
        ${className ?? ""} ${type === "color"
          ? "bg-([image:repeating-linear-gradient(45deg,#aaa_25%,transparent_25%,transparent_75%,#aaa_75%,#aaa),repeating-linear-gradient(45deg,#aaa_25%,#fff_25%,#fff_75%,#aaa_75%,#aaa)] [position:0_0,4px_4px] [size:8px_8px])"
          : "bg-[color:var(--theme--bg-hover)]"}"
        >${$input}${$icon}
      </label>`;
}

export { Input };
