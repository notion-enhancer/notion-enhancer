/**
 * notion-enhancer: topbar
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

import { Tooltip } from "../../core/islands/Tooltip.mjs";
import { TopbarButton } from "../../core/islands/TopbarButton.mjs";

const pinLabel = "Pin always on top",
  unpinLabel = "Unpin always on top",
  pinTooltip = "Pin window as always on top",
  unpinTooltip = "Unpin window from always on top";

export default async function (api, db) {
  const { html, sendMessage } = api,
    { addMutationListener, removeMutationListener } = api,
    displayLabel = ($btn) => {
      if ($btn.innerHTML === $btn.ariaLabel) return;
      $btn.style.width = "auto";
      $btn.style.fontSize = "14px";
      $btn.style.lineHeight = "1.2";
      $btn.style.padding = "0px 8px";
      $btn.innerHTML = $btn.ariaLabel;
    },
    displayIcon = ($btn, icon) => {
      if ($btn.innerHTML === icon) return;
      $btn.style.width = "33px";
      $btn.style.padding = "0px";
      $btn.style.justifyContent = "center";
      $btn.innerHTML = icon;
    };

  // share button is text by default
  const shareSelector = ".notion-topbar-share-menu",
    shareButton = await db.get("shareButton"),
    shareIcon = await db.get("shareIcon");
  addMutationListener(shareSelector, () => {
    const $btn = document.querySelector(shareSelector);
    let icon = shareIcon?.content;
    icon ??= `<i class="i-share2 size-[20px]"></i>`;
    if (!$btn) return;
    if (shareButton === "Icon") displayIcon($btn, icon);
    if (shareButton === "Disabled" && $btn.style.display !== "none")
      $btn.style.display = "none";
  });

  const commentsSelector = ".notion-topbar-comments-button",
    commentsButton = await db.get("commentsButton"),
    commentsIcon = await db.get("commentsIcon");
  addMutationListener(commentsSelector, () => {
    const $btn = document.querySelector(commentsSelector),
      icon = commentsIcon?.content;
    if (!$btn) return;
    if (commentsButton === "Text") displayLabel($btn);
    if (commentsButton === "Icon" && icon) displayIcon($btn, icon);
    if (commentsButton === "Disabled" && $btn.style.display !== "none")
      $btn.style.display = "none";
  });

  const updatesSelector = ".notion-topbar-updates-button",
    updatesButton = await db.get("updatesButton"),
    updatesIcon = await db.get("updatesIcon");
  addMutationListener(updatesSelector, () => {
    const $btn = document.querySelector(updatesSelector),
      icon = updatesIcon?.content;
    if (!$btn) return;
    if (updatesButton === "Text") displayLabel($btn);
    if (updatesButton === "Icon" && icon) displayIcon($btn, icon);
    if (updatesButton === "Disabled" && $btn.style.display !== "none")
      $btn.style.display = "none";
  });

  const favoriteSelector = ".notion-topbar-favorite-button",
    favoriteButton = await db.get("favoriteButton"),
    favoriteIcon = await db.get("favoriteIcon");
  addMutationListener(favoriteSelector, () => {
    const $btn = document.querySelector(favoriteSelector),
      icon = favoriteIcon?.content;
    if (!$btn) return;
    if (favoriteButton === "Text") displayLabel($btn);
    if (favoriteButton === "Icon" && icon) displayIcon($btn, icon);
    if (favoriteButton === "Disabled" && $btn.style.display !== "none")
      $btn.style.display = "none";
  });

  const moreSelector = ".notion-topbar-more-button",
    moreButton = await db.get("moreButton"),
    moreIcon = await db.get("moreIcon");
  addMutationListener(moreSelector, () => {
    const $btn = document.querySelector(moreSelector),
      icon = moreIcon?.content;
    if (!$btn) return;
    $btn.ariaLabel = "More";
    if (moreButton === "Text") displayLabel($btn);
    if (moreButton === "Icon" && icon) displayIcon($btn, icon);
    if (moreButton === "Disabled" && $btn.style.display !== "none")
      $btn.style.display = "none";
  });

  const alwaysOnTopButton = await db.get("alwaysOnTopButton");
  if (alwaysOnTopButton === "Disabled") return;

  const topbarFavorite = ".notion-topbar-favorite-button",
    pinIcon = await db.get("pinIcon"),
    unpinIcon = await db.get("unpinIcon"),
    $pin = html`<${TopbarButton}
      onclick=${() => {
        sendMessage("notion-enhancer:topbar", "pin-always-on-top");
        $pin.style.display = "none";
        $unpin.style.display = "";
      }}
      aria-label="${pinLabel}"
      innerHTML="${alwaysOnTopButton === "Icon"
        ? pinIcon?.content
        : `<span>${pinLabel}</span>`}"
      icon="pin"
    />`,
    $unpin = html`<${TopbarButton}
      onclick=${() => {
        sendMessage("notion-enhancer:topbar", "unpin-always-on-top");
        $unpin.style.display = "none";
        $pin.style.display = "";
      }}
      aria-label="${unpinLabel}"
      innerHTML="${alwaysOnTopButton === "Icon"
        ? unpinIcon?.content
        : `<span>${unpinLabel}</span>`}"
      style="display: none"
      icon="pin-off"
    />`,
    addToTopbar = () => {
      const $topbarFavorite = document.querySelector(topbarFavorite);
      if (!$topbarFavorite) return;
      $topbarFavorite.after($pin, $unpin);
      removeMutationListener(addToTopbar);
    };
  html`<${Tooltip}><b>${pinTooltip}</b><//>`.attach($pin, "bottom");
  html`<${Tooltip}><b>${unpinTooltip}</b><//>`.attach($unpin, "bottom");
  addMutationListener(topbarFavorite, addToTopbar);
  addToTopbar(topbarFavorite);
}
