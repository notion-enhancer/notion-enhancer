/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "../state.mjs";
import { Heading } from "../components/Heading.mjs";
import { Description } from "../components/Description.mjs";
import { Checkbox } from "../components/Checkbox.mjs";
import { Button } from "../components/Button.mjs";
import { Input } from "../components/Input.mjs";
import { Popup } from "../components/Popup.mjs";

function Profile({ id }) {
  const { html, getProfile, initDatabase } = globalThis.__enhancerApi,
    profile = initDatabase([id]),
    db = initDatabase();

  const getName = async () => {
      let profileName = await profile.get("profileName");
      if (id === "default") profileName ??= "default";
      return profileName ?? "";
    },
    setName = async (name) => {
      // name only has effect in menu
      // doesn't need to trigger reload
      await profile.set("profileName", name);
    },
    isActive = async () => {
      return id === (await getProfile());
    },
    setActive = async () => {
      if (await isActive()) return;
      await db.set("activeProfile", id);
      setState({ rerender: true, databaseUpdated: true });
    };

  const $successName = html`<span
      class="py-[2px] px-[4px] rounded-[3px]
      bg-[color:var(--theme--bg-hover)]"
    ></span>`,
    $uploadSuccess = html`<${Popup}
      onopen=${async () => ($successName.innerText = await getName())}
    >
      <p class="py-[2px] px-[8px] text-[14px]">
        The profile ${$successName} has been updated successfully.
      </p>
    <//>`,
    $uploadError = html`<${Popup}>
      <p
        class="py-[2px] px-[8px] text-[14px]
        text-[color:var(--theme--accent-secondary)]"
      >
        An error was encountered attempting to parse the uploaded file.
      </p>
    <//>`,
    uploadProfile = (event) => {
      const file = event.target.files[0],
        reader = new FileReader();
      reader.onload = async (progress) => {
        try {
          let res = progress.currentTarget.result;
          res = JSON.parse(res);
          delete res["profileName"];
          await profile.import(res);
          setState({ rerender: true, databaseUpdated: true });
          $uploadSuccess.show();
          setTimeout(() => $uploadSuccess.hide(), 2000);
        } catch (err) {
          $uploadError.show();
          setTimeout(() => $uploadError.hide(), 2000);
        }
        // clear input value to allow repeat uploads
        event.target.value = "";
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
          JSON.stringify(await profile.export())
        )}"
      />`;
      document.body.append($a);
      $a.click();
      $a.remove();
    },
    $uploadInput = html`<input
      type="file"
      class="hidden"
      accept=".json"
      onchange=${uploadProfile}
    />`;

  const deleteProfile = async () => {
      let profileIds = await db.get("profileIds");
      if (!profileIds?.length) profileIds = ["default"];
      // clear profile data
      const keys = Object.keys(await profile.export());
      await profile.remove(keys);
      // remove profile from list
      const index = profileIds.indexOf(id);
      if (index > -1) profileIds.splice(index, 1);
      await db.set("profileIds", profileIds);
      if (await isActive()) {
        await db.remove("activeProfile");
        setState({ rerender: true, databaseUpdated: true });
      } else setState({ rerender: true });
    },
    $delete = html`<button
      class="h-[14px] transition duration-[20ms]
      text-[color:var(--theme--fg-secondary)]
      hover:text-[color:var(--theme--fg-primary)]"
    >
      <i class="i-x w-[14px] h-[14px]"></i>
    </button>`,
    $confirmName = $successName.cloneNode(true),
    $confirm = html`<${Popup}
      trigger=${$delete}
      onopen=${async () => ($confirmName.innerText = await getName())}
    >
      <p class="text-[14px] py-[2px] px-[8px]">
        Are you sure you want to delete the profile ${$confirmName} permanently?
      </p>
      <div class="flex-(& col) gap-[8px] py-[6px] px-[8px]">
        <${Button}
          tabindex="0"
          icon="trash"
          class="justify-center"
          variant="secondary"
          onclick=${deleteProfile}
        >
          Delete
        <//>
        <${Button}
          tabindex="0"
          class="justify-center"
          onclick=${() => $confirm.hide()}
        >
          Cancel
        <//>
      </div>
    <//>`;

  return html`<li class="flex items-center my-[14px] gap-[8px]" id=${id}>
    <${Checkbox}
      ...${{ _get: isActive, _set: setActive }}
      onchange=${(event) => (event.target.checked = true)}
    />
    <${Input} icon="file-cog" ...${{ _get: getName, _set: setName }} />
    <${Button}
      icon="import"
      variant="sm"
      tagName="label"
      class="relative"
      onkeydown=${(event) => {
        if ([" ", "Enter"].includes(event.key)) {
          event.preventDefault();
          $uploadInput.click();
        }
      }}
      >${$uploadInput} Import ${$uploadSuccess}${$uploadError}
    <//>
    <${Button} variant="sm" icon="upload" onclick=${downloadProfile}>Export<//>
    <div class="relative flex">${$delete}${$confirm}</div>
  </li>`;
}

function Profiles() {
  const { html, initDatabase } = globalThis.__enhancerApi,
    $input = html`<${Input} icon="file-cog" />`,
    $list = html`<ul></ul>`;

  const db = initDatabase(),
    refreshProfiles = async () => {
      let profileIds = await db.get("profileIds");
      if (!profileIds?.length) profileIds = ["default"];
      const $profiles = profileIds.map((id) => {
        return document.getElementById(id) || html`<${Profile} id=${id} />`;
      });
      // replace rows one-by-one to avoid layout shift
      for (let i = 0; i < $profiles.length || i < $list.children.length; i++) {
        if ($profiles[i] === $list.children[i]) continue;
        if ($list.children[i]) {
          if ($profiles[i]) {
            $list.children[i].replaceWith($profiles[i]);
          } else $list.children[i].remove();
        } else $list.append($profiles[i]);
      }
    },
    addProfile = async () => {
      if (!$input.children[0].value) return;
      const name = $input.children[0].value,
        id = crypto.randomUUID();
      let profileIds = await db.get("profileIds");
      if (!profileIds?.length) profileIds = ["default"];
      await db.set("profileIds", [...profileIds, id]);
      await initDatabase([id]).set("profileName", name);
      $input.children[0].value = "";
      setState({ rerender: true });
    };
  useState(["rerender"], () => refreshProfiles());
  $input.onkeydown = (event) => {
    if (event.key === "Enter") addProfile();
  };

  return html`
    <${Heading}>Profiles<//>
    <${Description}>
      Profiles can be used to preserve and switch between notion-enhancer
      configurations.
    <//>
    <div>
      ${$list}
      <div class="flex items-center my-[14px] gap-[8px]">
        ${$input}
        <${Button} variant="sm" icon="plus" onclick=${addProfile}>
          Add Profile
        <//>
      </div>
    </div>
  `;
}

export { Profiles };
