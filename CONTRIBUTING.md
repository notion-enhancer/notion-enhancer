# Contributing to notion-enhancer

The enhancer is a tool for the community, so who's best to build it but the community?

These guidelines are designed for smooth communication, management and development on this project.
following them shows respect to the developer/s spending their free time on it, and makes it easiest for them to improve the tool.

**Found a bug / something isn't working as expected?** Create a
[bug report](https://github.com/dragonwocky/notion-enhancer/issues/new?labels=bug&template=bug-report.md).

> SECURITY ISSUE? (e.g. PERSONAL/NOTION DATA BEING INTERFERED WITH)
> EMAIL ME INSTEAD: [thedragonring.bod@gmail.com](mailto:thedragonring.bod@gmail.com)

**Have a cool new feature idea / there's something you just wish you could do?** Submit a
[feature request](https://github.com/dragonwocky/notion-enhancer/issues/new?labels=enhancement&template=feature-request.md).

> Enhancements are applied only locally -
> features should be designed only to improve the user experience.

**Know your way around notion/electron/js/css and have some code to contribute?** Great! Read below for guidelines
on how to create a helpful pull request and what happens with your code afterwards. It's probably also helpful to
join the [discord server](https://discord.gg/sFWPXtA).

**For information on how to actually create a theme or module with the notion-enhancer api, check the [docs](DOCUMENTATION.md).**

## Testing

First, remove any other installations of the enhancer: `npm remove -g notion-enhancer`

To download and install the latest code, run:

```sh
git clone https://github.com/dragonwocky/notion-enhancer
cd notion-enhancer
git checkout dev
npm link
notion-enhancer apply -y
```

To update the dev build, go into the downloaded folder and run `git pull`. (make sure any work-in-progress themes etc. are copied somewhere else safely first.)

To remove the dev build, go into the downloaded folder and run:

```sh
notion-enhancer remove -n
npm unlink
```

## Coding Conventions

The enhancer is a **core** extended by included **modules**.
The core can be further split into the **installer** and the **modloader**.
Modules are either **extensions** or **themes**.

Each module is separately versioned, following the [semver](https://semver.org/) scheme.
Depending on the content and scale of a contribution, it may constitute an update on its own or may be merged into a larger update.

To keep a consistent & informative code style it is preferred to name variables with
`snake_case`, functions/methods with `camelCase`, and classes with `PascalCase`.
If a variable is a reference to a DOM element, it may be helpful to prefix it with a `$`.

Some variables beginning with a double underscore are `__folder` paths and `ALL_CAPS` variables are constant.
This is not required, but these styles should not be used for any other purpose.

The master branch is kept consistent with the current release, so all changes should be made to the dev branch.

## Pull Request Reviewing

Active core devs will manually look through each pull request and communicate with contributors before merging to
make sure it is:

**a) Safe.** System details (e.g. IP, clipboard) and notion user data are considered **private** unless directly shared by the user.
None of this should be accessed or transmitted to an external server.

**b) Functional.** Ask yourself these questions: is there a better way to do this? 
Can extra dependencies be removed or replaced by newer web technologies?
How can this be made as user-friendly as possible?

**c) Bug-free.** Where possible, code should be tested on a variety of platforms and in a variety of situations so it can be
confirmed that it won't break anything for the user and is robust enough to handle use by both
power users and non-tech-savvy users.

## Translating

Future versions of the enhancer will have multi-language support.

If you are willing to help with translation, let me know and I'll contact you when I'm ready.

## Licensing

This project is distributed under the [MIT](https://choosealicense.com/licenses/mit/) license.
The project as a whole is copyrighted by core devs in the [LICENSE](LICENSE) file.

When modifying a file, add your copyright to it in the format:

```
/*
 * module or project name
 * (c) year name <email> (website)
 * under the MIT license
 */
```

All code contributed to this repository remains attributed to the contributor,
but full rights are granted for it to be used under the terms of the MIT license.
On the occasion that the contributed code should be removed or overwritten,
the contributor's copyright may be removed from the file.

By opening a pull request in this repository, you agree to the above conditions.

Dependencies remain separately licensed to their various authors.
