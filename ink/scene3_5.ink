// Scene 3.5: CHARACTER REFLECTION — Inner Voice Micro-Story
// FQST-014.3 Content Expansion — Personal growth mechanics
// 3 panels: self-discovery, conflict, resolution

=== scene3_5 ===
~ current_scene = 3.5
~ micro_story_active = true

-> inner_voice

= inner_voice

# SCENE: character_reflection
# ACT: 1
# PANEL: panel-1.13

Минута тишины. В библиотеке есть места, где можно остаться наедине с собой — не только с книгами.

Что изменилось за эти недели? FolkUp рос, команда формировалась, Бреус приходил и уходил. Но внутри — что?

Зеркало души не висит на стене. Оно в выборах, которые делаешь, когда никто не смотрит.

{diary_choice == "read":
    Dr. Folkup писал: "Ключ в том, чтобы слушать. По-настоящему слушать." Но сначала нужно услышать себя.
- else:
    Иногда самые важные ответы лежат не в книгах, а в паузах между решениями.
}

# REFLECTION: personal
# CONTINUE

В этой тишине можно честно спросить себя: кто ты?

* [Исследовать свой путь]
    -> examine_path
* [Проанализировать страхи]
    -> analyze_fears
* [Понять свои ценности]
    -> understand_values

= examine_path
~ reflection_choice = "path"
~ self_awareness += 20

# PANEL: panel-1.14

Путь — это не линия на карте. Это серия решений, каждое из которых открывает новые двери и закрывает другие.

От студента до создателя проекта. От одиночества до команды. От идеи до воплощения.

{choice_5_refused:
    Отказ Брейсу был не просто "нет". Это было "да" самому себе — пути, который выбираешь сам.
- else:
    Даже если не отказался Брейсу сразу — процесс размышления показал, что важно.
}

Каждый выбор формирует не только проект, но и того, кто его создаёт.

{gonzo_trust >= 55:
    КиберГонзо видел patterns там, где другие видели хаос. Научил искать суть под поверхностью.
}

{dan_trust >= 55:
    Дэн с его блюзом показал: иногда лучшая технология — это просто честность.
}

# GROWTH: evident
# CONTINUE

Путь FolkUp — это путь создателя. Медленно, с ошибками, но своими руками.

-> reflection_synthesis

= analyze_fears
~ reflection_choice = "fears"
~ emotional_intelligence += 18

# PANEL: panel-1.14

Страхи не исчезают от того, что их игнорируешь. Они ждут в углах — и лучше встретить их лицом к лицу.

Страх неудачи: проект может не выстрелить, команда может разойтись, идея может оказаться пустой.

Страх успеха: если получится — придётся соответствовать, нести ответственность, принимать решения за других.

Страх одиночества: что если команда уйдёт? Что если останешься один с кодом и пустыми обещаниями?

{has_breus_analysis:
    Размышления о Брейсе помогли понять: страх перед независимостью — это тоже страх.
}

Но каждый страх — это информация. О том, что важно, что можно потерять, за что стоит бороться.

# HONESTY: brutal
# CONTINUE

Страхи не исчезают — но перестают управлять решениями.

-> reflection_synthesis

= understand_values
~ reflection_choice = "values"
~ value_clarity += 25

# PANEL: panel-1.14

Ценности — это то, что остаётся, когда убираешь всё наносное. Проекты, деньги, признание — всё это tools. Но для чего?

Свобода: не от ответственности, а для творчества. Возможность строить то, во что веришь.

Команда: не как ресурс, а как семья идей. Люди, которые понимают без слов и дополняют без конкуренции.

Честность: в коде, в отношениях, в обещаниях. То, что Дэн называет "правильным звучанием".

{study_choice == "team":
    Study room reflection подтвердил: энтузиасты строят то, во что верят. Это foundation.
- else:
    Команда FolkUp собралась не случайно. Общие ценности — это invisible infrastructure.
}

Рост: не как scaling бизнеса, а как развитие людей. Когда проект помогает каждому стать лучше.

# VALUES: crystallized
# CONTINUE

Ценности не декларируются — они проявляются в выборах под давлением.

-> reflection_synthesis

= reflection_synthesis

{reflection_choice == "path":
    ~ personal_growth += 10
    ~ leadership_understanding += 8
    Путь создателя — это принятие ответственности за свои решения и их последствия.

    Зеркало души показывает не того, кем хочешь быть, а того, кем становишься через действия.

    *[Записать insights]
        ~ has_reflection_journal = true
        ~ micro_story_complete = true
        Записка: "Лидерство — это не позиция, а ответственность за последствия выборов."
        -> reflection_complete
}

{reflection_choice == "fears":
    ~ emotional_maturity += 12
    ~ self_acceptance += 7
    Страхи — это компас. Они указывают на то, что действительно важно.

    Courage не означает отсутствие страха. Означает действие despite страха.

    *[Записать insights]
        ~ has_reflection_journal = true
        ~ micro_story_complete = true
        Записка: "Courage — это не бесстрашие. Это действие вопреки страхам."
        -> reflection_complete
}

{reflection_choice == "values":
    ~ value_alignment += 15
    ~ authenticity += 10
    Ценности — это internal compass. Они помогают navigateть когда external signals contradictory.

    FolkUp строится на foundation values, не business metrics. Это sustainable approach.

    *[Записать insights]
        ~ has_reflection_journal = true
        ~ micro_story_complete = true
        Записка: "Values — это foundation для решений под неопределённостью."
        -> reflection_complete
}

= reflection_complete

Reflection complete. Внутренний голос стал чуть яснее, direction — чуть определеннее.

FolkUp — это не просто проект. Это manifestation of values в code, relationships, и choices.

{has_diary && has_breus_analysis:
    ~ wisdom_synthesis += 20
    ~ folk_counter += 12
    Dr. Folkup, Бреус, внутренний голос — все эти perspectives формируют понимание того, кем ты становишься.
- else:
    ~ folk_counter += 8
    Reflection помог понять: самые важные решения принимаются в тишине, наедине с собой.
}

*[Вернуться к основному пути]
    ~ micro_story_active = false
    ~ current_scene = 2
    -> scene2.scene2_doors