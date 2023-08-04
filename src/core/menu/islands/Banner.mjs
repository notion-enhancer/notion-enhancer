/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Popup } from "./Popup.mjs";
import { Button } from "./Button.mjs";
import { Description } from "./Description.mjs";
import { useState } from "../state.mjs";

const updateGuide =
    "https://notion-enhancer.github.io/getting-started/updating/",
  tsAndCs = "https://notion-enhancer.github.io/about/terms-and-conditions/";

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
    class="absolute rounded-full
    border-(& purple-500) bg-purple-400"
    style=${rectToStyle(rect)}
  ></div>`;
}

function Banner({ updateAvailable, isDevelopmentBuild }) {
  const { html, version, initDatabase } = globalThis.__enhancerApi,
    $version = html`<button
      class="text-[12px] py-[2px] px-[6px] mt-[2px]
      font-medium leading-tight tracking-wide rounded-[3px]
      relative bg-purple-500 from-white/[0.18] to-white/[0.16]
      bg-[linear-gradient(225deg,var(--tw-gradient-stops))]"
    >
      <div
        class="notion-enhancer--menu-update-indicator
        absolute h-[12px] w-[12px] right-[-6px] top-[-6px]
        ${updateAvailable ? "" : "hidden"}"
      >
        <span
          class="block rounded-full h-full w-full
          absolute bg-purple-500/75 animate-ping"
        ></span>
        <span
          class="block rounded-full h-full w-full
          relative bg-purple-500"
        ></span>
      </div>
      <span class="relative">v${version}</span>
    </button>`,
    $popup = html`<${Popup} trigger=${$version}>
      <p
        class="typography py-[2px] px-[8px] text-[14px]"
        innerHTML=${updateAvailable
          ? `<b>v${updateAvailable}</b> is available! <a href="${updateGuide}">Update now.</a>`
          : isDevelopmentBuild
          ? "This is a development build of the notion-enhancer. It may be unstable."
          : "You're up to date!"}
      />
    <//>`;
  $version.append($popup);
  if (updateAvailable) {
    useState(["focus", "view"], ([, view = "welcome"]) => {
      if (view !== "welcome") return;
      // delayed appearance = movement attracts eye
      setTimeout(() => $version.lastElementChild.show(), 400);
    });
  }

  const $welcome = html`<div
      class="relative flex overflow-hidden h-[192px] rounded-t-[4px]
      border-(& purple-400) bg-purple-500 from-white/20 to-transparent
      text-white bg-[linear-gradient(225deg,var(--tw-gradient-stops))]"
    >
      <${Circle} width="128px" height="128px" bottom="-64px" left="-64px" />
      <${Circle} width="144px" height="144px" top="-108px" left="80px" />
      <${Circle} width="208px" height="208px" bottom="-64px" right="-16px" />
      <${Circle} width="144px" height="144px" bottom="-72px" right="144px" />
      <${Star} width="36px" height="36px" top="136px" left="190px" />
      <${Star} width="48px" height="48px" top="32px" left="336px" />
      <${Star} width="64px" height="64px" top="90px" left="448px" from="lg" />
      <h1
        class="z-10 px-[32px] md:px-[48px] lg:px-[64px]
        font-bold leading-tight tracking-tight my-auto"
      >
        <a href="https://notion-enhancer.github.io/">
          <span class="text-[26px]">Welcome to</span><br />
          <span class="text-[28px]">the notion-enhancer</span>
        </a>
      </h1>
      <div
        class="absolute bottom-0 right-0 py-[24px]
        px-[32px] md:px-[48px] lg:px-[64px]"
      >
        <div class="relative flex-(& col)">
          <i class="i-notion-enhancer text-[42px] mx-auto mb-[8px]"></i>
          ${$version}
        </div>
      </div>
    </div>`,
    $sponsorship = html`<div
      class="py-[18px] px-[16px] rounded-b-[4px]
      border-(& [color:var(--theme--fg-border)]) bg-[color:var(--theme--bg-secondary)]"
    >
      <div class="flex items-center gap-[16px]">
        <p class="text-[14px] font-semibold">
          Enjoying the notion-enhancer?<br />
          Support future development:
        </p>
        <${Button}
          icon="coffee"
          variant="brand"
          class="grow justify-center"
          href="https://www.buymeacoffee.com/dragonwocky"
          >Buy me a coffee
        <//>
        <${Button}
          icon="calendar-heart"
          variant="brand"
          class="grow justify-center"
          href="https://github.com/sponsors/dragonwocky"
          >Sponsor me
        <//>
      </div>
      <!-- Disclaimer: these perks are only a draft, for anyone reading this.
      This information may change at any time. -->
      <${Description} class="mt-[6px]">
        Sponsors help make open-source development sustainable and receive
        access to priority support channels, private developer previews, and
        role cosmetics on Discord. A one-time donation is equivalent to 1 month
        of sponsor perks. To learn more about perks, read the
        <a href=${tsAndCs} class="ml-[3px]">Terms & Conditions</a>.
      <//>
    </div>`;
  initDatabase()
    .get("agreedToTerms")
    .then((agreedToTerms) => {
      // only show sponsorship if already agree to terms
      // and opening menu after having reloaded since agreeing
      $welcome.style.borderRadius = agreedToTerms === version ? "" : "4px";
      $sponsorship.style.display = agreedToTerms === version ? "" : "none";
    });

  return html`<section class="notion-enhancer--menu-banner">
    ${$welcome}${$sponsorship}
  </section>`;
}

export { Banner };
