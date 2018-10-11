import * as tf from '@tensorflow/tfjs';
const _ = require('lodash');

class Trainer {
  constructor (playerIndex, renderEffectContainer) {

    this.playerIndex = playerIndex;
    this.renderEffect = renderEffectContainer.passRenderEffectFunction();

    this.inputDim = 15;
    this.outputDim = 4;
    // when to start training?
    this.minimumNumberOfSamples = 10;
    // how much samples to remember?
    this.maxNumberOfSamples = 1000;
    // keep only this fraction of samples
    this.keepSamplesFraction = 0.2;
    // an approval or disapproval now is applied to the last # frames:
    this.lookBackFrames = 60;
    // throw away samples with a lower absolute valuation than
    this.minValuation = 0.3;

    // periodic random samples:
    this.randomSample = null;
    this.randomSampleOnDuration = 1 * 1000; // in milliseconds
    this.randomSampleOffDuration = 1 * 1000; // in milliseconds

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
    this.randomSample = Array(4).fill(Math.random() * 2 -1);
    window.setTimeout(this.stopRandomSample.bind(this), this.randomSampleOnDuration);
    this.renderEffect({
      player: this.playerIndex,
      event: 'RANDOM_SAMPLE_ON'
    });
  }

  stopRandomSample () {
    this.randomSample = null;
    //window.setTimeout(this.startRandomSample.bind(this), this.randomSampleOffDuration);
    this.renderEffect({
      player: this.playerIndex,
      event: 'RANDOM_SAMPLE_OFF'
    });
  }

  makeModel () {
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

  updatePastSamples (valuation) {
    // update the recent samples with the new evaluation
    let lastSample = this.pendingSamples.length - 1;
    let firstSample = lastSample - this.lookBackFrames;

    for (let i = Math.max(firstSample, 0); i < lastSample + 1; i++) {
      let decay = (i - firstSample)/this.lookBackFrames;
      let sample = this.pendingSamples[i];
      sample.valuation += decay * valuation;
    }

    // now check older samples if they have enough positive or negative valuation to be included
    while (this.pendingSamples.length > this.lookBackFrames) {
      let sample = this.pendingSamples.shift();
      if (Math.abs(sample.valuation) > this.minValuation) {
        if (Math.random() < this.keepSamplesFraction) {
          this.samples.push(sample);
          // but don't let the buffer get too big
          if (this.samples.length > this.maxNumberOfSamples) {
            this.samples.shift();
          }
        }
      }
    }
    console.log(this.samples.length + ' samples in buffer...');
  }

  approve (input, output) {
    this.updatePastSamples(1);
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
      //console.log('now training with input: ', input, 'and output:', output);
      this.model.fit(
        tf.tensor([input]), tf.tensor([output]), { batchSize: 1 }
      ).then(val => {
        this.modelLock = false;
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
      if (this.samples.length > this.minimumNumberOfSamples) {
        // enough samples to train. pick a sample:
        let randomSample = _.sample(this.samples);
        let valuatedOutput = randomSample.output.map(el => randomSample.valuation * el);
        this.train(randomSample.input, valuatedOutput);
      }

      // evaluating:
      if (this.input != undefined) {
        this.evaluate();
      }

      // add the current input and output to the pending samples.
      this.pendingSamples.push({ input: this.input, output: this.output, valuation: 0 });

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
    // output for each player is a 4-element array with torques for the joints
    return this.output;
  }
  passGetOutputFunction () {
    return this.getOutput.bind(this);
  }


}

export { Trainer }
