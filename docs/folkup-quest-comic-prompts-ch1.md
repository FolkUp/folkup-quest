# FolkUp Quest — Промпты: Глава 1 "Ключ"

> **Версия:** 1.0
> **Дата:** 02.03.2026
> **Модель:** Flux 1.1 Pro (Replicate, $0.04/img)
> **Стиль:** Sin City B&W, spot color (sage) только на стр. 8-9
> **Связано:** `folkup-quest-comic-storyboard-ch1.md`, `folkup-quest-comic-bible.md`

---

## Стилевой префикс (общий для всех панелей)

Используется как база для всех промптов. Каждый промпт = STYLE_PREFIX + описание панели.

```
STYLE_PREFIX = "Black and white ink illustration, Frank Miller Sin City style, pure black and white, no gray tones, no halftones, no gradients, no soft edges, high contrast, spotted blacks, negative space, ink wash, wordless comic book art."
```

**Сэм:** Flux 1.1 Pro хорошо знает Sin City — ключевые слова `Frank Miller`, `Sin City`, `spotted blacks`, `negative space` дают нужный контраст без полутонов. `ink wash` добавляет текстуру, `no gray tones, no halftones` — страховка от дрейфа в серый. `no gradients, no soft edges` — усиление от враждебного ревьюера (Flux иногда дрейфует в мягкие тени). `wordless` — дополнительная страховка от генерации текста (Flux любит добавлять буквы в comic art). НЕ использовать `pencil sketch`, `manga`, `anime` — уводит стиль.

---

## PANEL 1.1 — Shore Splash (Сетубал, берег)

### Из раскадровки

Полная страница (splash). Сетубал, набережная. Белый силуэт Арни на чёрной скамейке — худой, жилистый, хвост, воротник поднят, сутулится. 7 чаек = белые точки, разных размеров и расстояний. Атлантика = горизонталь на 50% высоты. Рыбаки: 3-4 силуэта на горизонте, сети = горизонтальная дуга. Камера: Wide establishing, 30° bird's eye.

### Промпт

```
[STYLE_PREFIX] High angle looking down at approximately 30 degrees at a coastal waterfront at dusk. A thin wiry man with ponytail sits alone on a wooden bench, rendered as white silhouette against solid black, leather jacket collar raised high, shoulders slouched forward. Scattered seagulls across the dark sky as small white shapes of varying sizes at different distances. Atlantic ocean as a bold white horizontal line in the upper third of the composition. Tiny fishermen silhouettes visible along the horizon line, horizontal arc of fishing nets creating a gentle curve. Weathered wooden bench rendered in white outline. Massive areas of pure black, dramatic negative space above and below the horizon. Ink splatter texture. Comic book splash page composition. No text, no speech bubbles.
```

