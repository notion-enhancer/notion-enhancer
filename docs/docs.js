/*
 * Documentative
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

    this.ID;
    this.ticking = [];
    this._menu = menu;
    this._content = content;
    this._links = [];
    this._sections = [...this._menu.querySelectorAll('ul li a')].reduce(
      (list, link) => {
        if (!link.getAttribute('href').startsWith('#')) return list;
        let section = this._content.querySelector(link.getAttribute('href'));
        if (!section) return list;

        this._links.push(link);
        link.onclick = async ev => {
          ev.preventDefault();
          const ID = link.getAttribute('href');
          this.highlightHeading(ID);
          this.scrollContent(ID);
          this.setHash(ID);
        };

        return [...list, section];
      },
      []
    );
    this._topheading = `#${this._sections[0].id}`;

    window.onhashchange = this.watchHash.bind(this);
    this._content.addEventListener('scroll', ev => {
      if (!this.ticking.length) {
        this.ticking.push(1);
        requestAnimationFrame(() => {
          this.watchScroll(ev);
          this.ticking.pop();
        });
      }
    });

    this.set(null, false);
    return this;
  }

  set(ID, smooth) {
    this.highlightHeading(ID);
    this.scrollMenu(ID, smooth);
    this.scrollContent(ID, smooth);
    this.setHash(ID);
  }

  parseID(ID) {
    if (!ID || typeof ID !== 'string') ID = location.hash || this._topheading;
    if (!ID.startsWith('#')) ID = `#${ID}`;
    if (!this._links.find(el => el.getAttribute('href') === ID))
      ID = this._topheading;
    this.ID = ID;
    return ID;
  }
  highlightHeading(ID) {
    this.parseID(ID);
    this._links.forEach(el =>
      el.getAttribute('href') === this.ID
        ? el.classList.add('active')
        : el.classList.remove('active')
    );
    return true;
  }

  watchHash(ev) {
    ev.preventDefault();
    if (ev.newURL !== ev.oldURL) {
      this.set();
    }
  }
  setHash(ID) {
    if (!history.replaceState) return false;
    this.parseID(ID);
    history.replaceState(null, null, ID === this._topheading ? '#' : this.ID);
    return true;
  }

  scrollContent(ID, smooth = true) {
    this.ticking.push(1);
    this.parseID(ID);
    let offset = this._sections.find(el => `#${el.id}` === this.ID).offsetTop;
    if (offset < this._content.clientHeight / 2) offset = 0;
    this._content.scroll({
      top: offset,
      behavior: smooth ? 'smooth' : 'auto'
    });
    setTimeout(() => this.ticking.pop(), 1000);
    return true;
  }
  scrollMenu(ID, smooth = true) {
    this.parseID(ID);
    let offset = this._links.find(el => el.getAttribute('href') === this.ID)
      .offsetTop;
    if (offset < this._menu.clientHeight / 2) offset = 0;
    this._menu.scroll({
      top: offset,
      behavior: smooth ? 'smooth' : 'auto'
    });
    return true;
  }
  watchScroll(ev) {
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
      )[1].id;
    this.ID = ID;
    this.scrollMenu(this.ID);
    clearTimeout(this.afterScroll);
    this.afterScroll = setTimeout(
      () => void (this.highlightHeading(this.ID) && this.setHash(this.ID)),
      100
    );
  }
}

let constructed = false;
const construct = () => {
  if (document.readyState !== 'complete' || constructed) return false;
  constructed = true;

  if (
    location.pathname.endsWith('index.html') &&
    window.location.protocol === 'https:'
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

construct();
document.addEventListener('readystatechange', construct);
