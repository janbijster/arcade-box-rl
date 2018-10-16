import * as tf from '@tensorflow/tfjs';
const _ = require('lodash');
const CONFIG = require('./config.json');

class Trainer {
  constructor (playerIndex, renderEffectContainer) {

    this.playerIndex = playerIndex;
    this.renderEffect = renderEffectContainer.passRenderEffectFunction();

    this.inputDim = 3; // input for the trainer = state information from the environment
    // outputDim is defined in CONFIG.actionDim

    // random samples:
    this.randomSample = null;
    this.randomSampleOnDuration = 0.2 * 1000; // in milliseconds
    this.randomSampleOffDuration = 1 * 1000; // in milliseconds

    // when to start training?
    this.minimumNumberOfSamples = 10;
    // how much samples to remember?
    this.maxNumberOfSamples = 100;
    // keep this fraction of samples: (not neccessary to keep every frame)
    this.keepFraction = 1;
    // training batch size:
    this.batchSize = 8;
    // maximum number of epochs with the same data:
    this.maxEpochs = 100;
    // minimum number of epochs:
    this.minEpochs = 20;

    this.samplesTrainedSinceNewData = 0;
    this.lossNotImproving = false;
    this.lastLoss = 1;
    this.lossMovingAverageSpeed = 0.05;

    this.samples = [];
    this.pendingSamples = [];

    this.model = this.makeModel();
    this.modelLock = false;

    this.input = null;
    this.output = null;

    window.requestAnimationFrame(this.update.bind(this));
    //window.setTimeout(this.startRandomSample.bind(this), this.randomSampleOffDuration);
  }

  startRandomSample () {
    // clear previous pending samples
    this.pendingSamples = [];
    this.randomSample = Array(CONFIG.actionDim).fill(Math.random() * 2 -1);
    window.setTimeout(this.stopRandomSample.bind(this), this.randomSampleOnDuration);
    this.renderEffect({
      player: this.playerIndex,
      event: 'RANDOM_SAMPLE_ON'
    });
  }

  stopRandomSample () {
    this.randomSample = null;
    this.renderEffect({
      player: this.playerIndex,
      event: 'RANDOM_SAMPLE_OFF'
    });
  }

  makeModel () {
    let model = tf.sequential();
    let layer1Dim = Math.floor(0.5 * (this.inputDim + CONFIG.actionDim));
    model.add(tf.layers.dense({units: layer1Dim, inputShape: [this.inputDim], activation: 'relu'}));
    model.add(tf.layers.dense({units: CONFIG.actionDim, activation: 'softsign'}));
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    });
    console.log('Made a model:');
    model.summary();
    return model;
  }

  approve (input, output) {
    // user approves the last/current random behavior, so add the pendingSamples
    // to the samples array for training
    let keepNumSamples =  Math.round(this.pendingSamples.length * this.keepFraction);
    let keepSamples = _.sampleSize(this.pendingSamples, keepNumSamples);
    this.samples.push(...keepSamples);
    // throw away the first few samples if the array gets too big
    if (this.samples.length > this.maxNumberOfSamples) {
          this.samples = this.samples.slice(-this.maxNumberOfSamples)
    }
    // new data, so reset this counter:
    this.samplesTrainedSinceNewData = 0;
    // also reset the value that checks if the loss was not improving
    this.lossNotImproving = false;
    this.lastLoss = 1;
    // the pendingSamples array is not emptied, so the user can approve the same data multiple times for more weight
  }
  passApproveFunction () {
    return this.approve.bind(this);
  }

  disapprove (input, output) {
    //this.updatePastSamples(-1);
    this.startRandomSample();
  }
  passDisapproveFunction () {
    return this.disapprove.bind(this);
  }

  train (input, output) {
    if (!this.modelLock) {
      this.modelLock = true;
      this.model.fit(
        tf.tensor(input), tf.tensor(output), { batchSize: this.batchSize }
      ).then(history => {
        this.renderEffect({ player: this.playerIndex, event: "TRAINING", value: this.lastLoss });
        this.modelLock = false;
        console.log('MA loss:', this.lastLoss);
        console.log('New loss:', history.history.loss[0]);
        if (this.samplesTrainedSinceNewData / this.samples.length > this.maxEpochs) {
          console.log('Stop training: max epochs with the same data reached.');
          this.renderEffect({ player: this.playerIndex, event: "STOP_TRAINING" });
        }
        let newLoss = Math.min(1, history.history.loss[0]);

        if (newLoss > this.lastLoss && this.samplesTrainedSinceNewData / this.samples.length > this.minEpochs) {
          this.lossNotImproving = true;
          console.log('Stop training: loss not improving');
          this.renderEffect({ player: this.playerIndex, event: "STOP_TRAINING" });
        }
        this.lastLoss = (1 - this.lossMovingAverageSpeed) * this.lastLoss + this.lossMovingAverageSpeed * newLoss;

      });
    }
  }

  evaluate () {
    // is a long random sample running?
    if (this.randomSample != null) {
      this.output = this.randomSample;
    } else {
      // if not, evaluate the model
      let prediction = this.model.predict(tf.tensor([this.input]));
      prediction.data().then(data => {
        this.output = Array.from(data);
      });
    }
  }

  update (timestamp) {
    if (this.model != undefined) {

      // training:
      if (this.samples.length > this.minimumNumberOfSamples && this.samples.length > this.batchSize) {
        // enough samples to train. Grab a random batch:
        if (this.samplesTrainedSinceNewData / this.samples.length > this.maxEpochs || this.lossNotImproving) {
          // not training, known samples have been used enough.

        } else {
          let randomSamples = _.sampleSize(this.samples, this.batchSize);
          let inputSamples = randomSamples.map(sample => sample.input);
          let outputSamples = randomSamples.map(sample => sample.output);
          this.train(inputSamples, outputSamples);
          this.samplesTrainedSinceNewData += this.batchSize;
        }
      }

      // evaluating:
      if (this.input != undefined) {
        this.evaluate();
      }

      // if performing a random action, add the current in- and output to the pending samples.
      if (this.randomSample != null) {
        this.pendingSamples.push({ input: this.input, output: this.output });
      }
    }

    window.requestAnimationFrame(this.update.bind(this));
  }

  setInput(input) {
    // input is a 15-element array with environment information for the player
    this.input = input;
  }
  passSetInputFunction () {
    // we can't just use environment.setInput() from other classes because we need 'this' to reference the environment
    return this.setInput.bind(this);
  }

  getOutput () {
    // output for each player is a actionDim-element array with torques for the joints
    return this.output;
  }
  passGetOutputFunction () {
    return this.getOutput.bind(this);
  }


}

export { Trainer }
