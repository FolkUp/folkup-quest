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
