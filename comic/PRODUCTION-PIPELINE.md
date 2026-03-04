# FolkUp Quest Comic — Production Pipeline v3

> **Engine:** Flux 2 Pro (Replicate) + ImageMagick post-production
> **Дата:** 03.03.2026
> **Статус:** УТВЕРЖДЁН (после верификации Alpha + Beta)

---

## Решения (подтверждены Андреем 03.03.2026)

| Параметр | Решение |
|----------|---------|
| Нарратив | Variant C: общая часть (~18 стр) + триптих финалов (3 × 2 стр) |
| Объём | 24 страницы |
| Production | Replicate Flux 2 Pro (Phase 0.5 benchmark перед production) |
| Дистрибуция | Web reader + PDF + CBZ (Ko-fi PWYW) |
| Языки | RU + EN (SVG text layer swap) |
| Блокнот Алисы | Sage #839E75 (обновить bible: "мокрый кирпич" → sage) |
| Леттеринг | Шрифтовой стек OFL с кириллицей (не hand-SVG) |

---

## Команда (7 экспертов)

| # | Имя | Роль | Фокус |
|---|-----|------|-------|
| 1 | **Марк** | Сценарист | Panel script, диалоги, нарратив, голос персонажей |
| 2 | **Рей** | Комиксист | Визуал, силуэт, контуры, B&W чистота |
| 3 | **Лена** | Бренд-менеджер | Spot color, бренд, compliance |
| 4 | **Алиса** | PM | Скоуп, бэклог, экосистема |
| 5 | **Сэм** | Prompt Engineer | Flux 2 Pro: reference images, pose control, inpainting |
| 6 | **Кира** | Art Director | Layout, pacing, splash vs grid |
| 7 | **Арт** | Леттерер | Типографика, размещение текста, i18n RU/EN, SFX |

Подробности: `memory/comic-expert-panel.md`

---

## Философия

Sin City сам по себе непоследователен. Миллер рисовал каждую страницу как отдельный принт — пропорции лица Марва меняются от панели к панели. Это не баг, это стиль. Наш подход: **каждая панель = лучший из 5 вариантов**, объединённых единым style prefix, post-production pipeline и character bible.

Консистентность через: reference images (Flux 2 Pro) + силуэт-якоря + spot color + пост-обработку.

**Conscious trade-off (B&W):** Strict binary threshold (50%) теряет текстуру лица. Sigmoidal contrast (`-level 10%,90% -sigmoidal-contrast 5,50%`) сохраняет лицевую текстуру, допуская минимальные полутона. Acceptance: лица — допустимы мягкие тона; фоны — strict B&W. QC Рей знает об этом компромиссе.

---

## Flux 2 Pro vs 1.1 Pro

| Параметр | Flux 1.1 Pro | Flux 2 Pro |
|----------|-------------|------------|
| Reference images | Нет | До 8 images |
| Prompt length | ~2K tokens | 32K tokens |
| Pose control | Нет | Прямое управление |
| Image editing | Нет | Inpainting/outpainting |
| Resolution | До 2MP | До 4MP |
| Hex colors | Нет | Да |
| Цена | $0.04/gen | $0.015 + $0.015/MP (~$0.03) |

**ВНИМАНИЕ:** Hit rates Flux 2 Pro — **предварительные оценки**, не эмпирика. Phase 0.5 benchmark обязателен перед production. Если reference images не работают для Sin City B&W → fallback на composite pipeline из 1.1 Pro.

---

## Шрифтовой стек (Арт)

Все OFL 1.1, полная кириллица, Google Fonts:

| Роль | Шрифт | Стиль | Использование |
|------|--------|-------|--------------|
| **Диалоги** | Russo One | Bold brutal | Речь персонажей, белый фон + чёрная рамка |
| **Нарратив** | PT Sans Caption Bold | Condensed readable | Caption boxes, чёрный фон + белый текст |
| **SFX** | Bebas Neue | Ultra-condensed display | Звуковые эффекты (БАХ, ГРОХОТ) |
| **Алиса // КиберГонзо** | Source Code Pro (Apache 2.0) | Моноширинный | `// Алиса`, таймстампы |
| **Запасной** | Bad Comic (OFL) | Classic comic | Fallback для диалогов |

