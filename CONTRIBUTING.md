# contributing

the enhancer is a tool for the community, so who best to build it but the community?

these guidelines are designed for smooth communication, management and development on this project.
following them shows respect to the developer/s spending their free time on it, and makes it easiest for them to improve the tool.

**found a bug / something isn't working as expected?** create a
[bug report](https://github.com/dragonwocky/notion-enhancer/issues/new?assignees=&labels=bug&template=bug-report.md&title=).

> SECURITY ISSUE? (e.g. PERSONAL/NOTION DATA BEING INTERFERED WITH)
> EMAIL ME INSTEAD: [thedragonring.bod@gmail.com](mailto:thedragonring.bod@gmail.com)

**have a cool new feature idea / there's something you just wish you could do?** submit a
[feature request](https://github.com/dragonwocky/notion-enhancer/issues/new?assignees=&labels=enhancement&template=feature-request.md&title=).

> enhancements are applied only locally.
> features should be designed only to improve the user experience -
> affecting the way notion internals work is against their ToS.

**using a not-yet-supported operating system or notion installation?** ask for
[platform support](https://github.com/dragonwocky/notion-enhancer/issues/new?assignees=&labels=enhancement&template=platform-support.md&title=).

> mobile clients cannot currently be modded.

**know your way around notion/electron/js/css and have some code to contribute?** great! read below to for recommendations
on how to create a helpful pull request and what happens with your code afterwards.

## testing

download:

```sh
git clone https://github.com/dragonwocky/notion-enhancer
cd notion-enhancer
git checkout js
```

using npm? globally link via `npm link`.

using yarn? globally link via `yarn link` (the output of `yarn global bin` must be in PATH).

the downloaded folder is now directly linked to the `notion-enhancer` command.

no written tests are included with the enhancer: i don't have the experience/skill with them yet to use them effectively.
if you can add some for your code, though, go ahead!

## conventions

the enhancer can be categorised as a **core** extended by included **modules**.
the core can be further split into the **installer** and the **modloader**.
modules are either **extensions** or **themes**.

each module is separately versioned, following the [semver](https://semver.org/) scheme.
depending on the content and scale of a contribution, it may constitute an update on its own or may be merged into a larger update.

to keep a consistent code but informative style it is preferred to name variables with
`snake_case`, functions/methods with `camelCase`, and classes with `PascalCase`.

for information on how to create a theme or module, check the [docs](README.md).

## review

active core devs will manually look through each pull request and communicate with contributors before merging to
make sure it is a) safe, b) functional and c) bug-free.

**a)** system details (e.g. IP, clipboard) + notion user data are considered private unless directly shared by the user.
none of this should be accessed or transmitted to an external server.

**b)** is there a better way to do this? can extra dependencies be removed or replaced by newer web technologies?
how can this be made as user-friendly as possible?

**c)** where possible, code should be tested on a variety of platforms in a variety of situations so it can be
confirmed that it won't break anything for the user and is robust enough to handle use by both
power-users and non-tech-savvy users.

## translating

honestly, i'm not sure where to start with something like this.

if you want to translate parts of the enhancer and you know how to get the enhancer to use such translations, let me know!

## licensing

this project is distributed under the [MIT](https://choosealicense.com/licenses/mit/) license.
the project as a whole is copyrighted by core devs in the [LICENSE](LICENSE) file.

when modifying a file, add your copyright to it in the format `(c) year name <email> (website)`
(inserted into the comment at the top, just above the line that reads `under the MIT license`).

all code contributed to this repository remains attributed to the contributor,
but full rights are granted for it to be used under the terms of the MIT license.
on the occasion that the contributed code should be removed or overwritten,
the copyright statement may be removed from the file.

by opening a pull request in this repository, you agree to the above conditions.

dependencies remain separately licensed to their various authors.
