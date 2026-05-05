/**
 * Debug script to test conditional logic
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Story } from 'inkjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storyJson = readFileSync(resolve(__dirname, '../public/story.json'), 'utf-8');

console.log('DEBUG: Testing conditional logic...\n');

try {
  const story = new Story(storyJson);

  // Create a simple test story string to validate conditional syntax
  const testInk = `
  VAR test_choice = ""

  === test_conditional ===
  ~ test_choice = "refuse"

  The choice was set to: {test_choice}

  {test_choice == "refuse":
      This should appear if refuse works!
  }

  {test_choice == "accept":
      This should NOT appear.
  }

  End of test.

  -> END
  `;

  // Test with a simple inline story to validate syntax
  const testStory = new Story(testInk);

  console.log('Testing basic conditional logic:');
  while (testStory.canContinue) {
    const text = testStory.Continue();
    console.log(text);
  }

  console.log('\nNow testing the actual story...');

  // Navigate to the actual story failure point
  const choices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < choices.length; i++) {
    while (story.canContinue) {
      story.Continue();
    }
    if (story.currentChoices.length > 0) {
      story.ChooseChoiceIndex(choices[i]);
    }
  }

  while (story.canContinue) {
    story.Continue();
  }

  // Make refuse choice
  story.ChooseChoiceIndex(1);

  // Check what scene10_5 actually contains at this point
  console.log('\nAfter refuse choice, trying to get scene10_5 content...');
  console.log(`Current variables: final_choice="${story.variablesState.final_choice}", current_scene=${story.variablesState.current_scene}`);

  // Manually continue through each line to see where it fails
  let content = '';
  let stepCount = 0;
  while (story.canContinue && stepCount < 20) {
    try {
      const text = story.Continue();
      content += text;
      console.log(`Step ${stepCount}: "${text.trim()}"`);

      if (text.includes('scene10_5') || text.includes('10.5')) {
        console.log('  ^^ Found scene10_5 reference!');
      }

      stepCount++;
    } catch (err) {
      console.error(`\nERROR at step ${stepCount}:`, err.message);
      console.log(`Variables at error: final_choice="${story.variablesState.final_choice}", current_scene=${story.variablesState.current_scene}`);
      console.log(`Last content: "${content.slice(-200)}"`);
      break;
    }
  }

} catch (err) {
  console.error('Error:', err.message);
}