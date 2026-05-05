// Scene 10.5: Minimal test version

=== scene10_5_minimal ===
~ current_scene = 10.5

{final_choice == "refuse":
    Minimal refuse content for testing.

    * [Test choice 1] -> test_path1
    * [Test choice 2] -> test_path2

    = test_path1
        Test path 1 selected.
        -> scene11

    = test_path2
        Test path 2 selected.
        -> scene11
}

{final_choice == "accept":
    Accept content.
    -> scene11
}

{final_choice == "counter_offer":
    Counter offer content.
    -> scene11
}