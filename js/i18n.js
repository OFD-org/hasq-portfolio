import { pageTranslations, translations } from './data/translations.js';

let language = 'en';
try {
  if (localStorage.getItem('portfolio-language') === 'uk') language = 'uk';
} catch { /* Language switching also works when storage is unavailable. */ }

export const t = text => language === 'uk' ? translations[text] ?? text : text;
export function workCount(count) {
  const forms = language === 'uk'
    ? { one: 'робота', few: 'роботи', many: 'робіт', other: 'роботи' }
    : { one: 'work', other: 'works' };
  return `${count} ${forms[new Intl.PluralRules(language).select(count)]}`;
}

// Retain the original markup, including emphasis and line breaks, for switching back.
const content = Object.entries(pageTranslations).flatMap(([selector, values]) =>
  [...document.querySelectorAll(selector)].map((element, index) => ({
    element, en: element.innerHTML, uk: values[index]
  }))
);
const attributes = [...document.querySelectorAll('[aria-label], [alt]')].flatMap(element =>
  ['aria-label', 'alt'].filter(attribute => translations[element.getAttribute(attribute)])
    .map(attribute => ({ element, attribute, en: element.getAttribute(attribute) }))
);

function applyLanguage() {
  document.documentElement.lang = language;
  for (const item of content) item.element.innerHTML = item[language];
  for (const item of attributes) item.element.setAttribute(item.attribute, t(item.en));
  document.querySelector('.hero h1').setAttribute('aria-label',
    language === 'uk' ? 'Іван Августинович' : 'Ivan Avhustynovych');
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  document.dispatchEvent(new Event('languagechange'));
}

document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => {
    if (language === button.dataset.language) return;
    language = button.dataset.language;
    try { localStorage.setItem('portfolio-language', language); } catch { /* Optional. */ }
    applyLanguage();
  });
});
applyLanguage();
