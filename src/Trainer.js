import * as tf from '@tensorflow/tfjs';
const _ = require('lodash');

class Trainer {
  constructor () {

    this.inputDim = 15;
    this.outputDim = 4;
    // when to start training?
    this.minimumNumberOfSamples = 10;

    this.samples = [
      [], // samples for p1
      []  // samples for p2
    ];

    this.models = [
      this.makeModel(),
      this.makeModel()
    ];
    this.modelLock = [
      false,
      false
    ];

    this.input = [];
    this.output = [];

    window.requestAnimationFrame(this.update.bind(this));
  }

  makeModel() {
    let model = tf.sequential();
    let layer1Dim = Math.floor(0.5 * (this.inputDim + this.outputDim));
    model.add(tf.layers.dense({units: layer1Dim, inputShape: [this.inputDim], activation: 'relu'}));
    model.add(tf.layers.dense({units: this.outputDim, activation: 'softsign'}));
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    });
    console.log('Made a model:');
    model.summary();
    return model;
  }

  approve (player, input, output) {
    // when the behavior is approved,the input-output pair is added to the stack of samples
    this.samples[player].push({ input: input, output: output });
  }
  passApproveFunction () {
    return this.approve.bind(this);
  }

  disapprove (player, input, output) {
    // when the behavior is disapproved, the network's weights are randomly perturbed

    // alternative: add a sample to the stack with the output negated
    this.samples[player].push({ input: input, output: output.map(val => -val) });
  }
  passDisapproveFunction () {
    return this.disapprove.bind(this);
  }

  train (playerIndex, input, output) {
    if (!this.modelLock[playerIndex]) {
      this.modelLock[playerIndex] = true;
      //console.log('now training with input: ', input, 'and output:', output);
      this.models[playerIndex].fit(
        tf.tensor([input]), tf.tensor([output]), { batchSize: 1 }
      ).then(val => {
        this.modelLock[playerIndex] = false;
      });
    }
  }

  evaluate (playerIndex, input) {
    let output = Array.from(this.models[playerIndex].predict(tf.tensor([input])));
    if (output.length == 0) {
      output = Array(4).fill(Math.random() * 2 - 1);
    }
    //console.log('Output for player ' + playerIndex + ': ', output)
    return output;
  }

  update (timestamp) {
    if (this.models[0] != undefined) {
      [0, 1].forEach(playerIndex => {
        // training:
        if (this.samples[playerIndex].length > this.minimumNumberOfSamples) {
          // enough samples to train. pick a sample:
          let randomSample = _.sample(this.samples[playerIndex]);
          this.train(playerIndex, randomSample.input, randomSample.output);
        }

        // evaluating:
        if (this.input[playerIndex] != undefined) {
          this.output[playerIndex] = this.evaluate(playerIndex, this.input[playerIndex]);
        }
      });
    }

    window.requestAnimationFrame(this.update.bind(this));
  }

  setInput(playerIndex, input) {
    // input is a 15-element array with environment information for the player
    this.input[playerIndex] = input;
  }
  passSetInputFunction () {
    // we can't just use environment.setInput() from other classes because we need 'this' to reference the environment
    return this.setInput.bind(this);
  }

  getOutput (playerIndex) {
    // output for each player is a 4-element array with torques for the joints
    return this.output[playerIndex];
  }
  passGetOutputFunction () {
    return this.getOutput.bind(this);
  }


}

export { Trainer }
