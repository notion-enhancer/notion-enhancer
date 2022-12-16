/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import "../vendor/twind.min.js";
import * as lucide from "../vendor/lucide.min.js";
import { html } from "../vendor/htm+preact.min.js";

export default async () => {
  // const sidebarSelector =
  //   ".notion-sidebar-container .notion-sidebar > div:nth-child(3) > div > div:nth-child(2)";
  // await web.whenReady([sidebarSelector]);

  console.log(lucide);

  const $sidebarLink = html`<div
    class="enhancer--sidebarMenuLink"
    role="button"
    tabindex="0"
  >
    <div>
      <div><div>notion-enhancer</div></div>
    </div>
  </div>`;
  //   <div>${await fs.getText("media/colour.svg")}</div>
  // $sidebarLink.addEventListener("click", env.focusMenu);
};