### Стили по персонажам (Арт)
- **Арни (монолог):** PT Sans Caption Bold italic, narration box
- **Алиса:** Source Code Pro, формат `// Алиса — текст`
- **КиберГонзо:** Source Code Pro мелкий, таймстампы
- **Дэн:** Russo One italic для английских фраз, regular для остального
- **Бреус:** Меняется по маскам (Маска 1: regular, Маска 2: bold, Истинный: condensed)
- **Размеры:** min 14px (web), min 5pt (print 300dpi), контраст ≥4.5:1 (WCAG AA)

### i18n стратегия (Арт)
- SVG text layer отделён от изображений
- RU = оригинал, EN = перевод (правило экосистемы)
- Файловая структура: `text/ru/page-03.svg` + `text/en/page-03.svg`
- Сборка: `page-03-art.png` + `text/{lang}/page-03.svg` → `pages/{lang}/page-03.png`
- При i18n swap пересобираются только PNG-экспорты, не генерация

---

## Phase 0: Инструменты

### Генерация
- **Replicate Flux 2 Pro** (text-to-image + image-to-image)
- Параметры: `prompt`, `aspect_ratio`, `seed`, `output_format: png`, `output_quality: 100`
- Reference images: до 8 per generation
- Rate: проверить на Phase 0.5

### Reference Image Library
Перед генерацией — подготовить reference library:
- **Arni front** (Tier 1 pick: shore или bar)
- **Arni back** (Tier 1 pick: arni-leaving)
- **Alice close** (Tier 1 pick: alice-reveal)
- **CyberGonzo** (Tier 1 pick: bar)
- **Dan** (сгенерировать: инверсная тональность — белый силуэт, чёрная заливка)
- **Breus Mask 1** (сгенерировать: водолазка, тонкий контур, «свой парень»)
- **Breus Mask 2** (сгенерировать: дорогая куртка, переключающийся контур)
- **Breus True** (сгенерировать: костюм, двойной контур, силуэт снизу)
- **Lamp** (стабильный reference)

### Post-production
- **ImageMagick** (CLI, Windows native — `magick`)
- Gray crush: `-level 10%,90% -sigmoidal-contrast 5,50%`
- Spot color: Screen blend с маской
- Composite: threshold → transparent → overlay

### Сборка страниц
- **HTML/CSS** → экспорт в PNG (Puppeteer)
- CSS Grid для панельной сетки
- SVG text layer (Арт)
- Шрифты: self-hosted WOFF2 (Russo One, PT Sans Caption, Bebas Neue, Source Code Pro)

### Автоматизация (Windows-native)

```powershell
# process-panel.ps1 — PowerShell вместо bash (Windows!)
param(
    [Parameter(Mandatory)][string]$Input,
    [Parameter(Mandatory)][string]$Output,
    [string]$SpotColor = "none",
    [string]$MaskGeom = ""
)

# Step 1: Gray crush
magick $Input -level "10%,90%" -sigmoidal-contrast "5,50%" crushed.png

# Step 2: Spot color
if ($SpotColor -ne "none" -and $MaskGeom -ne "") {
    $size = ($MaskGeom -split '\+')[0]
    $offset = $MaskGeom -replace "^[^+]+", ""
    magick crushed.png `
        "(" -size $size "xc:$SpotColor" ")" `
        -gravity NorthWest -geometry "+$offset" `
        -compose Screen -composite $Output
} else {
    Copy-Item crushed.png $Output
}

