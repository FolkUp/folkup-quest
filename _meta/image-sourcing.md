# Image Sourcing — FolkUp Quest

> Last updated: 2026-03-01

## Стиль

Реалистичная детализация + психоделический компьютерный подтекст. Goa trance aesthetic, fractal art, glitch art, digital surrealism. БЕЗ наркотиков.

Brand colors для overlays: бордо #7D4450, шалфей #839E75, янтарь #E8AD4A.

## Фоны сцен

| Сцена | Описание | Источник | Лицензия | Статус |
|-------|----------|----------|----------|--------|
| 1: Сетубал, море | Скамейка, побережье, чайки, тёплый свет | Unsplash `Portugal sunset sea bench` | Unsplash License | todo |
| 1.5: Flashback офис | Мрачный openspace, холодный свет, glitch | Unsplash `corporate office fluorescent` | Unsplash License | todo |
| 2: Библиотека | Тёмная библиотека, пустые стеллажи, лампа | Unsplash `TQ8ICns1tgE` (Fer Troulik) | Unsplash License | candidate |
| 3: Barnes | Темза, SW13, зелень, мечтательность | Unsplash `taHqprFBxfQ` (Thames riverside) | Unsplash License | candidate |
| 4: Грибы/OSINT | Лес с грибами, мицелий, fractal spores | Pixabay `4807192` (glowing mushrooms) | Pixabay License | candidate |
| 5: Чикаго, блюз | Ночной город, неон, дождь, блюз-клуб | Unsplash `blues music neon night` | Unsplash License | todo |
| 6: Команда | Четверо за столом, экраны, лампа | Composite: библиотека + group at table | Mixed | todo |
| 7: Бреус | Стеклянный офис, холодный, corporate dystopia | Unsplash `V5vF94h52r0` (Fabian Kleiser) | Unsplash License | candidate |
| 8: Тишина | Библиотека ночью, только лампа | Re-use сцена 2, darker processing | — | todo |
| 9: Зеркало | Fractal зеркало, два будущих | Pixabay `fractal psychedelic` composite | Pixabay License | todo |
| 11a: Фонарь | Кованый фонарь, тёплый свет, корни | Custom artwork needed (маскот) | TBD | blocked |
| 11b: Мост | Мост с людьми, нейтральные тона | Unsplash `Lisbon bridge` | Unsplash License | todo |
| 11c: Кресло | Кожаное кресло, стеклянный офис | Composite: сцена 7 + armchair | Mixed | todo |
| 12: Credits | Ночное небо, звёзды, fractal | Pixabay `night sky fractal` composite | Pixabay License | todo |

## Персонажи

| Персонаж | Описание | Источник | Лицензия | Статус |
|----------|----------|----------|----------|--------|
| Арни | ~35, усталый, casual, хакер-вайб | Unsplash `REOoETloFqE` (Batuhan Doğan) | Unsplash License | candidate |
| Алиса | Мечтательная, блокнот, умная | Pixabay `woman thinking` collection | Pixabay License | todo |
| КиберГонзо | Параноидальный, мониторы, cyberpunk | Unsplash `k1lMHu31Lzo` (Bilicube) | Unsplash License | candidate |
| Дэн | Блюзмен, гитара, тёплый | Pexels `29840760` (guitar warm light) | Pexels License | candidate |
| Бреус | Дорогой костюм, холодный, corporate | Pexels `business suit` collection | Pexels License | todo |

## Ключевые объекты

| Объект | Описание | Источник | Лицензия | Статус |
|--------|----------|----------|----------|--------|
| Лампа Lucerna | Кованый фонарь с корнями, тёплый свет | Custom artwork needed | TBD | blocked |
| SSH-ключ | Латунный старинный ключ | Unsplash `1RE2Xn6rTQc` (vintage keys) | Unsplash License | candidate |
| Блокнот Алисы | Потрёпанный, с рисунками | Pixabay `notebook drawing` | Pixabay License | todo |
| Гитара Дэна | Акустическая, тёплые тона | See Дэн entry | — | — |
| Экраны КиберГонзо | Мониторы, зелёный код, matrix | GitHub Rezmason/matrix (CC0) | CC0 | available |
| Контракт Бреуса | Зловещий документ, мелкий шрифт | Pexels generic legal doc | Pexels License | todo |
| Зеркало Дракона | Тёмное, fractal reflections | Pixabay `7695743` | Pixabay License | candidate |

## Текстуры/Overlays

| Текстура | Описание | Источник | Лицензия | Статус |
|----------|----------|----------|----------|--------|
| Fractal (brand colors) | Бордо/янтарь/шалфей fractals | StockCake fractal-art | StockCake Free | available |
| Glitch art | Databending, digital distortion | Simpedit/Pixlr generators | Tool output | available |
| Psychedelic patterns | Sacred geometry, cosmic | Wikimedia Commons fractal art | CC BY-SA | available |
| Мицелий/network | Wood Wide Web, organic net | Custom generative (p5.js) | TBD | todo |
| Code rain (organic) | Растущий код, не Matrix | GitHub matrix (CC0) + custom mod | CC0 | todo |

## Проблемные зоны

1. **Лампа Lucerna** — маскот FolkUp, нет open-source "фонарь с корнями". Нужен custom artwork.
2. **Goa trance visuals** — большинство под copyright. Использовать Wikimedia fractal art как основу.
3. **Organic code rain** — Matrix rain есть (CC0), но "like plant growth" требует кастомной модификации.

## Workflow

1. Выбрать конкретные изображения из candidates
2. Скачать в `public/images/`
3. Post-processing: цветокоррекция → glitch/fractal overlay → blend modes
4. Для каждого — записать автора и лицензию в `_meta/license-audit.md`
5. Для CC BY/CC BY-SA — добавить атрибуцию в credits (Scene 12)
