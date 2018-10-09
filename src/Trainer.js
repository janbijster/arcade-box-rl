

class Trainer {
  constructor () {

    const inputDim = 15;
    const outputDim = 4;

    this.samples = [
      [], // samples for p1
      []  // samples for p2
    ];
  }

  approve (player, input, output) {
    // when the behavior is approved,the input-output pair is added to the stack of samples
    this.samples[player].push([input, output]);
  }

  disapprove (player, input, output) {
    // when the behavior is disapproved, the network's weights are randomly perturbed

    // alternative: add a sample to the stack with the output negated
    //  this.samples[player].push([input, output.map(val => -val)]);
  }


}

export { Trainer }
