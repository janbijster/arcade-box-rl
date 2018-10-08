const MATTER = require('matter-js');
import { SimpleBody } from './SimpleBody.js';
import { SimpleHumanoid } from './SimpleHumanoid.js';

class Environment {

  constructor () {

    // create an engine
    this.engine = MATTER.Engine.create()

    // create a renderer
    this.canvas = document.getElementById('canvas');
    this.render = MATTER.Render.create({
        canvas: this.canvas,
        element: document.body,
        engine: this.engine
    });

    this.engine.world.bounds.max.x = window.width;
    this.engine.world.bounds.max.y = window.height;

    function resizeCanvas() {
      document.getElementById('canvas').width = window.innerWidth;
      document.getElementById('canvas').height = window.innerHeight;
    }
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    // create a ground
    const center = { x: window.innerWidth/2, y: 2*window.innerHeight/3 };
    const leftOfcenter = { x: window.innerWidth/3, y: 2*window.innerHeight/3 };
    const rightOfcenter = { x: 2*window.innerWidth/3, y: 2*window.innerHeight/3 };

    const ground = MATTER.Bodies.rectangle(center.x, center.y + 20, 0.8*window.innerWidth, 40, { isStatic: true });
    // add the ground to the world
    MATTER.World.add(this.engine.world, ground);

    // create bodies
    this.players = [
      new SimpleHumanoid(leftOfcenter),
      new SimpleHumanoid(rightOfcenter)
    ];

    this.bodies = this.players.map(el => el.composite);
    // add all of the bodies to the world
    MATTER.World.add(this.engine.world, this.bodies);

    // run the engine
    MATTER.Engine.run(this.engine);

    // run the renderer
    MATTER.Render.run(this.render);

    // add event listeners for updating inputs
    this.input = new Array(8).fill(0);
    MATTER.Events.on(this.engine, 'afterUpdate', this.updateInput.bind(this));
  }

  setInput(input) {
    // input is a 8-element array with torques for the motor joints for the two humanoids
    if (input.length == 8) {
      this.input = input;
    }
  }

  getSetInputFunction () {
    return this.setInput.bind(this);
  }

  updateInput() {
    this.players[0].move(this.input.slice(0, 4));
    this.players[1].move(this.input.slice(4, 8));
  }

}

export { Environment };
