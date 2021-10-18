/*
 * notion-enhancer: word counter
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const copyToClipboard = async (str) => {
    try {
      await navigator.clipboard.writeText(str);
    } catch {
      const el = document.createElement('textarea');
      el.value = str;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  },
  humanTime = (mins) => {
    let readable = '';
    if (1 <= mins) {
      readable += `${Math.floor(mins)} min`;
      if (2 <= mins) readable += 's';
    }
    const secs = Math.round((mins % 1) * 60);
    if (1 <= secs) {
      if (1 <= mins) readable += ' ';
      readable += `${secs} sec`;
      if (2 <= secs) readable += 's';
    }
    return readable;
  };

export default async function ({ web, components }, db) {
  const dbNoticeText = 'Open a normal page to see word count.',
    pageNoticeText = 'Click a stat to copy it.',
    $notice = web.html`<span id="word-counter--notice">${dbNoticeText}</span>`;

  const $wordCount = web.html`<b>12</b>`,
    $characterCount = web.html`<b>12</b>`,
    $sentenceCount = web.html`<b>12</b>`,
    $blockCount = web.html`<b>12</b>`,
    $readingTime = web.html`<b>10 mins</b>`,
    $readingTooltip = web.html`${await components.feather('info')}`,
    $speakingTime = web.html`<b>18 secs</b>`,
    $speakingTooltip = web.html`${await components.feather('info')}`,
    $statContainer = web.render(
      web.html`<div></div>`,
      web.render(web.html`<p class="word-counter--stat"></p>`, $wordCount, ' words'),
      web.render(web.html`<p class="word-counter--stat"></p>`, $characterCount, ' characters'),
      web.render(web.html`<p class="word-counter--stat"></p>`, $sentenceCount, ' sentences'),
      web.render(web.html`<p class="word-counter--stat"></p>`, $blockCount, ' blocks'),
      web.render(
        web.html`<p class="word-counter--stat"></p>`,
        $readingTooltip,
        $readingTime,
        ' reading time'
      ),
      web.render(
        web.html`<p class="word-counter--stat"></p>`,
        $speakingTooltip,
        $speakingTime,
        ' speaking time'
      )
    );
  $statContainer.querySelectorAll('.word-counter--stat').forEach(($stat) => {
    $stat.addEventListener('click', () => copyToClipboard($stat.innerText));
  });
  components.setTooltip($readingTooltip, '**~ 275 wpm**');
  components.setTooltip($speakingTooltip, '**~ 180 wpm**');
  await components.addPanelView({
    icon: await components.feather('type'),
    title: 'Word Counter',
    $content: web.render(web.html`<div></div>`, $notice, $statContainer),
  });

  let $page;
  const updateStats = () => {
      if (!$page) return;
      const words = $page.innerText.split(/[^\w]+/).length;
      $wordCount.innerText = words;
      $characterCount.innerText = $page.innerText.length;
      $sentenceCount.innerText = $page.innerText.split('.').length;
      $blockCount.innerText = $page.querySelectorAll('[data-block-id]').length;
      $readingTime.innerText = humanTime(words / 275);
      $speakingTime.innerText = humanTime(words / 180);
    },
    pageObserver = () => {
      if (document.contains($page)) {
        updateStats();
      } else {
        $page = document.getElementsByClassName('notion-page-content')[0];
        if ($page) {
          $notice.innerText = pageNoticeText;
          $statContainer.style.display = '';
          updateStats();
        } else {
          $notice.innerText = dbNoticeText;
          $statContainer.style.display = 'none';
        }
      }
    };
  web.addDocumentObserver(pageObserver, [
    '.notion-page-content',
    '.notion-collection_view_page-block',
  ]);
  pageObserver();
}