**v2 фиксы (панель + враг):**
- Числа убраны ("seven" → "scattered", "3-4" → "tiny silhouettes") — Flux не считает
- Горизонт: "mid-height" → "upper third" (bird's eye сжимает горизонт вверх)
- Краска скамейки убрана (не видна с bird's eye)
- "on water surface" убрано (противоречило "bold white horizontal line")

### Параметры

| Параметр | Значение |
|----------|---------|
| Aspect ratio | 2:3 (portrait — full page) |
| Variants | 5 |
| Seeds | 1001, 1137, 1274, 1411, 1548 |
| Spot color | Нет |

### Заметки Сэм

- **Ключевой элемент:** соотношение масштабов — Арни маленький на скамейке, чайки ещё меньше. Если Flux увеличит фигуру — пересид.
- **Риск:** Flux может добавить серые тона в небо. Тройная страховка: `no gray tones` + `pure black and white` + `no gradients, no soft edges`.
- **Рифма с 2.3:** Чайки здесь рифмуются со стаканами на стр. 2. Точное число 7 — для человека-художника, от Flux принимаем любое количество.
- **Верификация от враждебного ревьюера (6/10):** "Самый безопасный промпт для стиля, потому что 80% = чёрное пространство и негативное пространство. Sin City будет держаться."

---

## PANEL 2.3 — Bar with 7 Glasses (бар, дно)

### Из раскадровки

Full width × 1/3 высоты. Арни лицом в бар. 7 пустых стаканов расставлены с вариацией расстояний и высоты — паттерн ощущается, не геометрически копирует чаек. Бармен-силуэт на фоне. Арни: лоб на скрещённых руках. Камера: Medium, боковой, eye level.

### Промпт

```
Black and white ink illustration, Frank Miller Sin City style, pure black and white, no gray tones, no halftones, high contrast, spotted blacks, negative space, ink wash, comic book panel. Medium side shot at eye level of a bar interior at night. A thin man with ponytail slumped over a bar counter, forehead resting on crossed arms, leather jacket wrinkled on his back. Seven empty drinking glasses arranged along the polished bar surface with uneven spacing, varying heights, one glass tipped on its side. Bartender as a large dark silhouette looming in the background, only white shirt collar visible. Bar counter rendered as a single white horizontal line against black. Reflections of glasses as white vertical streaks on dark surface. Heavy spotted blacks in background, minimal detail, dramatic chiaroscuro lighting from above. No text, no speech bubbles.
```

### Параметры

| Параметр | Значение |
|----------|---------|
| Aspect ratio | 21:9 (ultra-wide — full-width strip) |
| Variants | 5 |
| Seeds | 2001, 2137, 2274, 2411, 2548 |
| Spot color | Нет |

### Заметки Сэм

- **Ключевой элемент:** 7 стаканов. Flux плохо считает — ожидать 5-9 стаканов, выбирать вариант ближе к 7. Ручная коррекция (дорисовать/убрать) допустима для прототипа.
- **Visual rhyme:** Стаканы ДОЛЖНЫ ощущаться как эхо чаек со стр. 1 — неравномерная расстановка, один "выпавший" (на боку vs удалённая чайка).
- **Горизонталь бара:** Рифмует с горизонталью океана на стр. 1. Это не случайность — убедиться, что bar counter читается как линия.
- **21:9 ratio:** Сильно вытянутый, кинематографичный. Если Flux даст слишком тесную композицию — попробовать 3:1 custom.
- **Бармен:** Должен быть массивным тёмным силуэтом без деталей — pressure figure. Если Flux нарисует лицо — отбраковка.

---

## PANEL 5.1 — Library Splash (Библиотека, одиночество)

### Из раскадровки

Полная страница (splash). Библиотека. Клаустрофобия: стеллажи сжимают пространство, не собор. Пустые полки стена-к-стене. Лампа с корнями = единственная округлая форма, тёплое белое свечение. Арни = маленький силуэт внизу по центру. Три двери = три тёмных прямоугольника в глубине. Камера: Low angle, от пола вверх.

### Промпт

```
Black and white ink illustration, Frank Miller Sin City style, pure black and white, no gray tones, no halftones, high contrast, spotted blacks, negative space, ink wash, comic book splash page. Dramatic low angle from floor looking upward. A claustrophobic library interior, tall dark bookshelves pressing inward from both sides like walls closing in, every shelf completely empty. A single ornate brass lamp with twisted root-shaped base standing in the center, casting a pool of white light, the only curved organic form in a world of sharp angles and straight lines. A small lone human silhouette standing at the bottom center of the composition, dwarfed by the towering shelves. Three dark rectangular doorways visible in the far back wall, evenly spaced, leading to unknown destinations. Oppressive vertical composition, massive black ceiling above, floors lost in shadow. Architectural claustrophobia, not grandeur. No text, no speech bubbles.
```

### Параметры

| Параметр | Значение |
|----------|---------|
| Aspect ratio | 2:3 (portrait — full page) |
| Variants | 5 |
| Seeds | 5001, 5137, 5274, 5411, 5548 |
| Spot color | Нет |

### Заметки Сэм

- **Ключевой элемент:** КЛАУСТРОФОБИЯ, не величие. Flux любит делать библиотеки грандиозными (собор знаний). Слова `claustrophobic`, `pressing inward`, `walls closing in` — контрмера.
- **Лампа с корнями:** Единственная округлая форма — визуальный якорь. Всё остальное = прямые линии и углы. Если Flux добавит округлости в архитектуру — отбраковка.
- **Масштаб фигуры:** Арни = МАЛЕНЬКИЙ силуэт. Если Flux сделает его крупным — пересид. `dwarfed by the towering shelves` — ключевая фраза.
- **Три двери:** Должны читаться как три ТЁМНЫХ прямоугольника в глубине, не как детализированные двери с ручками. Минимализм.
- **Пустые полки:** `every shelf completely empty` — критично. Flux может заполнить полки книгами по инерции. Тройная страховка.

---

## PANEL 8.1 — Alice Reveal (первый spot color)

### Из раскадровки

Full width × 1/3. REVEAL. Алиса поднимает глаза. Лицо: симметричное, фиксированный взгляд. Красивое, но что-то не так. Волосы убраны идеально. Машинно-ровный контур (у всех остальных — живая линия). Камера: Medium close-up, фронтально, eye level. Spot color: Sage #839E75 — блокнот.

### Промпт

```
Black and white ink illustration, Frank Miller Sin City style, high contrast, spotted blacks, negative space, ink wash, comic book panel. Medium close-up portrait, frontal view, eye level. A young woman with severe beauty looks directly at the viewer with an unnervingly fixed unblinking gaze. Face perfectly bilateral symmetric, sharp cheekbones, thin precise lips, resembling Rooney Mara. Hair pulled back tightly in a sleek style, not a single strand out of place. She holds a notebook rendered in sage green color #839E75, the ONLY color element in the entire image, everything else pure black and white. Her contour line is unnaturally clean and precise, like a vector illustration, unlike natural hand-drawn ink. Behind her, suggestion of a rainy park with bare trees. Rain as white diagonal streaks. Her posture is perfectly upright, almost mechanical. No text, no speech bubbles.
```

### Параметры

| Параметр | Значение |
|----------|---------|
| Aspect ratio | 3:1 или 21:9 (ultra-wide strip) |
| Variants | 5 |
| Seeds | 8001, 8137, 8274, 8411, 8548 |
| Spot color | Sage #839E75 (блокнот ONLY) |

### Заметки Сэм

- **КРИТИЧЕСКАЯ ПАНЕЛЬ.** Alice reveal — first impression. Если uncanny valley не сработает — вся механика ИИ-секрета рушится.
- **Spot color:** Sage ТОЛЬКО на блокноте. Flux может "расплескать" цвет на одежду или фон. `the ONLY color element in the entire image` — ключевая фраза. При ревью проверять: sage строго на блокноте?
- **Uncanny valley:** Ключевые слова `unnervingly fixed unblinking gaze`, `perfectly bilateral symmetric`, `almost mechanical`, `unnaturally clean and precise, like a vector illustration`. Flux может сделать просто красивую женщину без тревожности — тогда нужно усилить `unsettling`, `eerie precision`.
- **Альтернативный промпт (если основной не даёт uncanny):**
  ```
  ...same but add: Her eyes are too still, her expression too perfect, like a photograph
  that has been digitally smoothed until it lost something human. The uncanny valley of
  perfect beauty.
  ```
- **Контур:** Машинная точность vs hand-drawn у остальных — это различие НЕ будет работать в одной изолированной панели. Эффект появляется только при сравнении с другими панелями. Для прототипа — ОК, просто зафиксировать стиль.
- **Аспект:** 3:1 для strip-формата может быть проблемой — слишком узкая полоса для портрета. Альтернатива: 3:2 (landscape) и кропнуть при вёрстке.

### Fallback (если spot color не работает)

Сгенерировать полностью ч/б, sage добавить в пост-продакшн (Photoshop/GIMP: выделить блокнот → наложить цвет). Это надёжнее, чем ждать от Flux точного spot color.

---

## PANEL 9.1 — Арни уходит (Pitch Deck Hero Image)

### Из раскадровки

Half-page. KEY PANEL ДЛЯ PITCH DECK. Арни уходит. Спина к зрителю. Дождь, кирпичная пыль, Темза. Силуэт Алисы на скамейке за ним — маленький. Расстояние = вся ширина панели. Камера: Wide, eye level, вслед Арни.

### Промпт

```
Black and white ink illustration, Frank Miller Sin City style, pure black and white, no gray tones, no halftones, high contrast, spotted blacks, negative space, ink wash, comic book panel. Wide establishing shot at eye level following a man walking away from the viewer. A thin man in leather jacket seen from behind, ponytail visible at the back of his head, walking into heavy rain toward a river. Far behind him on the right side, a small solitary female figure sits on a park bench, barely visible, tiny compared to the walking man. Thames river visible in the middle distance as a white horizontal band. London brick buildings as dark geometric shapes in the background. Heavy rain rendered as white ink splatter and diagonal streaks across the entire composition. Massive distance and empty space between the two figures spanning the full width of the image. Cinematic depth, atmospheric perspective through rain. The walking figure occupies the left third, the seated figure the far right edge. No text, no speech bubbles.
```

### Параметры

| Параметр | Значение |
|----------|---------|
| Aspect ratio | 3:2 (landscape — half page) |
| Variants | 5 |
| Seeds | 9001, 9137, 9274, 9411, 9548 |
| Spot color | Нет |

### Заметки Сэм

- **HERO IMAGE для pitch deck.** Эта панель должна работать как самостоятельный постер. Одна картинка — и художник понимает проект.
- **Ключевой элемент:** РАССТОЯНИЕ между фигурами. Арни слева, Алиса далеко справа. Пустота между ними = весь комикс в одном кадре.
- **Дождь:** `ink splatter and diagonal streaks` — зубная щётка (toothbrush technique). Flux хорошо делает дождь в B&W. Если текстура дождя слишком однородная — попробовать `chaotic rain splatter, toothbrush ink technique`.
- **Опасность:** Flux может сделать Алису слишком крупной — она должна быть МАЛЕНЬКОЙ, на краю панели. `barely visible, tiny compared to the walking man` — ключевые слова.
- **Масштаб:** Арни = 1/3 высоты панели. Алиса = 1/10. Здания = фон. Река = линия. Дождь = всё остальное.
- **Для pitch deck:** Если промпт работает, эту панель можно использовать как обложку / hero image для питча художнику.

---

## ЧЕКЛИСТ РЕВЬЮ ПРОМПТОВ (Кира)

Перед генерацией — проверить каждый промпт:

- [ ] Sin City стиль описан? (no gray, spotted blacks, negative space)
- [ ] Камера указана? (angle, distance, POV)
- [ ] Масштаб персонажей корректен?
- [ ] Spot color только где нужно? (стр. 8-9)
- [ ] "No text, no speech bubbles" в конце?
- [ ] Aspect ratio соответствует панели?
- [ ] Ключевой элемент панели описан первым?

---

## ПЛАН ГЕНЕРАЦИИ

### Порядок

1. **Panel 1.1** (Shore) — устанавливает стиль, самый "стандартный" Sin City
2. **Panel 5.1** (Library) — проверяет архитектуру и масштаб
3. **Panel 2.3** (Bar) — проверяет interior и storytelling
4. **Panel 9.1** (Arni leaving) — проверяет дождь и два персонажа
5. **Panel 8.1** (Alice) — самый сложный (spot color + uncanny valley) — последним

### Бюджет

| | Панели | Варианты | Итого | Стоимость |
|--|--------|----------|-------|-----------|
| Round 1 | 5 | 5 | 25 | $1.00 |
| Round 2 (re-prompt) | ~2 | 5 | 10 | $0.40 |
| Round 3 (fine-tune) | ~1 | 5 | 5 | $0.20 |
| **Итого** | | | **~40** | **~$1.60** |

### Rate Limits

- Replicate <$5 credit: 6 req/min, burst 1
- Задержка между запросами: 11s + retry with backoff
- Estimated time: 25 images × 15s avg = ~6-7 минут

---

## ПОСТ-ПРОДАКШН

### Допустимые правки (прототип)

- Кроп/ресайз под формат панели
- Добавление spot color вручную (если Flux не справился)
- Удаление лишнего текста (Flux иногда добавляет)
- Коррекция контраста (levels: crush blacks, blow whites)

### Недопустимые правки (прототип)

- Перерисовка персонажей (подрывает оценку стиля)
- Дорисовка элементов (кроме spot color)
- Compositing нескольких генераций (это Tier 3, не Tier 1)
