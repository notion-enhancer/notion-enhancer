/*
 * font chooser
 * (c) 2020 torchatlas (https://bit.ly/torchatlas)
 * under the MIT license
 */

'use strict';

module.exports = {
	id: 'e0d8d148-45e7-4d79-8313-e7b2ad8abe16',
	tags: ['extension'],
	name: 'font chooser',
	desc: 'customize your fonts. leave blank to not change anything.',
	version: '0.1.0',
	author: 'torchatlas',
	options: [
		{
			key: 'sansSerif',
			label: 'Sans Serif and UI',
			type: 'input',
			value: '',
		},
		{
			key: 'serif',
			label: 'Serif',
			type: 'input',
			value: ''
		},
		{
			key: 'mono',
			label: 'Monospace',
			type: 'input',
			value: ''
		},
		{
			key: 'code',
			label: 'Code',
			type: 'input',
			value: ''
		}
	],
	hacks: {
		'renderer/preload.js'(store, __exports) {
			document.addEventListener('readystatechange', (event) => {

				if (document.readyState !== 'complete') return false;

				if (store().sansSerif != '') {
					document.documentElement.style.setProperty(
						'--theme_dark--font_sans',
						store().sansSerif
					);
					document.documentElement.style.setProperty(
						'--theme_light--font_sans',
						store().sansSerif
					);	
				}

				if (store().serif != '') {
					document.documentElement.style.setProperty(
						'--theme_dark--font_serif',
						store().serif
					);
					document.documentElement.style.setProperty(
						'--theme_light--font_serif',
						store().serif
					);	
				}

				if (store().mono != '') {
					document.documentElement.style.setProperty(
						'--theme_dark--font_mono',
						store().mono
					);
					document.documentElement.style.setProperty(
						'--theme_light--font_mono',
						store().mono
					);	
				}

				if (store().code != '') {
					document.documentElement.style.setProperty(
						'--theme_dark--font_code',
						store().code
					);
					document.documentElement.style.setProperty(
						'--theme_light--font_code',
						store().code
					);	
				}

			});
		}
	}
}