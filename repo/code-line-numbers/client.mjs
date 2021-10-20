/*
 * notion-enhancer: code line numbers
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ web }, db) {
  const singleLined = await db.get(['single_lined']),
    codeBlockSelector = '.notion-code-block.line-numbers',
    numbersClass = `code_line_numbers--${await db.get(['style'])}`,
    $temp = web.html`<span></span>`;

  const numberCodeBlock = ($codeBlock) => {
      const $numbers =
        $codeBlock.querySelector(`.${numbersClass}`) ||
        web.html`<span class="${numbersClass}">1</span>`;
      if (!$codeBlock.contains($numbers)) $codeBlock.prepend($numbers);

      const lines = $codeBlock.lastElementChild.innerText.split(/\r\n|\r|\n/),
        wordWrap = $codeBlock.lastElementChild.style.wordBreak === 'break-all';
      if (lines.at(-1) === '') lines.pop();

      let lineNumbers = '';
      for (let i = 1; i <= lines.length + 1; i++) {
        lineNumbers += `${i}\n`;
        if (wordWrap && lines[i - 1]) {
          $temp.innerText = lines[i - 1];
          $codeBlock.lastElementChild.append($temp);
          const height = parseFloat($temp.getBoundingClientRect().height);
          $temp.remove();
          for (let j = 1; j < height / 20.4; j++) lineNumbers += '\n';
        }
      }

      if (!singleLined && lines.length < 2) lineNumbers = '';
      if ($numbers.innerText !== lineNumbers) $numbers.innerText = lineNumbers;
    },
    numberAllCodeBlocks = () => {
      for (const $codeBlock of document.querySelectorAll(codeBlockSelector)) {
        numberCodeBlock($codeBlock);
      }
    },
    observeCodeBlocks = (event) => {
      const tempEvent = [...event.addedNodes, ...event.removedNodes].includes($temp),
        numbersEvent =
          event.target.classList.contains(numbersClass) ||
          [...event.addedNodes, ...event.removedNodes].some(($node) =>
            $node?.classList?.contains(numbersClass)
          ),
        codeEvent = event.target.matches(`${codeBlockSelector}, ${codeBlockSelector} *`);
      if (tempEvent || numbersEvent || !codeEvent) return;

      let $codeBlock = event.target;
      while (!$codeBlock.matches(codeBlockSelector)) $codeBlock = $codeBlock.parentElement;
      numberCodeBlock($codeBlock);
    };

  await web.whenReady();
  numberAllCodeBlocks();
  web.addDocumentObserver(observeCodeBlocks, [codeBlockSelector]);
}
