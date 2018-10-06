const MATTER = require('matter-js');

class Environment {

  constructor () {

    // create an engine
    this.engine = MATTER.Engine.create()

    // create a renderer
    this.render = MATTER.Render.create({
        element: document.body,
        engine: this.engine
    });

    // create two boxes and a ground
    const boxA = MATTER.Bodies.rectangle(400, 200, 80, 80);
    const boxB = MATTER.Bodies.rectangle(450, 50, 80, 80);
    const ground = MATTER.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

    // add all of the bodies to the world
    MATTER.World.add(this.engine.world, [boxA, boxB, ground]);

    // run the engine
    MATTER.Engine.run(this.engine);

    // run the renderer
    MATTER.Render.run(this.render);
  }
}

export { Environment };