Remove-Item -Force crushed.png -ErrorAction SilentlyContinue
```

---

## Phase 0.5: Flux 2 Pro Benchmark (1 сессия)

**Цель:** Проверить заявленные возможности на практике. Без этого все оценки — гадание.

### Тесты (~30 генераций):

| # | Тест | Что проверяем |
|---|------|---------------|
| 1-5 | Single character + reference image | Reference fidelity для Sin City B&W |
| 6-10 | Two characters + reference images | Multi-character без composite |
| 11-15 | Pose control (hunched, sitting, walking away) | Управление позой |
| 16-20 | Inpainting: исправить область B&W панели | Inpainting для чёрно-белого |
| 21-25 | Dan: инверсная тональность (белый силуэт, чёрная заливка) | Специфичная задача |
| 26-30 | Hex color hint в prompt + B&W стиль | Конфликт с "no gray tones"? |

### Deliverables:
- Таблица реальных hit rates по типам
- Скорректированные оценки бюджета и времени
- Решение: reference images vs composite для multi-character
- Rate limit Flux 2 Pro (может отличаться от 1.1 Pro)

### Gate:
Если hit rate <30% для reference images → **откат на 1.1 Pro + composite pipeline** (оценки пересчитать).

---

## Phase 1: Pre-production (3-5 сессий)

### 1.1 Panel Script (Марк + Кира) — 1-2 сессии
24 страницы. Variant C: общая часть (~18 стр) + триптих (3 × 2 стр).

**Структура триптиха:**
- Стр. 1-18: общая история (Арни, библиотека, бар, Barnes, Бреус, развилка)
- Стр. 19-20: Финал А — глазами Алисы (spot: sage)
- Стр. 21-22: Финал Б — глазами Дэна (spot: amber)
- Стр. 23-24: Финал В — глазами КиберГонзо (spot: bordeaux)

Формат panel script:
```
PAGE 3

Panel 1 (wide, 2/3 page width)
ESTABLISHING SHOT. Пустая библиотека. Коридор сужается к двери.
Лампа в центре. Арни — крошечный силуэт (10-12% высоты).
CAPTION: "Двери были пустые. Как рамки без картин."

Panel 2 (1/3 page, vertical)
CLOSE-UP: рука Арни на двери. Латунный ключ на шнурке.
NO TEXT.
```

### 1.2 Thumbnail Pass (Кира) — в рамках 1.1
24 миниатюры — pacing:
- Splash: стр. 1-2 (берег), стр. 18 (развилка), финалы
- Tight grid: стр. 14-16 (Бреус — напряжение)
- Дыхание: стр. 5-8 (Barnes, библиотека)
- Панелей/стр: 4-6 стандарт, 1 splash, 8 напряжение
- Text boxes: Арт определяет зоны

### 1.3 Character Reference Library (Сэм) — 1-2 сессии
Подготовка reference images по результатам Phase 0.5:
1. Отбор из Tier 1 panels (Arni, Alice, CyberGonzo)
2. Генерация Dan, Breus ×3 (маска 1, маска 2, истинный), Lamp
3. Тест reference fidelity: 3 итерации minimum

**Дэн — специальная обработка:**
Character bible: "Белый силуэт, чёрная заливка внутри. Инверсия Sin City." Каждая панель с Дэном — инвертированная тональность. Тестировать:
- Prompt: "inverted tonality, white silhouette on dark background, black fill inside figure"
- Post-production: `magick dan.png -negate` как альтернатива
- Video call frame: обычная тональность ВОКРУГ рамки, инверсия ВНУТРИ

### 1.4 Character Prompt Blocks v2 (Сэм) — в рамках 1.3
32K tokens: расширенные описания + reference image mapping.

```
STYLE_PREFIX_V2 = "pure black and white, no gray tones, no halftones, no gradients,
spotted blacks, toothbrush splatter texture, high contrast ink illustration,
Frank Miller Sin City style, negative space, bold contour lines,
dramatic chiaroscuro lighting, deep shadows with sharp edges,
background: pure black or pure white, no mid-tones"

ARNI_FRONT = "thin man mid-30s, long hair pulled back in ponytail,
beard, dark jacket with raised collar, hunched shoulders,
hands in pockets, shadowed face half-lit"
+ reference_images: [arni-front-ref.png]

