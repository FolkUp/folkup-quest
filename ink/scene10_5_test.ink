// Scene 10.5 TEST: Simple version to debug conditional issue

=== scene10_5_test ===
~ current_scene = 10.5

Test scene loaded. final_choice is: "{final_choice}"

{final_choice == "refuse":
    REFUSE block triggered successfully!

    * [Test choice 1] -> test_end
    * [Test choice 2] -> test_end
}

{final_choice == "accept":
    ACCEPT block triggered successfully!

    * [Test choice 1] -> test_end
    * [Test choice 2] -> test_end
}

{final_choice == "counter_offer":
    COUNTER_OFFER block triggered successfully!

    * [Test choice 1] -> test_end
    * [Test choice 2] -> test_end
}

= test_end

Test complete. Going to scene11.

-> scene11