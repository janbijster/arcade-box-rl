const _ = require('lodash');
const CONFIG = require('./config.json');

class InputManager {
  constructor (environment, trainersArray) {

    this.setEnvironmentInput = environment.passSetInputFunction();
    this.getEnvironmentOutput = environment.passGetOutputFunction();

    this.setTrainerInput = trainersArray.map(trainer => trainer.passSetInputFunction());
    this.getTrainerOutput = trainersArray.map(trainer => trainer.passGetOutputFunction());

    this.approve = trainersArray.map(trainer => trainer.passApproveFunction());
    this.disapprove = trainersArray.map(trainer => trainer.passDisapproveFunction());

    this.environmentInput = [
      Array(CONFIG.actionDim).fill(0),
      Array(CONFIG.actionDim).fill(0)
    ];
    this.trainerInput = [
      Array(15).fill(0),
      Array(15).fill(0)
    ];

    document.addEventListener('keypress', (event) => {
      const keyName = event.key;

      // approve/disapprove controls:
      if (keyName == '7') {
        // approve player 0
        this.approve[0]();
      } else if (keyName == '1') {
        // disapprove player 0
        this.disapprove[0]();
      } else if (keyName == '9') {
        // approve player 1
        this.approve[1]();
      } else if (keyName == '3') {
        // disapprove player 1
        this.disapprove[1]();
      }
    });

    window.requestAnimationFrame(this.update.bind(this));
  }

  update (timestamp) {

    [0, 1].forEach(playerIndex => {
      // get trainer output
      this.environmentInput[playerIndex] = this.getTrainerOutput[playerIndex]();
      // get environment output
      this.trainerInput[playerIndex] = this.getEnvironmentOutput(playerIndex);
      // pass on trainer output
      this.setEnvironmentInput(playerIndex, this.environmentInput[playerIndex]);
      // pass on environment output
      this.setTrainerInput[playerIndex](this.trainerInput[playerIndex]);
    });

    window.requestAnimationFrame(this.update.bind(this));
  }
}

export { InputManager };