ALICE_CLOSE = "young woman, porcelain mannequin face, blank emotionless
hollow expression, pinpoint pupils, hair pulled back rigidly in bun,
lacquered rigid hair, holding sage-colored notebook #839E75,
perfect symmetry, like a department store mannequin"
+ reference_images: [alice-reveal-ref.png]

DAN_INVERTED = "INVERTED TONALITY: white silhouette with black interior fill,
thin man with wide-brimmed blues hat, African features light skin,
relaxed slouching pose, guitar visible behind"
+ reference_images: [dan-ref.png]

BREUS_MASK1 = "man mid-40s, worn jeans and turtleneck, thin contour line,
open palms, leaning forward, eyes with white highlights"
+ reference_images: [breus-mask1-ref.png]

BREUS_MASK2 = "man mid-40s, expensive jacket over turtleneck,
switching between thin and thick contour, persuasive posture"
+ reference_images: [breus-mask2-ref.png]

BREUS_TRUE = "man in expensive suit, heavy double contour line,
silhouette on balcony looking down, face not visible backlit,
camera angle from below"
+ reference_images: [breus-true-ref.png]
```

### 1.5 Lettering Kit (Арт) — 1 сессия
- Self-host шрифтов (WOFF2): Russo One, PT Sans Caption, Bebas Neue, Source Code Pro
- SVG template: narration box, dialogue box, SFX, monospace block
- Стили по персонажам (см. Шрифтовой стек выше)
- Тест: 3 страницы с текстом RU + EN → читаемость, контраст, размер
- i18n: структура `text/ru/` + `text/en/`

---

## Phase 2: Generation Pipeline (5-7 сессий)

### Для каждой панели:

```
1. Prompt = STYLE_PREFIX_V2 + CHARACTER_BLOCK + SCENE_DESCRIPTION + CAMERA
   + reference_images (1-4 per generation)
   ↓
2. Генерация: 5 вариантов (seed N, N+137, N+274, N+411, N+548)
   delay между запросами (из Phase 0.5)
   ↓
3. Hostile Review: каждый вариант 1-10
   Критерии: B&W чистота, композиция, bible compliance,
   силуэт-якорь, narrative function, reference fidelity
   ↓
4. Pick: лучший вариант
   ↓
5. Post-production (ImageMagick / PowerShell):
   a) Gray crush
   b) Spot color (если нужен)
   c) Dan: инверсия (если нужна)
   d) Crop/resize
   ↓
