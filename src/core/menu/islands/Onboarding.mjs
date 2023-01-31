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
      <${Description}>
        Thanks for installing the notion-enhancer! It's been absolutely
        incredible to see how the notion-enhancer has grown from small
        beginnings to something used today by over 11,000 people around the
        world, now including you. Before you begin, please read the privacy
        policy to learn how the notion-enhancer uses your data and the terms &
        conditions to understand what the notion-enhancer does and does not
        offer. Ticking the box below and pressing <mark>Continue</mark> will
        unlock the notion-enhancer's full functionality, accessible through the
        sidebar.
      <//>
      <div class="flex items-center my-[14px] gap-[8px]">
        <${Checkbox}
          _set=${(checked) => ($submitAgreement.disabled = !checked)}
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
    class="mt-[32px] grid-(& rows-2 cols-2) gap-[16px]"
  >
    <${Tile}
      href="https://notion-enhancer.github.io/getting-started/basic-usage/"
      icon="graduation-cap"
      title="Stuck?"
    >
      Check out the basic usage guide.
    <//>
    <${Tile}
      href="https://notion-enhancer.github.io/getting-started/basic-usage/"
      icon="package-plus"
      title="Something missing?"
    >
      Build your first extension.
    <//>
    <${Tile}
      href="https://github.com/notion-enhancer/notion-enhancer/issues/new?template=BUG_REPORT.md"
      icon="bug"
      title="Something not working?"
    >
      Report a bug.
    <//>
    <${Tile}
      href="https://discord.gg/sFWPXtA"
      icon="help-circle"
      title="Got questions?"
    >
      Join the community.
    <//>
  </div>`;
  useState(["rerender"], async () => {
    const agreedToTerms = await initDatabase().get("agreedToTerms");
    $agreeToTerms.style.display = agreedToTerms === version ? "none" : "";
    $regularGreeting.style.display = agreedToTerms === version ? "" : "none";
  });

  return html`${$agreeToTerms}${$regularGreeting}`;
}

export { Onboarding };
