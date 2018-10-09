class InputManager {
  constructor (setInputFunction, getOutputFunction) {

    this.setInput = setInputFunction;
    this.getOutput = getOutputFunction;

    // for now, just map keypresses to inputs
    this.keyMapping = {
      a: { player: 0, inputIndex: 0, force: -1 },
      q: { player: 0, inputIndex: 0, force: 1 },
      s: { player: 0, inputIndex: 1, force: -1 },
      w: { player: 0, inputIndex: 1, force: 1 },
      d: { player: 0, inputIndex: 2, force: -1 },
      e: { player: 0, inputIndex: 2, force: 1 },
      f: { player: 0, inputIndex: 3, force: -1 },
      r: { player: 0, inputIndex: 3, force: 1 },
      g: { player: 1, inputIndex: 0, force: -1 },
      t: { player: 1, inputIndex: 0, force: 1 },
      h: { player: 1, inputIndex: 1, force: -1 },
      y: { player: 1, inputIndex: 1, force: 1 },
      j: { player: 1, inputIndex: 2, force: -1 },
      u: { player: 1, inputIndex: 2, force: 1 },
      k: { player: 1, inputIndex: 3, force: -1 },
      i: { player: 1, inputIndex: 3, force: 1 }
    };

    this.input = [
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    document.addEventListener('keypress', (event) => {
      const keyName = event.key;
      if (keyName in this.keyMapping) {
        const mapping = this.keyMapping[keyName];
        if (this.input[mapping.player][mapping.inputIndex] != mapping.force) {
          this.input[mapping.player][mapping.inputIndex] = mapping.force;
          this.setInput(mapping.player, this.input[mapping.player]);
        }
      }
    });

    document.addEventListener('keyup', (event) => {
      const keyName = event.key;
      if (keyName in this.keyMapping) {
        const mapping = this.keyMapping[keyName];
        if (this.input[mapping.player][mapping.inputIndex] != 0) {
          this.input[mapping.player][mapping.inputIndex] = 0;
          this.setInput(mapping.player, this.input[mapping.player]);
        }
      } else if (keyName == '7') {
        getOutputFunction(0)
      } else if (keyName == '1') {
        getOutputFunction(0)
      } else if (keyName == '9') {
        getOutputFunction(1)
      } else if (keyName == '3') {
        getOutputFunction(1)
      }
    });
  }
}

export { InputManager };