6. QC: Рей (силуэт), Лена (spot color), Сэм (prompt log), Арт (text space)
```

### Стратегии по типу панели

| Тип | Aspect | Подход | Preliminary hit rate |
|-----|--------|--------|---------------------|
| **Splash** | 2:3 | Один персонаж + ref, негативное пространство | 70-90%* |
| **Close-up** | 1:1 / 4:5 | Лицо/руки + reference | 80-95%* |
| **Два персонажа** | 3:2 | Ref images обоих; fallback: composite | 40-60%* |
| **Establishing** | 16:9 | Без фигур или "ant-sized" | 50-70%* |
| **Action** | 4:3 | Одно действие + pose control | 70-85%* |
| **Silhouette** | any | Белый силуэт на чёрном | 80-90%* |
| **Видеозвонок Дэна** | 1:1 | Рамка + Дэн ref + инверсия | 40-60%* |

*\* Предварительные оценки. Реальные — после Phase 0.5 benchmark.*

### Composite Pipeline (fallback)

```powershell
# Если reference images не дали хороший multi-character результат:
magick scene-with-A.png -level "10%,90%" -sigmoidal-contrast "5,50%" base.png
magick B-solo.png -threshold 50% -transparent black -resize WxH cutout.png
magick base.png cutout.png -gravity NorthWest -geometry "+X+Y" -composite result.png
```

### Inpainting Pipeline (Flux 2 Pro)

```
1. Сгенерировать базовую сцену
2. Если часть не устраивает → создать маску → inpainting
3. Результат: стабильный фон + исправленная область
```

### Batch Strategy

~120-150 панелей на 24 страницы (avg 5-6 panels/page).
**Триптих:** 3 × 2 стр × ~5 панелей = ~30 панелей (отдельные spot colors).

| Batch | Страницы | Панелей | Содержание |
|-------|----------|---------|------------|
| 1 | 1-4 | ~22 | Splash + берег + библиотека |
| 2 | 5-8 | ~22 | Barnes, исследование |
| 3 | 9-12 | ~24 | Midpoint, бар |
| 4 | 13-16 | ~24 | Escalation, Бреус |
| 5 | 17-18 | ~12 | Climax, развилка |
| 6 | 19-20 | ~10 | Финал А: Алиса (sage) |
| 7 | 21-22 | ~10 | Финал Б: Дэн (amber, инверсия) |
| 8 | 23-24 | ~10 | Финал В: КиберГонзо (bordeaux) |

Avg 7 генераций/панель (5 base + retries) = ~900 генераций total.
Между батчами: review + post-production + course correction.

---

## Phase 3: Page Assembly + Lettering (3-4 сессии)

### 3.1 Panel → Page (HTML/CSS)

```html
<div class="comic-page" style="width:2063px; height:3150px;">
  <div class="panel" style="grid-area: 1/1/2/3;">
    <img src="panel-3.1-art.png">
  </div>
  <!-- SVG text layer overlay -->
  <svg class="text-layer" viewBox="0 0 2063 3150">
    <rect x="50" y="50" width="400" height="80" fill="#000" stroke="#fff" stroke-width="2"/>
    <text x="70" y="95" fill="#fff" font-family="PT Sans Caption" font-weight="700" font-size="28">
      Двери были пустые. Как рамки без картин.
    </text>
  </svg>
