const MATTER = require('matter-js');
import { SimpleBody } from './SimpleBody.js';
import { SimpleHumanoidFeet } from './SimpleHumanoidFeet.js';
import { SimpleTriangleArms } from './SimpleTriangleArms.js';
const COLORS = require('./colors.json');
const CONFIG = require('./config.json');

class Environment {

  constructor () {

    const groundWidth = window.innerWidth - 180;
    const groundWallHeight = 60;

    // create an engine
    this.engine = MATTER.Engine.create()

    // create a renderer
    this.canvas = document.getElementById('canvas');
    this.render = MATTER.Render.create({
        canvas: this.canvas,
        element: document.body,
        engine: this.engine
    });
    this.render.options.wireframes = false;

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
    const groundRenderOptions = { fillStyle: COLORS.environment[1].light };
    const groundOptions = { isStatic: true, friction: 0, render: groundRenderOptions };

    const center = { x: window.innerWidth/2, y: 2*window.innerHeight/3 };
    const leftOfcenter = { x: window.innerWidth/3, y: 2*window.innerHeight/3 };
    const rightOfcenter = { x: 2*window.innerWidth/3, y: 2*window.innerHeight/3 };

    const ground = MATTER.Bodies.rectangle(center.x, center.y + 20, groundWidth, 40, groundOptions);
    const leftWall = MATTER.Bodies.rectangle(center.x - 0.5 * groundWidth - 20, center.y - (0.5*groundWallHeight - 40), 40, groundWallHeight, groundOptions);
    const rightWall = MATTER.Bodies.rectangle(center.x + 0.5 * groundWidth + 20, center.y - (0.5*groundWallHeight - 40), 40, groundWallHeight, groundOptions);
    // add the ground to the world
    MATTER.World.add(this.engine.world, ground);
    MATTER.World.add(this.engine.world, leftWall);
    MATTER.World.add(this.engine.world, rightWall);

    // create bodies
    this.players = [
      new SimpleTriangleArms(leftOfcenter),
      new SimpleTriangleArms(rightOfcenter)
    ];

    this.bodies = this.players.map(el => el.composite);
    [0, 1].forEach(playerIndex => {
      this.renderEffect({player: playerIndex, event: 'RANDOM_SAMPLE_OFF'});
    });

    // add all of the bodies to the world
    MATTER.World.add(this.engine.world, this.bodies);

    // run the engine
    MATTER.Engine.run(this.engine);

    // run the renderer
    MATTER.Render.run(this.render);

    // normalizing values for outputs
    this.normCenter = { x: center.x, y: center.y - 100 };
    this.normScale = { x: groundWidth, y: 200 };

    // add event listeners for updating inputs
    this.input = [
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    MATTER.Events.on(this.engine, 'afterUpdate', this.updateInput.bind(this));
    //MATTER.Render.stop(this.render);
  }

  setColors(playerIndex, tint, excludeBodies=[]) {
    this.bodies[playerIndex].bodies.forEach(body => {
      if (!excludeBodies.includes(body)) {
        body.render.fillStyle = COLORS.players[playerIndex][tint];
      }
    });
  }

  setOpacity(playerIndex, value, excludeBodies=[]) {
    this.bodies[playerIndex].bodies.forEach(body => {
      if (!excludeBodies.includes(body)) {
        body.render.opacity = Math.max(0, Math.min(1, value));
      }
    });
  }

  renderEffect (effectInfo) {
    //console.log('Render effect for:', effectInfo);
    if (effectInfo.event == 'RANDOM_SAMPLE_ON') {
      this.setColors(effectInfo.player, 'light');
    }
    if (effectInfo.event == 'RANDOM_SAMPLE_OFF') {
      this.setColors(effectInfo.player, 'main');
    }
    if (effectInfo.event == 'TRAINING') {
      this.setOpacity(effectInfo.player, 1-effectInfo.value);
    }
    if (effectInfo.event == 'STOP_TRAINING') {
      this.setOpacity(effectInfo.player, 1);
    }
    //console.log(effectInfo.player, effectInfo.event);
  }
  passRenderEffectFunction () {
    return this.renderEffect.bind(this);
  }

  setInput(playerIndex, input) {
    // input is a actionDim-element array with torques for the motor joints for the player
    if (input != undefined && input.length == CONFIG.actionDim) {
      this.input[playerIndex] = input;
    }
  }

  passSetInputFunction () {
    // we can't just use environment.setInput() from other classes because we need 'this' to reference the environment
    return this.setInput.bind(this);
  }

  getOutput (playerIndex) {
    // output for each player is:
    // [ torso x normalized, torso y normalized, limb1 angle, limb1 angularvelocity, etc.. ]

    let base = this.players[playerIndex].bodies[0];
    let leftArm = this.players[playerIndex].bodies[1];
    let otherBase = this.players[1-playerIndex].bodies[0];

    let output = [
      (base.position.x - this.normCenter.x) / this.normScale.x,
      leftArm.angle,
      (otherBase.position.x - this.normCenter.x) / this.normScale.x
    ];
    return output;
  }

  passGetOutputFunction () {
    return this.getOutput.bind(this);
  }

  updateInput() {
    this.players[0].move(this.input[0]);
    this.players[1].move(this.input[1]);
  }

}

export { Environment };
