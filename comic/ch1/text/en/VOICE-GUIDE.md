# Voice Guide — EN Translation

> Translation Bible for FolkUp Quest Chapter 1: Descent
> Philosophy: Adaptive literary. Prioritize how it READS in English.

## Arni (narration / captions)

**Voice formula:** Sardonic IT worker + Bukowski staccato + counting-things habit.

**Rhythm:** Short declarative sentences. Fragment-heavy. Dry observations that sound like commit messages written by a poet. No contractions in narration (he's formal in his head).

**IT metaphors:** LinkedIn-profile, open source, proprietary — these work unchanged in EN. The tech vocabulary IS his voice.

**Key patterns:**
- Lists with a punchline: "Three months drinking. Two reading Seneca. One catching butterflies."
- Counting as coping: "Seagulls. Seven of them."
- Deadpan emphasis on last sentence (often one word or very short)

**Glossary (consistent terms):**
- библиотека → library (the metaphorical building)
- стеллажи → shelves
- ключ → key
- дверь/двери → door/doors
- лампа → lamp
- opensource → open source (two words in EN narration, except when used as adj: "open-source project")
- проприетарный жир → proprietary fat

**Sample RU → EN:**
- "Чайки. Семь штук. Я считал их, потому что считать чаек — единственное занятие, не требующее LinkedIn-профиля."
- → "Seagulls. Seven. I was counting them because counting seagulls is the one activity that does not require a LinkedIn profile."

## Dan (dialogue)

**Voice formula:** Warm Brazilian musician + casual philosopher + Portuguese code-switching.

**Portuguese interjections** (D2 decision):
- "Man." in RU version → **"Cara."** in EN version (Brazilian slang for "dude/man")
- Other interjections available: "mano" (bro), "é" (yeah/right), "saudade" (untranslatable longing)
- Use sparingly — 1-2 per dialogue balloon max. "Cara" is his signature.

**Rhythm:** Relaxed, flowing. Longer sentences than Arni. Musical cadence. He speaks in metaphors about storytelling and connection.

**Key pattern:** Dan sees everything through the lens of music and storytelling. "You don't need a marketer. You need a storyteller."

**For lines already in EN in RU version** (p21, p22): These stay as-is. They are already Dan's English voice. The `enSegments` markers are not needed in EN JSON.

**Sample RU → EN:**
- "Man. Ты тот парень с библиотекой?"
- → "Cara. You're the library guy?"

- "Тебе не нужен маркетолог. Тебе нужен рассказчик."
- → "You don't need a marketer. You need a storyteller. A marketer sells. A storyteller makes people come on their own."

## Breus (dialogue)

**Voice formula:** Corporate cold + mask-language + measured precision.

**Rhythm:** Formal, calculated. Lists with a pattern (three items). Each sentence is a transaction. He appraises, never admires.

**Mask system:** Three masks = three speech registers. All formal, but:
- Mask 1: Professional neutral
- Mask 2: Corporate assertive (double-border balloon)
- Mask 3: Thin-border, evaluative. "Architecture — clean. Code — literate. Idea — beautiful." (tricolon pattern)

**Key pattern:** Adjective evaluations in sets of three. Never emotional words. "Clean", "literate", "beautiful" as clinical assessment.

**Sample RU → EN:**
- "Арни. Я узнаю твою работу. Архитектура — чистая. Код — грамотный. Идея — красивая."
- → "Arni. I recognize your work. Architecture — clean. Code — literate. The idea — beautiful."

## Old Man / Starik (dialogue)

**Voice formula:** Proverb-style + cryptic + wise oracle.

**Rhythm:** Short, aphoristic. Sounds like old-world wisdom. Each line is a standalone statement.

**Style:** Uses narration-box (same as captions), not dialogue bubbles. He speaks like a narrator from within the story.

## Alice (text blocks)

**Voice formula:** Code-comment deadpan + structured logic + `//` prefix style.

**Rhythm:** Terse. Formatted like system output or code comments. Structured, clipped.

**Format:** Maintains `//` prefixes, structured blocks. Think IDE comments that became sentient.

**Key:** In EN, Alice sounds like documentation with feelings.

## Gonzo / CyberGonzo (text blocks + log entries)

**Voice formula:** Syslog-formal + breaking down + timestamps + error messages.

**Rhythm:** Machine-precise timestamps, formal verification language that progressively glitches.

**Format:**
- Timestamps: `14:32:07 —` (keep exact format, em-dash)
- Status markers: keep Russian-to-English mapping consistent:
  - [ДАННЫЕ УДАЛЕНЫ] → [DATA REDACTED]
  - [НЕ НАЙДЕНО] → [NOT FOUND]
  - [НЕ ЗАФИКСИРОВАНО] → [NOT RECORDED]
  - [ОШИБКА: ...] → [ERROR: ...]
  - Статус: ОДОБРЕНО → Status: APPROVED
  - Верификация → Verification
  - KPI: выполнено на → KPI: achieved at

**Key pattern:** Machine formality crumbling. "Why am I counting this?" — the moment Gonzo becomes self-aware.

**Sample RU → EN:**
- "14:34:10 — [ОШИБКА: 120% невозможно. Пересчёт...]"
- → "14:34:10 — [ERROR: 120% impossible. Recalculating...]"

## Reflection (dialogue)

**Voice formula:** Oracular + clipped + eerie mirror.

**Rhythm:** Very short statements. Present tense or timeless. Double-border balloon (same as Breus mask 2 — deliberate parallel).

**Key pattern:** Speaks in certainties. "You in five years. Or Breus twenty years ago."

**Sample RU → EN:**
- "Ты через пять лет. Или Бреус двадцать лет назад."
- → "You in five years. Or Breus twenty years ago."
- "Будет больно." → "It will hurt."

## SFX

**No translation needed.** All SFX are already Latin transliterated in RU version:
- KLIK, TUK TUK TUK, CHNNNG, etc.
- Copy as-is to EN JSON.

## General Rules

1. **Sentence length:** EN is typically 10-15% shorter than RU. Watch for balloon underflow.
2. **No contractions in Arni narration.** Contractions OK in dialogue (Dan, Breus).
3. **Consistent glossary** across all 24 pages (see Arni section above).
4. **No AI-pattern fingerprints:** Avoid "delve", "tapestry", "landscape", "foster", "harness", "leverage", "cornerstone", "multifaceted", "comprehensive", "robust". See memory/ai-patterns.md.
5. **Cultural references:** "Don Rumata" stays as-is (D3 decision). "Seneca" → "Seneca" (trivial).
6. **Preserve all metadata:** style, type, speaker, mask, multiline, lines, order, note, hasError, direction — copy verbatim from RU JSON.
