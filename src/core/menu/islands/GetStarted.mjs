/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Heading } from "../components/Heading.mjs";
import { Description } from "../components/Description.mjs";
import { Checkbox } from "../components/Checkbox.mjs";
import { Option } from "./Options.mjs";

const privacyPolicy = "https://notion-enhancer.github.io/about/privacy-policy/",
  tsAndCs = "https://notion-enhancer.github.io/about/terms-and-conditions/";

function GetStarted() {
  const { html } = globalThis.__enhancerApi;

  return html`
    <${Heading}>Get Started <i class="i-arrow-right"></i><//>

    <div class="flex items-center my-[14px] gap-[8px]">
      <${Checkbox}
        ...${{ _get: () => Promise.resolve(true), _set: () => {} }}
        onchange=${(event) => (event.target.checked = true)}
      />
      <p class="typography text-[14px]">
        I have read and agreed to the
        <a class="mx-[4px]" href=${privacyPolicy}>Privacy Policy</a>
        and <a href=${tsAndCs}>Terms & Conditions</a>.
      </p>
    </div>
  `;
}

export { GetStarted };

// - deidentified / anonymous
//   - once a week
//   - privacy policy
// - learn how the notion-enhancer is used and what parts need focusing on
