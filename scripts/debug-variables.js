/**
 * Debug script to check variable values after refuse choice
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Story } from 'inkjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storyJson = readFileSync(resolve(__dirname, '../public/story.json'), 'utf-8');

console.log('DEBUG: Checking variables after refuse choice...\n');

try {
  const story = new Story(storyJson);

  // Navigate to final choice (same path as before)
  const choices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < choices.length; i++) {
    while (story.canContinue) {
      story.Continue();
    }
    if (story.currentChoices.length > 0) {
      story.ChooseChoiceIndex(choices[i]);
    }
  }

  // Present final choices
  while (story.canContinue) {
    story.Continue();
  }

  console.log('Before refuse choice:');
  console.log(`  final_choice = "${story.variablesState.final_choice}"`);
  console.log(`  folk_counter = ${story.variablesState.folk_counter}`);
  console.log(`  current_scene = ${story.variablesState.current_scene}`);

  // Make refuse choice
  story.ChooseChoiceIndex(1);

  console.log('\nAfter refuse choice:');
  console.log(`  final_choice = "${story.variablesState.final_choice}"`);
  console.log(`  folk_counter = ${story.variablesState.folk_counter}`);
  console.log(`  current_scene = ${story.variablesState.current_scene}`);

  // Try to continue and see what happens
  let stepCount = 0;
  while (story.canContinue && stepCount < 10) {
    try {
      const text = story.Continue();
      console.log(`\nStep ${stepCount}: ${text.substring(0, 100)}`);
      console.log(`  Variables: final_choice="${story.variablesState.final_choice}", current_scene=${story.variablesState.current_scene}`);
      stepCount++;
    } catch (err) {
      console.error(`\nERROR at step ${stepCount}:`, err.message);
      console.log(`  Variables at error: final_choice="${story.variablesState.final_choice}", current_scene=${story.variablesState.current_scene}`);
      break;
    }
  }

} catch (err) {
  console.error('Error:', err.message);
}