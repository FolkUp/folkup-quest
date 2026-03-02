# Image Sourcing — FolkUp Quest

> Last updated: 2026-03-02

## Стиль

Dark atmospheric digital art с психоделическими undertones. Goa trance aesthetic, fractal patterns, muted cinematic palette. Brand colors: бордо #7D4450, шалфей #839E75, янтарь #E8AD4A.

## Модель генерации

**FLUX.1 Schnell** (Black Forest Labs) via Replicate API
- Лицензия: Apache 2.0 — пользователь владеет generated outputs
- Стоимость: $0.003/image, <1 сек генерация
- Org: folkup (Replicate)

### Base prompt (единый для всех сцен)

```
Dark atmospheric digital art, psychedelic undertones, subtle fractal patterns in shadows,
goa trance aesthetic, muted cinematic palette with bordeaux and sage accents,
film grain texture, wide composition, no text, no people faces.
```

+ уникальный scene suffix для каждой сцены.

## Фоны сцен

| Сцена | Файл | Источник | Лицензия | Статус |
|-------|------|----------|----------|--------|
| E: Эпиграф | `epigraph-bg.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 1: Сетубал, море | `scene1-shore.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 1.5: Flashback офис | `scene1_5-flashback.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 2: Библиотека | `scene2-library.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 3: Barnes | `scene3-barnes.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 4: Грибы/OSINT | `scene4-mushrooms.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 5: Чикаго, блюз | `scene5-dan.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 6: Flashback Бреус | `scene6-flashback-breus.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 7: Офис Бреуса | `scene7-breus-office.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 8: Тишина | `scene8-silence.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 9: Зеркало | `scene9-mirror.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 10: Рассвет | `scene10-dawn.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 11a: Фонарь | `scene11a-lantern.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 11b: Мост | `scene11b-bridge.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 11c: Кресло | `scene11c-chair.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |
| 12: Credits | `scene12-credits.jpg` | FLUX.1 Schnell | Apache 2.0 (user owns output) | done |

## Character Illustrations (Sidebar)

| # | ID | Файл | Источник | Лицензия | Статус |
|---|-----|------|----------|----------|--------|
| 1 | arni | `char-arni.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 2 | alice | `char-alice.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 3 | gonzo | `char-gonzo.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 4 | dan | `char-dan.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 5 | breus-young | `char-breus-young.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 6 | breus | `char-breus.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 7 | arni-mirror | `char-arni-mirror.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 8 | comandante | `char-comandante.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 9 | team | `char-team.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |
| 10 | chair | `char-chair.webp` | FLUX.1 Schnell | Apache 2.0 (user owns output) | pending |

### Character Style prefix

```
Dark atmospheric portrait, Caravaggio lighting, Villeneuve color grading,
muted cinematic palette with bordeaux and sage accents, film grain texture,
moody, painterly, no text.
```

+ unique character suffix. Aspect ratio: 2:3 (portrait, 640x960). Format: WebP quality 80.

## Workflow

1. **Scenes:** Генерация 3 вариантов на сцену через `scripts/generate-scenes.js`
2. **Characters:** Генерация 3 вариантов на персонажа через `scripts/generate-characters.js`
3. Ревью вариантов → выбор лучшего
4. Копия в `public/images/` с финальным именем
5. CSS backgrounds через `styles/_scenes.css`, sidebar через `src/ui/character-images.js`
