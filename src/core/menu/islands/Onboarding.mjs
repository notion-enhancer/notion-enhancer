/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Heading } from "../components/Heading.mjs";
import { Description } from "../components/Description.mjs";
import { Checkbox } from "../components/Checkbox.mjs";
import { Button } from "../components/Button.mjs";
import { Tile } from "../components/Tile.mjs";
import { setState, useState } from "../state.mjs";

const privacyPolicy = "https://notion-enhancer.github.io/about/privacy-policy/",
  tsAndCs = "https://notion-enhancer.github.io/about/terms-and-conditions/";

function Onboarding() {
  const { html, version, initDatabase } = globalThis.__enhancerApi,
    $submitAgreement = html`<${Button}
      icon="arrow-right"
      class="ml-auto"
      disabled
      >Continue
    <//>`,
    $agreeToTerms = html`<div class="mt-[32px]">
      <${Heading} class="mb-[8px]">
        Thanks for installing the notion-enhancer!
      <//>
      <${Description}>
        In order for the notion-enhancer to function, it may access, collect,
        process and/or store data on your device (including workspace content,
        device metadata, and notion-enhancer configuration) as described in its
        privacy policy. Unless otherwise stated, the notion-enhancer will never
        transmit your information from your device. Collection of anonymous
        telemetry data is enabled by default and can be disabled at any time
        through the menu.
        <br /><br />
        The notion-enhancer is free and open-source software distributed under
        the <a href="${tsAndCs}#license">MIT License</a> without warranty of any
        kind. In no event shall the authors be liable for any consequences of
        the software's use. Before continuing, you must read and agree to the
        notion-enhancer's privacy policy and terms & conditions.
      <//>
      <div class="flex items-center my-[14px] gap-[8px]">
        <!-- _requireReload=${false} prevents the footer from
        suggesting a reload of the app when the box is checked -->
        <${Checkbox}
          _set=${(checked) => ($submitAgreement.disabled = !checked)}
          _requireReload=${false}
        />
        <p class="typography text-[14px] mr-[16px]">
          I have read and agree to the
          <a class="mx-[4px]" href=${privacyPolicy}>Privacy Policy</a>
          and <a href=${tsAndCs}>Terms & Conditions</a>.
        </p>
        ${$submitAgreement}
      </div>
    </div>`;
  $submitAgreement.onclick = async () => {
    if ($submitAgreement.disabled) return;
    await initDatabase().set("agreedToTerms", version);
    setState({ rerender: true });
  };

  const $regularGreeting = html`<div
      class="mt-[16px] grid-(& cols-3) gap-[16px]"
    >
      <${Tile}
        href="https://notion-enhancer.github.io/getting-started/basic-usage/"
        icon="graduation-cap"
        title="Stuck?"
        >Check out the usage guide.
      <//>
      <${Tile}
        href="https://notion-enhancer.github.io/documentation/mods/"
        icon="package-plus"
        title="Something missing?"
        >Build your own extension.
      <//>
      <${Tile}
        href="https://github.com/notion-enhancer/notion-enhancer/issues"
        icon="bug"
        title="Something broken?"
        >Report a bug.
      <//>
    </div>`,
    $featuredSponsors = html`
      <div class="mt-[32px]">
        <${Heading} class="mb-[8px]">Featured Sponsors<//>
        <${Description}>
          A few awesome companies out there have teamed up with me to provide
          you with the notion-enhancer, free forever. Check them out!
        <//>
        <div class="mt-[16px] grid-(& cols-1) gap-[16px]"></div>
        <${Description} class="mt-[12px]">
          <a href="mailto:thedragonring.bod@gmail.com">Join this list.</a>
        <//>
      </div>
    `;
  useState(["rerender"], async () => {
    const agreedToTerms = await initDatabase().get("agreedToTerms");
    $agreeToTerms.style.display = agreedToTerms === version ? "none" : "";
    $regularGreeting.style.display = agreedToTerms === version ? "" : "none";
    $featuredSponsors.style.display = agreedToTerms === version ? "" : "none";
  });

  return html`${$agreeToTerms}${$regularGreeting}`;
}

export { Onboarding };
