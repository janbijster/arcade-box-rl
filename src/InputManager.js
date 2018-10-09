const _ = require('lodash');

class InputManager {
  constructor (setEnvironmentInputFunction,
              getEnvironmentOutputFunction,
              setTrainerInputFunction,
              getTrainerOutputFunction,
              approveFunction,
              disapproveFunction) {

      this.setEnvironmentInput = setEnvironmentInputFunction;
      this.getEnvironmentOutput = getEnvironmentOutputFunction;

      this.setTrainerInput = setTrainerInputFunction;
      this.getTrainerOutput = getTrainerOutputFunction;

      this.approve = approveFunction;
      this.disapprove = disapproveFunction;

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

    this.environmentInput = [
      _.times(4, _.constant(0)),
      _.times(4, _.constant(0))
    ];
    this.trainerInput = [
      _.times(15, _.constant(0)),
      _.times(15, _.constant(0))
    ];

    document.addEventListener('keypress', (event) => {
      const keyName = event.key;
      // manual controls <-
      if (keyName in this.keyMapping) {
        const mapping = this.keyMapping[keyName];
        if (this.environmentInput[mapping.player][mapping.inputIndex] != mapping.force) {
          this.environmentInput[mapping.player][mapping.inputIndex] = mapping.force;
          this.setEnvironmentInput(mapping.player, this.environmentInput[mapping.player]);
        }
      }
      // -> end manual controls

      // approve/disapprove controls:
      if (keyName == '7') {
        // approve player 0
        this.approve(0, this.trainerInput[0], this.environmentInput[0])
      } else if (keyName == '1') {
        // disapprove player 0
        this.disapprove(0, this.trainerInput[0], this.environmentInput[0])
      } else if (keyName == '9') {
        // approve player 1
        this.approve(1, this.trainerInput[1], this.environmentInput[1])
      } else if (keyName == '3') {
        // disapprove player 1
        this.disapprove(1, this.trainerInput[1], this.environmentInput[1])
      }
    });

    document.addEventListener('keyup', (event) => {
      const keyName = event.key;
      // manual controls <-
      if (keyName in this.keyMapping) {
        const mapping = this.keyMapping[keyName];
        if (this.environmentInput[mapping.player][mapping.inputIndex] != 0) {
          this.environmentInput[mapping.player][mapping.inputIndex] = 0;
          this.setEnvironmentInput(mapping.player, this.environmentInput[mapping.player]);
        }
      }
      // -> end manual controls
    });

    window.requestAnimationFrame(this.update.bind(this));
  }

  update (timestamp) {
    [0, 1].forEach(playerIndex => {
      // get trainer output
      this.environmentInput[playerIndex] = this.getTrainerOutput(playerIndex);
      // get environment output
      this.trainerInput[playerIndex] = this.getEnvironmentOutput(playerIndex);
      // pass on trainer output
      this.setEnvironmentInput(playerIndex, this.environmentInput[playerIndex]);
      // pass on environment output
      this.setTrainerInput(playerIndex, this.trainerInput[playerIndex]);
    });

    window.requestAnimationFrame(this.update.bind(this));
  }
}

export { InputManager };
