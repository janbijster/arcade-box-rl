class InputManager {
  constructor (setInputFunction) {

    this.setInput = setInputFunction;

    // for now, just map keypresses to inputs
    this.keyMapping = {
      a: { inputIndex: 0, force: -1 },
      q: { inputIndex: 0, force: 1 },
      s: { inputIndex: 1, force: -1 },
      w: { inputIndex: 1, force: 1 },
      d: { inputIndex: 2, force: -1 },
      e: { inputIndex: 2, force: 1 },
      f: { inputIndex: 3, force: -1 },
      r: { inputIndex: 3, force: 1 },
      g: { inputIndex: 4, force: -1 },
      t: { inputIndex: 4, force: 1 },
      h: { inputIndex: 5, force: -1 },
      y: { inputIndex: 5, force: 1 },
      j: { inputIndex: 6, force: -1 },
      u: { inputIndex: 6, force: 1 },
      k: { inputIndex: 7, force: -1 },
      i: { inputIndex: 7, force: 1 }
    };

    this.input = new Array(8).fill(0);

    document.addEventListener('keypress', (event) => {
      const keyName = event.key;
      if (keyName in this.keyMapping) {
        const mapping = this.keyMapping[keyName];
        if (this.input[mapping.inputIndex] != mapping.force) {
          this.input[mapping.inputIndex] = mapping.force;
          this.setInput(this.input);
        }
      }
    });

    document.addEventListener('keyup', (event) => {
      const keyName = event.key;
      if (keyName in this.keyMapping) {
        const mapping = this.keyMapping[keyName];
        if (this.input[mapping.inputIndex] != 0) {
          this.input[mapping.inputIndex] = 0;
          this.setInput(this.input);
        }
      }
    });
  }
}

export { InputManager };
