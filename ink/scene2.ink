// Scene 2: БИБЛИОТЕКА — HUB
// Act 1, Choice 1 (navigation, ±0 folk_counter)
// Tone: Pelevin 50% + Kharms 30% + Pain 20%
// Returns here after each area visit. When all 3 visited → Scene 7.

=== scene2 ===
~ current_scene = 2
~ current_act = 1

# SCENE: library
# ACT: 1
# PANEL: panel-1.2

{scene2 < 2:
    -> scene2_first_visit
- else:
    -> scene2_return
}

= scene2_first_visit

Библиотека. Дуб и латунь. Потолок метров пять, но кажется выше, потому что пустота умеет растягивать пространство — примерно как тоска растягивает воскресенье.

Стеллажи от пола до того места, где нормальный человек перестаёт доставать без стремянки. Пустые. Все до единого. Ни одной книги, ни одного файла. Паук в углу третьей полки слева — единственный, кто занимается здесь созданием контента.

На столе — лампа. Кованая, с основанием в форме корней, или с корнями в форме основания — зависит от того, ботаник ты или дизайнер. Горит тёплым светом. Никто её не включал. Или кто-то включил давно и забыл, а она решила не напоминать.

# LAMP: steady
# CONTINUE

Три двери.

Левая — из-за неё тянет дождём и кирпичной пылью. На косяке табличка: «SW13». Мелом, детским почерком, будто писали стоя на цыпочках: *«Тут играет музыка. Иногда.»*

Средняя — земля. Тёплая, прелая, грибная земля. Табличка: «Cogumelos». Мелом, другим почерком, размашистым и злым: *«Не всё, что растёт, съедобно. Проверяй.»*

Правая — ничем не пахнет. Табличка стёрта, но кто-то написал мелом поверх, аккуратно: *«Ты знаешь, куда это ведёт.»*

-> scene2_doors

= scene2_return

Библиотека. Лампа. Стеллажи — уже не совсем пустые.

{visited_barnes: На третьей полке — папка. Тонкая, коричневая, подписана от руки: «Barnes, SW13». Алисин почерк. Связи между вещами, которые никто не замечал.}
{visited_cogumelos: На второй полке — ещё одна. Толще. «Cogumelos». Данные КиберГонзо — проверенные, перепроверенные и проверенные ещё раз, на всякий случай.}
{visited_retrotech: На первой полке — аудиофайл, если аудиофайлы можно класть на полку. «Retro-Tech». Дэн прислал из Чикаго. Три аккорда и тишина.}

Лампа горит. Двери ждут.

# LAMP: steady

-> scene2_doors

= scene2_doors

// Check if all areas visited → advance to Scene 7
{visited_barnes && visited_cogumelos && visited_retrotech:
    Все три двери были открыты. Все три — пройдены. Стеллажи ещё почти пустые, но «почти» — это уже не «совсем», а разница между «совсем» и «почти» примерно как между нулём и единицей: математически — один шаг, экзистенциально — пропасть.

    Стук в главную дверь. Уверенный, размеренный, с паузой после третьего удара — так стучат люди, привыкшие, что им открывают.

    # CONTINUE

    -> scene7
}

* {not visited_barnes} [Левая дверь — дождь и кирпич]
    Арни толкнул левую дверь. Дождь ударил в лицо — не весь, а тот частный английский дождь, который идёт одновременно со всех сторон и ни с одной.
    -> scene3

* {not visited_cogumelos} [Средняя дверь — земля и грибы]
    Арни толкнул среднюю дверь. Пахнуло пробковым дубом, красной землёй и чем-то, что может быть грибами, а может быть правдой — и то и другое растёт в темноте.
    -> scene4

* {not visited_retrotech && saw_flashback_stick} [Правая дверь]
    Арни толкнул правую дверь. За ней — не комната. Экран. Синий свет видеозвонка и далёкий звук гитары.
    -> scene5

* {not visited_retrotech && not saw_flashback_stick} [Правая дверь — что-то знакомое]
    Арни потянулся к правой двери. Ручка латунная, тёплая. Как ключ в кармане. Пальцы узнали металл раньше, чем голова — память.
    * * [Вспомнить, откуда ключ]
        -> scene1_5
    * * [Открыть]
        -> scene5

* {not micro_story_active} [Изучить угол библиотеки]
    -> scene2_5

* {not micro_story_active && (choice_5_listened || choice_5_refused)} [Найти тихое место для размышлений]
    -> scene2_7

* {not micro_story_active && folk_counter && (has_diary || has_breus_analysis)} [Остаться наедине с собой]
    -> scene3_5

* {not micro_story_active && has_breus_analysis && has_reflection_journal} [Синтез всех insights — скрытая история]
    -> hidden_synthesis

= hidden_synthesis

# SCENE: synthesis_discovery
# ACT: 1
# PANEL: panel-1.16

~ discovery_unlocked = true
~ micro_story_active = true

Все insights собираются в единую картину. Library corner, study room reflection, внутренний голос — три зеркала одной истории.

Dr. Folkup оставил дневник не случайно. Бреус пришёл не случайно. Твоё reflection — тоже не случайность.

Закономерности становятся видимы только тогда, когда готов их увидеть.

# DISCOVERY: profound
# CONTINUE

{diary_choice == "read" && study_choice == "motives" && reflection_choice == "values":
    ~ perfect_synthesis = true
    ~ folk_counter += 25
    ~ master_insight = true

    Полная картина: Dr. Folkup верил в мосты между историями. Бреус видел только transactions. Ты выбрал values как foundation.

    Это не три разных пути — это одна эволюция understanding. От чтения мудрости к анализу угроз к пониманию себя.

    FolkUp — это продолжение работы Dr. Folkup, но твоими hands и твоими values.

    # MASTERY: achieved
    # CONTINUE

    *[Записать master insight]
        ~ has_master_understanding = true
        Записка: "FolkUp — это мост между прошлой мудростью и будущими возможностями. Dr. Folkup начал. Я продолжаю."
        -> synthesis_complete

- else:
    ~ folk_counter += 15
    ~ deep_insight = true

    Каждая micro-story добавила кусочек понимания. Вместе они формируют более глубокий взгляд на то, что строишь.

    Business decisions, personal values, legacy работы — всё interconnected в экосистеме FolkUp.

    # INSIGHT: integrated
    # CONTINUE

    *[Записать integrated insight]
        ~ has_integrated_understanding = true
        Записка: "Micro-decisions формируют macro-direction. Каждый выбор важен."
        -> synthesis_complete
}

= synthesis_complete

Скрытая история revealed. Библиотека стала не просто местом работы — стала space для роста.

~ micro_story_active = false

*[Вернуться к основному пути]
    -> scene2_doors
