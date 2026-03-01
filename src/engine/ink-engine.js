/**
 * Ink Engine — loads and runs compiled .ink stories
 */

export class InkEngine {
  /** @type {import('inkjs').Story} */
  story = null;

  /** @param {import('inkjs').Story} story */
  constructor(story) {
    this.story = story;
  }

  /**
   * Load story from Story instance
   * @param {import('inkjs').Story} storyInstance
   * @returns {InkEngine}
   */
  static fromStory(storyInstance) {
    return new InkEngine(storyInstance);
  }

  /** Check if more text is available */
  canContinue() {
    return this.story.canContinue;
  }

  /** Get available choices */
  getChoices() {
    return this.story.currentChoices.map((c, i) => ({
      index: i,
      text: c.text,
    }));
  }

  /** Check if there are choices */
  hasChoices() {
    return this.story.currentChoices.length > 0;
  }

  /**
   * Continue the story — get next text chunk
   * @returns {{ text: string, tags: string[] }}
   */
  continue() {
    if (!this.story.canContinue) {
      return { text: '', tags: [] };
    }
    const text = this.story.Continue();
    const tags = this.story.currentTags || [];
    return { text: text.trim(), tags };
  }

  /**
   * Continue until a tag-based break or no more text
   * Groups text between CONTINUE tags
   * @returns {{ paragraphs: string[], tags: string[], choices: Array }}
   */
  continueToBreak() {
    const paragraphs = [];
    const allTags = [];

    while (this.story.canContinue) {
      const text = this.story.Continue().trim();
      const tags = this.story.currentTags || [];

      if (text) {
        paragraphs.push(text);
      }
      allTags.push(...tags);

      // Stop at CONTINUE tag for pacing
      if (tags.includes('CONTINUE')) {
        break;
      }
    }

    return {
      paragraphs,
      tags: allTags,
      choices: this.hasChoices() ? this.getChoices() : [],
    };
  }

  /**
   * Make a choice
   * @param {number} choiceIndex
   */
  choose(choiceIndex) {
    this.story.ChooseChoiceIndex(choiceIndex);
  }

  /**
   * Get a variable value
   * @param {string} name
   * @returns {*}
   */
  getVariable(name) {
    return this.story.variablesState[name];
  }

  /**
   * Set a variable value
   * @param {string} name
   * @param {*} value
   */
  setVariable(name, value) {
    this.story.variablesState[name] = value;
  }

  /** Get full story state as JSON string */
  getState() {
    return this.story.state.toJson();
  }

  /** Restore story state from JSON string */
  loadState(stateJson) {
    this.story.state.LoadJson(stateJson);
  }

  /** Reset story to beginning */
  reset() {
    this.story.ResetState();
  }
}