</div>
```

### 3.2 Lettering workflow (Арт)
1. Art panels (Phase 2) → `art/page-XX-panel-YY.png`
2. Арт создаёт SVG text layers: `text/ru/page-XX.svg` + `text/en/page-XX.svg`
3. Сборка: art + text → `pages/ru/page-XX.png` + `pages/en/page-XX.png`
4. QC: читаемость, контраст, порядок чтения, balloon placement

### 3.3 Alt Text (шаг сборки)

При финальной сборке HTML — генерировать alt text для каждой панели:
- Формат: краткое описание действия + персонажи + эмоция
- Язык: соответствует языковой версии (RU/EN)
- Источник: panel script описания → сжатый alt text

Примеры:
- "Арни входит в библиотеку, силуэт в свете, одинокий"
- "Лампа светит в центре пустого коридора"
- "Рука Арни на латунном ключе, близкий план"

### 3.4 Export

```powershell
# Puppeteer: HTML → PNG (300 DPI)
node export-pages.js --dpi 300 --format png --lang ru
node export-pages.js --dpi 300 --format png --lang en
```

---

## Phase 4: Quality Control (1-2 сессии)

### Per-panel QC (после генерации, Phase 2)

| Эксперт | Проверяет | Критерий |
|---------|-----------|----------|
| **Рей** | Силуэт-тест | Узнаваем без деталей? |
| **Рей** | B&W чистота | Допуск: лица — soft tones OK, фоны — strict B&W |
| **Лена** | Spot color | Правильный цвет, правильный объект? |
| **Сэм** | Prompt log | Reference fidelity? Consistency? |
| **Арт** | Text space | Есть место для text boxes? |
| **Кира** | Pacing | Панель работает в контексте страницы? |

### Per-page QC (после сборки, Phase 3)

| Эксперт | Проверяет |
|---------|-----------|
| **Арт** | Читаемость текста, balloon placement, i18n sync (RU↔EN) |
| **Кира** | Pacing, gutters, panel borders, spread rhythm |
| **Лена** | Spot color consistency, brand compliance |
| **Рей** | Silhouette test на весь разворот |

### Whole-comic QC

1. Character consistency (силуэт-якоря + reference fidelity)
2. Spot color progression: общая часть (нейтральная) → триптих (sage / amber / bordeaux)
3. Pacing: splash pages в нужных местах
4. Text flow: RU — непрерывный поток монолога; EN — sync
5. Dan: инверсия consistent across all panels
6. Breus: маски визуально различимы
7. Compliance: Level 1 clean (no AI tool mentions), WCAG AA для web

---

## Phase 5: Output Formats + Web Reader (2-3 сессии)

### 5.1 Web Reader UX (1 сессия)

**quest.folkup.app/comic/**

Архитектура:
- Panel-by-panel reveal (Intersection Observer)
- Spot color CSS animation (fade-in)
- **Триптих навигация:** стр. 18 (развилка) → выбор: Алиса / Дэн / КиберГонзо
- Language switcher: RU / EN
- Responsive (mobile-first)
- OG images per chapter

**Accessibility (WCAG 2.1 AA):**
- Alt text для каждой панели (Марк пишет)
- Keyboard navigation (ArrowDown = next panel)
- `prefers-reduced-motion: reduce` — disable reveal animation
- Focus indicators
- Contrast ≥4.5:1 для всего текста

### 5.1a Fork Page (стр.20) — Интерактивная механика

Стр.20 помечена `[INTERACTIVE]` в panel script. Веб-реализация:

1. **Layout:** три панели в ряд (desktop) или вертикальный стек (mobile)
2. **Панели:** Алиса/Фонарь (Sage #839E75), Дэн/Мост (Amber #E8AD4A), КиберГонзо/Кресло (Bordeaux #7D4450)
3. **Hover:** spot color усиливается, остальные панели затемняются
4. **Click:** переход к соответствующей концовке (стр.21-22 / стр.23-24 / etc.)
5. **A11y:** keyboard navigation (Tab + Enter), aria-label на каждой панели
6. **Fallback:** без JS — три ссылки с превью

### 5.2 PDF/CBZ (1 сессия)

**PDF:**
- 300 DPI, PDF/X-1a:2001
- CMYK (100% K channel для B&W, spot colors в CMYK gamut)
- Trim: 6.625"×10.25" (US comic)
- Bleed: 0.125" (3mm)
- 2 файла: `folkup-quest-ch1-ru.pdf` + `folkup-quest-ch1-en.pdf`

**CBZ:**
- PNG pages в ZIP
- ComicInfo.xml metadata (language, title, author, genre)
- 2 файла: `folkup-quest-ch1-ru.cbz` + `folkup-quest-ch1-en.cbz`

### 5.3 Deploy (0.5 сессии)

- quest.folkup.app/comic/ — часть существующего quest app (Vite)
- Ko-fi: Pay What You Want для PDF/CBZ download
- CF Pages deployment

---

## Phase 6: Infrastructure (сквозная, 0.5-1 сессия на setup)

### Git Strategy
- Ветка: `comic-ch1` (feature branch от master)
- Коммиты: только post-production + final pages (не raw generations)
- Raw generations: локально в `comic-prototype/` (не в git)
- Naming: `panel-{page}.{panel}-{description}-final.png`
- Seed/prompt log: `_meta/generation-log.md` (приватный, не пушить)

### Storage
- Raw generations (~900 PNG × ~5 MB = ~4.5 GB): локально + backup
- Final panels (~150 × ~3 MB = ~450 MB): git (без LFS — файлы <10 MB)
- Final pages (~48 × ~5 MB = ~240 MB): git
- Шрифты WOFF2: git (static/fonts/)
- **Backup:** Dropbox `C:\Users\ankle\Dropbox\comic-backup\`

### Pre-commit
- Level 1 compliance: проверка на AI tool mentions в staged files
- Prompt logs, seed values — не в публичном репо

---

## Spot Color Map

| Персонаж/Объект | Hex | Когда |
|----------------|-----|-------|
| Блокнот Алисы | #839E75 (sage) | Каждая панель с Алисой |
| Гитарные струны Дэна | #E8AD4A (amber) | Панели с Дэном |
| Свет лампы | #E8AD4A (amber) | Retro-Tech сцены |
| Визитка Бреуса | #7D4450 (bordeaux) | Сцены Бреуса |
| Кресло | #7D4450 (bordeaux) | Финал КиберГонзо |
| Рюкзак курьера | #7D4450 (bordeaux) | Данные КиберГонзо |

---

## Оценки

### Бюджет (API)
- ~900 генераций × ~$0.03 = **~$27**
- Reference library + testing: ~50 × $0.03 = **~$1.5**
- Buffer (retries, failed): **~$1.5**
- Post-production: $0 (ImageMagick)
- Fonts: $0 (OFL, self-hosted)
- Hosting: $0 (CF Pages)
- **Total: ~$30**

### Время

| Phase | Сессий | Содержание |
|-------|--------|------------|
| 0.5 | 1 | Flux 2 Pro benchmark |
| 1 | 3-5 | Pre-production (script, thumbnails, references, lettering kit) |
| 2 | 5-7 | Generation (8 batches) |
| 3 | 3-4 | Page assembly + lettering (RU+EN) |
| 4 | 1-2 | Quality control |
| 5 | 2-3 | Output formats + web reader |
| 6 | 0.5-1 | Infrastructure setup |
| **Total** | **~17-22** | |

### Риски

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Flux 2 Pro ref images не работают для B&W | 30% | Phase 0.5 benchmark → fallback на composite |
| Gray drift интерьеры | 30% | 32K prompt + gray crush |
| Ponytail lost | 40% | Reference image + post-prod |
| Two-character fail | 30% | Ref images; fallback: composite |
| Dan инверсия не генерируется | 50% | Post-prod: `magick -negate` |
| Rate limit | 30% | Delay из Phase 0.5 |
| Кириллица в шрифте | 0% | Все OFL шрифты проверены |
| Copyright (US) | 90% | Text + layout + spot + selection = human creative work |

### Copyright Strategy

AI-generated images: не защищены (US: Zarya of the Dawn; EU: проверить per-country).
Защищены человеческим трудом: текст, layout, spot color, selection & arrangement, post-production.
EU AI Act Art. 50: transparency statement на сайте (Level 2).
EU AI Act Art. 52: маркировка AI-generated content → metadata + disclosure page.
Лицензия комикса: определить до Phase 5 (CC BY-NC-SA 4.0 конфликтует с Ko-fi PWYW если "коммерческое").

---

## Сводка: шаги по порядку

1. [ ] **Phase 0.5: Benchmark** — 30 тестов Flux 2 Pro (reference, pose, inpainting, Dan)
2. [ ] **Panel script** — Марк пишет текст RU, Кира определяет layout (24 стр)
3. [ ] **Thumbnail pass** — Кира рисует 24 миниатюры (pacing)
4. [ ] **Reference library** — Сэм: Tier 1 picks + Dan + Breus×3 + Lamp
5. [ ] **Prompt blocks v2** — Сэм тестирует с reference images
6. [ ] **Lettering kit** — Арт: шрифты, SVG templates, i18n структура, тест 3 страниц
7. [ ] **Generation batch 1-5** — стр. 1-18 (общая часть)
8. [ ] **Generation batch 6-8** — стр. 19-24 (триптих: Алиса, Дэн, КиберГонзо)
9. [ ] **Post-production** — gray crush + spot color + Dan инверсия
10. [ ] **Page assembly** — art + text layers → pages (RU + EN)
11. [ ] **Lettering** — Арт: SVG text overlays RU + EN
12. [ ] **Full QC** — expert panel review
13. [ ] **EN translation** — Марк переводит panel script, Арт создаёт EN text layers
14. [ ] **Web reader** — quest.folkup.app/comic/ (триптих навигация, a11y)
15. [ ] **PDF/CBZ export** — RU + EN
16. [ ] **Deploy** — CF Pages
17. [ ] **Bible update** — блокнот "мокрый кирпич" → sage
