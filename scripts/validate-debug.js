/**
 * Debug Story validation — check all paths reach an ending with better error reporting
 * Traverses all possible choice combinations
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Story } from 'inkjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storyJson = readFileSync(resolve(__dirname, '../public/story.json'), 'utf-8');

let totalPaths = 0;
let completedPaths = 0;
let errors = [];

function explorePaths(story, path = []) {
  try {
    // Continue until choices or end
    while (story.canContinue) {
      try {
        story.Continue();
      } catch (err) {
        console.error(`ERROR during Continue() at path: ${path.join(' → ')}`);
        console.error(`Error: ${err.message}`);
        console.error(`canContinue: ${story.canContinue}, choices: ${story.currentChoices.length}`);
        throw err;
      }
    }

    if (story.currentChoices.length > 0) {
      // Explore each choice
      for (let i = 0; i < story.currentChoices.length; i++) {
        const choiceText = story.currentChoices[i].text.substring(0, 40);
        const savedState = story.state.toJson();

        story.ChooseChoiceIndex(i);
        explorePaths(story, [...path, `Choice ${i}: "${choiceText}"`]);

        // Restore state to try next choice
        story.state.LoadJson(savedState);
      }
    } else {
      // Path complete
      totalPaths++;
      completedPaths++;
      console.log(`  PATH ${totalPaths}: ${path.join(' → ') || 'linear'} → END`);
    }
  } catch (err) {
    console.error(`Path exploration failed at: ${path.join(' → ')}`);
    console.error(`Error: ${err.message}`);
    errors.push(`${path.join(' → ')}: ${err.message}`);
  }
}

console.log('DEBUG: Validating story paths...\n');

try {
  const story = new Story(storyJson);
  explorePaths(story);

  console.log(`\nResults:`);
  console.log(`  Total paths: ${totalPaths}`);
  console.log(`  Completed:   ${completedPaths}`);
  console.log(`  Errors:      ${errors.length}`);

  if (errors.length > 0) {
    console.error('\nERRORS:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('\nOK: All paths reach an ending.');
} catch (err) {
  console.error('Validation error:', err.message);
  process.exit(1);
}