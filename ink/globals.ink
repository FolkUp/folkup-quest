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

// PHASE 1B-FULL: Extended Character Development Variables (FQST-017)
VAR has_emotional_clarity = false
VAR has_practical_clarity = false
VAR has_team_clarity = false
VAR pragmatic_approach = 0
VAR integrated_self_view = 0
VAR inner_harmony = 0
VAR complex_thinking = 0
VAR independence = 0
VAR isolation_risk = 0
VAR action_orientation = 0
VAR self_reflection_avoidance = 0
VAR leadership_adaptation = 0
VAR negotiation_preparation = 0
VAR team_input_integration = 0
VAR professional_development = 0
VAR negotiation_strategy = 0
VAR business_acumen = 0
VAR creative_control = 0
VAR compromise_strategy = 0
VAR diplomatic_approach = 0

// Extended Character Stats (FQST-017)
VAR financial_independence = 0
VAR self_reliance = 0
VAR authentic_path = 0
VAR full_responsibility = 0
VAR defensive_strategy = 0
VAR team_protection = 0
VAR unbreakable_bond = 0
VAR shared_destiny = 0
VAR win_win_thinking = 0
VAR innovative_solution = 0
VAR persuasion_strategy = 0
VAR business_psychology = 0
VAR negotiation_confidence = 0
VAR team_support = 0

// Psychological Development Variables
VAR honest_self_assessment = 0
VAR confidence_in_uncertainty = 0
VAR philosophical_thinking = 0
VAR acceptance_of_imperfection = 0
VAR visionary_thinking = 0
VAR strategic_imagination = 0
VAR future_orientation = 0
VAR future_planning_wisdom = 0
VAR process_orientation = 0
VAR introspection_skill = 0
VAR psychological_insight = 0
VAR unconventional_thinking = 0
VAR creativity = 0

// Additional Character Development Variables (FQST-010 Fix)
VAR creative_freedom = 0
VAR risk_management = 0
VAR mutual_trust = 0
VAR collective_strength = 0
VAR negotiation_skill = 0
VAR creative_problem_solving = 0
VAR business_innovation = 0
VAR strategic_anticipation = 0
VAR people_reading_skill = 0
VAR team_coordination = 0
VAR presentation_skill = 0
VAR collective_preparation = 0
