/*
 * Documentative Scripts
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

class Scrollnav {
  constructor(menu, content, options) {
    if (!(menu instanceof HTMLElement))
      throw Error('scrollnav: invalid <menu> element provided');
    if (!(content instanceof HTMLElement))
      throw Error('scrollnav: invalid <content> element provided');
    if (typeof options !== 'object') options = {};

    if (Scrollnav.prototype.INITIATED)
      throw Error('scrollnav: only 1 instance per page allowed!');
    Scrollnav.prototype.INITIATED = true;

    this._menu = menu;
    this._content = content;
    this._sections = [...this._menu.querySelectorAll('ul li a')]
      .map(el => {
        try {
          return this._content.querySelector(el.getAttribute('href'))
            .parentElement;
        } catch {
          return null;
        }
      })
      .filter(el => el);
    this._topheading = this._sections[0].children[0];

    this._scrolling = [];
    this.build();
  }
  async build() {
    this._content.addEventListener('scroll', this.scrollwatcher.bind(this));

    window.onhashchange = this.hashwatcher.bind(this);
    [...this._menu.querySelectorAll('ul li a')]
      .filter(el => el.getAttribute('href').startsWith('#'))
      .forEach(el => {
        el.onclick = async ev => {
          ev.preventDefault();
          this.set(el.getAttribute('href'));
          this.scroll(() => {
            let offset = this._content.querySelector(el.getAttribute('href'))
              .parentElement.offsetTop;
            if (offset < this._content.clientHeight / 2) offset = 0;
            this._content.scroll({
              top: offset,
              behavior: 'smooth'
            });
          });
        };
      });

    this.set();
    this.showmenu();
    await this.scroll(() => {
      const ID = location.hash || '#' + this._topheading.id;
      try {
        this._content.querySelector(ID).parentElement.scrollIntoView(true);
      } catch {
        location.hash = '';
      }
    });
  }

  set(ID) {
    if (!ID || typeof ID !== 'string')
      ID = location.hash || this._topheading.id;
    if (!ID.startsWith('#')) ID = '#' + ID;
    if (!this._menu.querySelector(`[href="${ID}"]`))
      ID = '#' + this._topheading.id;
    clearTimeout(this.hashloc);
    this.hashloc = setTimeout(() => {
      this._menu
        .querySelectorAll('ul li a')
        .forEach(el =>
          el.getAttribute('href') === ID
            ? el.classList.add('active')
            : el.classList.remove('active')
        );
      if (history.replaceState) {
        history.replaceState(
          null,
          null,
          ID === '#' + this._topheading.id ? '#' : ID
        );
        if (ID === '#' + this._topheading.id)
          this._content.scroll({
            top: 0,
            behavior: 'smooth'
          });
      } else this._content.querySelector(ID).parentElement.scrollIntoView(true);
    }, 100);
  }
  scroll(func) {
    return new Promise((resolve, reject) => {
      try {
        this._scrolling.push(true);
        func();
        setTimeout(() => {
          this._scrolling.pop();
          resolve(true);
        }, 750);
      } catch (err) {
        reject(err);
      }
    });
  }
  showmenu(ID) {
    if (!ID || typeof ID !== 'string')
      ID = location.hash || this._topheading.id;
    if (!ID.startsWith('#')) ID = '#' + ID;
    if (!this._menu.querySelector(`[href="${ID}"]`))
      ID = '#' + this._topheading.id;
    let offset = this._menu.querySelector(`[href="${ID}"]`).parentElement
      .offsetTop;
    if (offset < this._menu.clientHeight / 2) offset = 0;
    clearTimeout(this.menupos);
    this._menu.scroll({
      top: offset,
      behavior: 'smooth'
    });
  }

  hashwatcher(ev) {
    ev.preventDefault();
    if (ev.newURL === ev.oldURL) return;
    this.set();
    this.showmenu();
  }

  scrollwatcher() {
    if (this._scrolling.length) return;
    const viewport = this._content.clientHeight,
      ID = this._sections.reduce(
        (carry, el) => {
          const rect = el.getBoundingClientRect(),
            height = rect.bottom - rect.top,
            visible = {
              top: rect.top >= 0 && rect.top < viewport,
              bottom: rect.bottom > 0 && rect.top < viewport
            };
          let pixels = 0;
          if (visible.top && visible.bottom) {
            pixels = height; // whole el
          } else if (visible.top) {
            pixels = viewport - rect.top;
          } else if (visible.bottom) {
            pixels = rect.bottom;
          } else if (height > viewport && rect.top < 0) {
            const absolute = Math.abs(rect.top);
            if (absolute < height) pixels = height - absolute; // part of el
          }
          pixels = (pixels / height) * 100;
          return pixels > carry[0] ? [pixels, el] : carry;
        },
        [0, null]
      )[1].children[0].id;

    this.set(ID);
    this.showmenu(ID);
  }
}

const construct = () => {
  if (
    location.pathname.endsWith('index.html') &&
    window.location.protocol !== 'file:'
  )
    location.replace('./' + location.hash);

  new Scrollnav(
    document.querySelector('aside'),
    document.querySelector('.documentative')
  );

  document.querySelector('.toggle button').onclick = () =>
    document.body.classList.toggle('mobilemenu');

  if (window.matchMedia) {
    let prev;
    const links = [...document.head.querySelectorAll('link[rel*="icon"]')],
      pointer = document.createElement('link');
    pointer.setAttribute('rel', 'icon');
    document.head.appendChild(pointer);
    setInterval(() => {
      const match = links.find(link => window.matchMedia(link.media).matches);
      if (!match || match.media === prev) return;
      prev = match.media;
      pointer.setAttribute('href', match.getAttribute('href'));
    }, 500);
    links.forEach(link => document.head.removeChild(link));
  }
};

if (document.readyState === 'complete') {
  construct();
} else document.addEventListener('DOMContentLoaded', construct);
