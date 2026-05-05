/**
 * Minimal test to debug the specific "refuse" path issue
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Story } from 'inkjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storyJson = readFileSync(resolve(__dirname, '../public/story.json'), 'utf-8');

console.log('DEBUG: Testing refuse path specifically...\n');

try {
  const story = new Story(storyJson);

  // Skip to the final choice more directly
  // This is the path that leads to the final choice
  const choices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // The path from the error log

  for (let i = 0; i < choices.length; i++) {
    console.log(`Step ${i + 1}:`);

    // Continue until choices appear
    while (story.canContinue) {
      story.Continue();
    }

    if (story.currentChoices.length > 0) {
      console.log(`  Available choices: ${story.currentChoices.length}`);
      story.currentChoices.forEach((choice, idx) => {
        console.log(`    ${idx}: "${choice.text.substring(0, 50)}"`);
      });

      const choiceIndex = choices[i];
      console.log(`  Choosing: ${choiceIndex}`);
      story.ChooseChoiceIndex(choiceIndex);
    } else {
      console.log('  No choices available');
      break;
    }
  }

  // Now we should be at the final choice - try to make the refuse choice (index 1)
  console.log('\n=== FINAL CHOICE ATTEMPT ===');

  // Continue to present final choices
  while (story.canContinue) {
    const text = story.Continue();
    console.log('Content:', text.substring(0, 100) + '...');
  }

  if (story.currentChoices.length > 0) {
    console.log('Final choices available:');
    story.currentChoices.forEach((choice, idx) => {
      console.log(`  ${idx}: "${choice.text}"`);
    });

    // Try the refuse choice (index 1)
    console.log('\nAttempting refuse choice (index 1)...');
    story.ChooseChoiceIndex(1);

    // Try to continue after the choice
    let stepCount = 0;
    while (story.canContinue && stepCount < 10) {
      try {
        const text = story.Continue();
        console.log(`After refuse - Step ${stepCount}: ${text.substring(0, 100)}`);
        stepCount++;
      } catch (err) {
        console.error(`ERROR at step ${stepCount}:`, err.message);
        break;
      }
    }

    console.log(`Final state: canContinue=${story.canContinue}, choices=${story.currentChoices.length}`);
  } else {
    console.log('No final choices found!');
  }

} catch (err) {
  console.error('Error:', err.message);
}