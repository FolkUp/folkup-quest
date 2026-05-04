// FolkUp Quest — Global Variables
// Moral system: folk_counter 0-100, start at 50
// Higher = more Folk, Lower = more Dragon

VAR folk_counter = 50

// Trust levels per character (0-100)
VAR alice_trust = 50
VAR gonzo_trust = 50
VAR dan_trust = 50

// Flashback flags
VAR saw_flashback_stick = false
VAR saw_flashback_young_breus = false

// Scene tracking
VAR current_scene = 0
VAR current_act = 1

// Choice tracking for ending determination
VAR choice_5_listened = false
VAR choice_5_refused = false
VAR scene9_broke_mirror = false
VAR choice_6_signed_blind = false
VAR choice_6_read_contract = false
VAR choice_6_other_way = false
VAR choice_6_consultation = false

// Navigation (Scene 2 door order)
VAR first_door = ""
VAR visited_barnes = false
VAR visited_cogumelos = false
VAR visited_retrotech = false

// Final choice for ending determination
VAR final_choice = ""

// Micro-Story System (FQST-014.1)
VAR micro_story_active = false
VAR diary_choice = ""
VAR has_diary = false
VAR knowledge_curiosity = 0
VAR respect_mystery = 0
VAR possession_instinct = 0

// Study Room Micro-Story System (FQST-014.2)
VAR study_choice = ""
VAR business_pragmatism = 0
VAR team_loyalty = 0
VAR insight_perception = 0
VAR has_breus_analysis = false
VAR business_understanding = 0
VAR team_bonds = 0
VAR strategic_thinking = 0

// Character Reflection Micro-Story System (FQST-014.3)
VAR reflection_choice = ""
VAR self_awareness = 0
VAR emotional_intelligence = 0
VAR value_clarity = 0
VAR has_reflection_journal = false
VAR micro_story_complete = false
VAR personal_growth = 0
VAR leadership_understanding = 0
VAR emotional_maturity = 0
VAR self_acceptance = 0
VAR value_alignment = 0
VAR authenticity = 0
VAR wisdom_synthesis = 0

// Discovery Mechanics System (FQST-014.4)
VAR discovery_unlocked = false
VAR perfect_synthesis = false
VAR master_insight = false
VAR has_master_understanding = false
VAR deep_insight = false
VAR has_integrated_understanding = false
