# h4sq · Ivan Avhustynovych

Односторінкове англомовне CV моушн-дизайнера. Це робочі файли сайту. HTML, CSS і JavaScript редагуються напряму. Збірка, база даних і ключі API не потрібні.

## Video works slider

Run `npm run dev` (Node.js), then open http://127.0.0.1:8000/#works. No installation is needed to serve existing media. `npm run check` checks JavaScript syntax and all media references. Use the Node server for byte-range video streaming and seeking. Use HTTP rather than opening index.html directly because the gallery uses ES modules.

The gallery contains 24 videos and 10 static creatives, grouped into 2D & 3D motion, Performance creatives, and SaaS / Brand. Motion separates reels/campaigns from personal edits; Performance has video ads, UI animations, and a static-image grid. SaaS / Brand is marked in progress and currently shows the 2024 archive piece. Titles are descriptive editorial labels, not verified campaign or client names.

`js/components/work-slider.js` owns filtering, navigation, and preview playback. `js/components/work-viewer.js` owns the modal full-size player and image viewer. `works.css` contains scoped presentation rules. `js/data/works.js` is generated media metadata; `js/data/work-titles.js` contains editable display titles that survive regeneration. No framework or build step is required.

Cards are static initially. Mouse hover expands a card and starts a muted, short preview; leaving pauses it and restores its actual video thumbnail. Tap, Enter, or Space toggles preview playback. Left/Right and Home/End browse cards; Escape stops playback. Watch full film opens the full video with native controls and sound. Images open in the same viewer; Escape closes it and focus returns to the trigger. The active preview and full-size viewer preserve the original aspect ratio. Narrow inactive desktop panels crop posters for the accordion composition; mobile posters preserve the frame. Reduced-motion mode disables hover playback and transitions. Offscreen previews and media in a hidden browser tab pause.

To prepare newly added media, run `npm install`, then `npm run media:prepare`. The script scans the supplied source folders, generates JPEG posters and up-to-eight-second H.264 silent previews in `assets/works/media/`, and writes the data file. The MOV source gets a browser-compatible full MP4. Existing outputs are reused; remove the corresponding generated output first if replacing a source under the same filename. Originals remain unchanged. The 24 preview clips total approximately 8.34 MiB and only load on activation. Full originals load only when the viewer opens, so some full films are still large; retain source folders when deploying. The original Drive archive link remains available.

## Запуск на комп’ютері

Розпакуй архів і відкрий у редакторі папку, де лежить `index.html`. У терміналі цієї папки запусти:

```sh
python -m http.server 8000
```

На Windows також підійде `py -m http.server 8000`, на macOS або Linux — `python3 -m http.server 8000`. Відкрий http://localhost:8000. Після редагування збережи файл і онови сторінку.

## Що де змінювати

| Файл | За що відповідає |
| --- | --- |
| index.html | Ім’я, посада, опис, компанії, дати, інструменти та посилання. Portfolio веде до #works; посилання на Google Drive — View portfolio archive. Контакти — у секції id="contact". |
| cv.css | Адаптивний макет, кольори, розмір тексту, градієнт і мозаїка. Правила @media відповідають за мобільний вигляд і зменшений рух. |
| motion.js | Реакція на курсор, анімація появи, прокрутка та збереження висоти Experience при закритті компанії. |
| ivan-profile.webp | Портрет. Якщо змінюєш пропорції, онови width і height зображення в HTML. |
| ivan-cv.pdf | Файл кнопки Download CV. Коли змінюються дати, контакти чи досвід, онови також PDF окремо. |
| fonts/inter.woff2, grain.png | Локальний шрифт і текстура фону. |

Кожна компанія — окремий елемент details у секції experience. Назва й дати знаходяться в summary, опис — у блоці entry. Атрибут open визначає початково відкриту компанію.

## GitHub і передача доступу

1. Створи порожній репозиторій у своєму GitHub. За потреби обери Private.
2. Завантаж **вміст розпакованої папки** через Add file → Upload files. Файл index.html має лежати в корені, fonts залишається папкою. Збережи через Commit changes.
3. Щоб друг міг пушити зміни, запроси його за GitHub-ніком через Settings → Collaborators. Після прийняття запрошення він зможе клонувати репозиторій через Code → HTTPS або GitHub Desktop.

## Публікація змін

Чинна версія: https://ivan-avhustynovych-motion-cv.leanpoppy.chatgpt.site. GitHub-копія окрема від цього хостингу. Для публікації з GitHub Pages обери Settings → Pages → Deploy from a branch, гілку main, папку /(root). На іншому статичному хостингу публікуй папку з index.html і ресурсами. Підключення власного домену виконується на обраному хостингу.

Після публікації відкрий сайт на телефоні та комп’ютері. Перевір Portfolio, три контакти, завантаження PDF і згортання Clario. Перевір доступність папки Portfolio для відвідувача без входу в Google.
