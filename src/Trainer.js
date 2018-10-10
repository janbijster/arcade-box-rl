import * as tf from '@tensorflow/tfjs';
const _ = require('lodash');

class Trainer {
  constructor () {

    this.inputDim = 15;
    this.outputDim = 4;
    // when to start training?
    this.minimumNumberOfSamples = 10;
    // how much samples to use?
    this.maxNumberOfSamples = 1000;
    this.keepSamplesFraction = 0.1;
    this.lookBackFrames = 60;
    this.lastTimestamp = null;
    this.minValuation = 0.3;
    this.randomSampleProb = 0.01;
    this.randomSampleCounter = [0, 0];
    this.randomSample = [[], []];
    this.randomSampleDuration = 60;

    this.samples = [
      [], // samples for p1
      []  // samples for p2
    ];
    this.pendingSamples = [
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

  updatePastSamples(playerIndex, valuation) {
    // update the recent samples with the new evaluation
    let lastSample = this.pendingSamples[playerIndex].length - 1;
    let firstSample = lastSample - this.lookBackFrames;

    for (let i = Math.max(firstSample, 0); i < lastSample + 1; i++) {
      let decay = (i - firstSample)/this.lookBackFrames;
      let sample = this.pendingSamples[playerIndex][i];
      sample.valuation += decay * valuation;
    }

    // now check older samples if they have enough positive or negative valuation to be included
    while (this.pendingSamples[playerIndex].length > this.lookBackFrames) {
      let sample = this.pendingSamples[playerIndex].shift();
      if (Math.abs(sample.valuation) > this.minValuation) {
        if (Math.random() < this.keepSamplesFraction) {
          this.samples[playerIndex].push(sample);
          // but don't let the buffer get too big
          if (this.samples[playerIndex].length > this.maxNumberOfSamples) {
            this.samples[playerIndex].shift();
          }
        }
      }
    }
    console.log(this.samples[playerIndex].length + ' samples in buffer for player ' + playerIndex);
  }

  approve (playerIndex, input, output) {
    this.updatePastSamples(playerIndex, 1);
  }
  passApproveFunction () {
    return this.approve.bind(this);
  }

  disapprove (playerIndex, input, output) {
    this.updatePastSamples(playerIndex, -0.5);
    // also do a long random sample:
    this.randomSample[playerIndex] = Array(4).fill(Math.random() * 2 - 1);
    this.randomSampleCounter[playerIndex] = this.randomSampleDuration;
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
        window.model = this.models[playerIndex];
      });
    }
  }

  evaluate (playerIndex) {
    // is a long random sample running?
    if (this.randomSampleCounter[playerIndex] > 0) {
      this.output[playerIndex] = this.randomSample[playerIndex];
      this.randomSampleCounter[playerIndex] -= 1;
      console.log('randommm...')
    } else {
      // if not, is it time for a random random sample?
      if (Math.random() < this.randomSampleProb) { // for random output
        this.output[playerIndex] = Array(4).fill(Math.random() * 2 - 1);
      } else {
        // no, so evaluate the model
        let prediction = this.models[playerIndex].predict(tf.tensor([this.input[playerIndex]]));
        prediction.data().then(data => {
          this.output[playerIndex] = Array.from(data);
        });
      }
    }

  }

  update (timestamp) {
    if (this.models[0] != undefined) {
      [0, 1].forEach(playerIndex => {
        // training:
        if (this.samples[playerIndex].length > this.minimumNumberOfSamples) {
          // enough samples to train. pick a sample:
          let randomSample = _.sample(this.samples[playerIndex]);
          let valuatedOutput = randomSample.output.map(el => randomSample.valuation * el);
          this.train(playerIndex, randomSample.input, valuatedOutput);
        }

        // evaluating:
        if (this.input[playerIndex] != undefined) {
          this.evaluate(playerIndex);
        }

        // add the current input and output to the pending samples.
        this.pendingSamples[playerIndex].push({ input: this.input[playerIndex], output: this.output[playerIndex], valuation: 0 });
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
