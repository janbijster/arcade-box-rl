const MATTER = require('matter-js');
const COLORS = require('./colors.json');

class SimpleTriangleArms {
  constructor (position) {
    // setup params
    const startHeight = 50;

    const limbThickness = 25;
    const triangleRadius = 70;
    const armLength = 100;
    const gapSize = 10;

    this.amplification = [5, 1];

    // calc params
    const triangleCenter = { x: position.x, y: position.y - startHeight };
    const leftArmCenter = { x: position.x - triangleRadius - gapSize, y: triangleCenter.y };
    const rightArmCenter = { x: position.x + triangleRadius + gapSize, y: triangleCenter.y }

    if (position == undefined) {
      position = { x: 0, y: 0 };
    }

    this.bodies = [
      // triangle
      MATTER.Bodies.polygon(triangleCenter.x, triangleCenter.y, 3, triangleRadius),
      // arms
      MATTER.Bodies.rectangle(leftArmCenter.x, leftArmCenter.y, armLength, limbThickness),
      MATTER.Bodies.rectangle(rightArmCenter.x, rightArmCenter.y, armLength, limbThickness)
    ];

    // rotate body:
    console.log(this.bodies[0].angle);
    MATTER.Body.rotate(this.bodies[0], 0.5*Math.PI);
    console.log(this.bodies[0].angle);

    const constraintRenderOptions = {
      visible: true
    };

    this.constraints = [
      // left arm:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: 0.75*triangleRadius,
        pointA: { x: 0, y: -0.62*triangleRadius },
        pointB: { x: 0.5*armLength - 0.5*limbThickness, y: 0 },
        render: constraintRenderOptions
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: 0.75*triangleRadius,
        pointA: { x: -0.5*triangleRadius, y: 0.25*triangleRadius },
        pointB: { x: 0.5*armLength - 0.5*limbThickness, y: 0 },
        render: constraintRenderOptions
      }),
      // right arm:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[2],
        stiffness: 1,
        length: 0.75*triangleRadius,
        pointA: { x: 0, y: -0.62*triangleRadius },
        pointB: { x: -0.5*armLength + 0.5*limbThickness, y: 0 },
        render: constraintRenderOptions
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[2],
        stiffness: 1,
        length: 0.75*triangleRadius,
        pointA: { x: 0.5*triangleRadius, y: 0.25*triangleRadius },
        pointB: { x: -0.5*armLength + 0.5*limbThickness, y: 0 },
        render: constraintRenderOptions
      })
    ];

    this.composite = MATTER.Composite.create({
      bodies: this.bodies,
      constraints: this.constraints
    })

  }

  move(input) {
    // input is a 2-element array: 1st is moving left-right, 2nd is move arms up/down
    // move left right
    MATTER.Body.setVelocity(this.bodies[0], { x: input[0] * this.amplification[0], y: 0});
    //MATTER.Body.applyForce(this.bodies[0], { x: 0, y: Math.cos(2*Math.PI/6) * this.triangleRadius }, { x: input[0] * this.amplification[0], y: 0 });
    // arms up/down
    let torque = input[1] * this.amplification[1];
    this.bodies[1].torque = torque;
    this.bodies[2].torque = -torque;
  }

  trainEffect(value) {

  }

}

export { SimpleTriangleArms };
