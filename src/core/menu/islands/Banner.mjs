/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "../state.mjs";

const rectToStyle = (rect) =>
  ["width", "height", "top", "bottom", "left", "right"]
    .filter((prop) => rect[prop])
    .map((prop) => `${prop}: ${rect[prop]};`)
    .join("");

function Star({ from, ...rect }) {
  const { html } = globalThis.__enhancerApi;
  return html`<svg
    viewBox="0 0 24 24"
    class="absolute fill-none skew-y-2${from
      ? ` hidden ${from}:inline-block`
      : ""}"
    xmlns="http://www.w3.org/2000/svg"
    style=${rectToStyle(rect)}
  >
    <path
      d="M11.3255 22.5826C11.3255 22.8897 11.5745 23.1387 11.8816 23.1387C12.1887 23.1387 12.4377 22.8897 12.4377 22.5826C12.4377 19.3351 13.2489 16.7277 14.8868 14.848C16.5218 12.9717 19.044 11.7477 22.6145 11.3906C22.9201 11.3601 23.1431 11.0875 23.1125 10.7819C23.082 10.4763 22.8094 10.2533 22.5038 10.2839C18.9253 10.6417 16.4423 9.91532 14.8501 8.40653C13.2524 6.89252 12.4377 4.48364 12.4377 1.22746C12.4377 0.920325 12.1887 0.67134 11.8816 0.67134C11.5745 0.67134 11.3255 0.920325 11.3255 1.22746C11.3255 4.47517 10.516 7.08239 8.87909 8.96186C7.24516 10.8379 4.72305 12.062 1.1487 12.4194C0.843091 12.45 0.620117 12.7225 0.650678 13.0281C0.681239 13.3337 0.953763 13.5567 1.25938 13.5261C4.84181 13.1679 7.32467 13.8944 8.91581 15.4031C10.5125 16.9171 11.3255 19.3261 11.3255 22.5826Z"
      fill="#FDCC80"
    />
    <path
      d="M11.3255 22.5826C11.3255 22.8897 11.5745 23.1387 11.8816 23.1387C12.1887 23.1387 12.4377 22.8897 12.4377 22.5826C12.4377 19.3351 13.2489 16.7277 14.8868 14.848C16.5218 12.9717 19.044 11.7477 22.6145 11.3906C22.9201 11.3601 23.1431 11.0875 23.1125 10.7819C23.082 10.4763 22.8094 10.2533 22.5038 10.2839C18.9253 10.6417 16.4423 9.91532 14.8501 8.40653C13.2524 6.89252 12.4377 4.48364 12.4377 1.22746C12.4377 0.920325 12.1887 0.67134 11.8816 0.67134C11.5745 0.67134 11.3255 0.920325 11.3255 1.22746C11.3255 4.47517 10.516 7.08239 8.87909 8.96186C7.24516 10.8379 4.72305 12.062 1.1487 12.4194C0.843091 12.45 0.620117 12.7225 0.650678 13.0281C0.681239 13.3337 0.953763 13.5567 1.25938 13.5261C4.84181 13.1679 7.32467 13.8944 8.91581 15.4031C10.5125 16.9171 11.3255 19.3261 11.3255 22.5826Z"
      fill="url(#paint0_linear_3_70)"
    />
    <path
      d="M11.3255 22.5826C11.3255 22.8897 11.5745 23.1387 11.8816 23.1387C12.1887 23.1387 12.4377 22.8897 12.4377 22.5826C12.4377 19.3351 13.2489 16.7277 14.8868 14.848C16.5218 12.9717 19.044 11.7477 22.6145 11.3906C22.9201 11.3601 23.1431 11.0875 23.1125 10.7819C23.082 10.4763 22.8094 10.2533 22.5038 10.2839C18.9253 10.6417 16.4423 9.91532 14.8501 8.40653C13.2524 6.89252 12.4377 4.48364 12.4377 1.22746C12.4377 0.920325 12.1887 0.67134 11.8816 0.67134C11.5745 0.67134 11.3255 0.920325 11.3255 1.22746C11.3255 4.47517 10.516 7.08239 8.87909 8.96186C7.24516 10.8379 4.72305 12.062 1.1487 12.4194C0.843091 12.45 0.620117 12.7225 0.650678 13.0281C0.681239 13.3337 0.953763 13.5567 1.25938 13.5261C4.84181 13.1679 7.32467 13.8944 8.91581 15.4031C10.5125 16.9171 11.3255 19.3261 11.3255 22.5826Z"
      stroke="#FDCC80"
      stroke-width="1.11225"
      stroke-linejoin="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_3_70"
        x1="11.8816"
        y1="1.22746"
        x2="11.8816"
        y2="22.5826"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#FFE171" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </linearGradient>
    </defs>
  </svg>`;
}

function Circle(rect) {
  const { html } = globalThis.__enhancerApi;
  return html`<div
    class="absolute bg-[color:#c084fc]
    border-(& [color:#a855f7]) rounded-full"
    style=${rectToStyle(rect)}
  ></div>`;
}

function Banner({ version }) {
  const { html } = globalThis.__enhancerApi;
  // gradient bg?
  // brand font? links?
  return html`<div
    class="notion-enhancer--menu-banner relative flex
    overflow-hidden h-[192px] rounded-[4px] border-(& [color:#c084fc]"
    style="background: linear-gradient(225deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%), #a855f7;"
  >
    <${Circle} width="128px" height="128px" bottom="-64px" left="-64px" />
    <${Circle} width="144px" height="144px" top="-108px" left="80px" />
    <${Circle} width="208px" height="208px" bottom="-64px" right="-16px" />
    <${Circle} width="144px" height="144px" bottom="-72px" right="144px" />
    <${Star} width="36px" height="36px" top="136px" left="190px" />
    <${Star} width="48px" height="48px" top="32px" left="336px" />
    <${Star} width="64px" height="64px" top="90px" left="448px" from="lg" />

    <h1
      class="z-10 pl-[32px] md:pl-[48px] lg:pl-[64px] pb-[24px]
      font-bold leading-tight tracking-tight my-auto"
    >
      <span class="text-[26px]">Welcome to</span><br />
      <span class="text-[28px]">the notion-enhancer</span>
    </h1>

    <div
      class="absolute flex bottom-0 right-0
      flex-col pr-[32px] md:pr-[48px] lg:pr-[64px] pb-[24px]"
    >
      <i class="i-notion-enhancer text-[42px] mx-auto mb-[8px]"></i>
      <span
        class="text-[12px] py-[2px] px-[6px]
        font-medium leading-tight tracking-wide"
        >v${version}
      </span>
    </div>
  </div> `;
}

export { Banner };
