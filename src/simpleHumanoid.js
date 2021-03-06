const MATTER = require('matter-js');

class SimpleHumanoid {
  constructor (position) {
    // setup params
    const startHeight = 50;

    const limbThickness = 25;
    const legLength = 90;
    const armLength = 70;
    const gapSize = 10;
    const torsoWidth = 80;
    const torsoHeight = 80;

    // calc params
    const torsoCenter = { x: position.x, y: position.y - startHeight - legLength - gapSize - 0.5*torsoHeight };
    const leftLegCenter = { x: position.x - 0.5*torsoWidth + 0.5*limbThickness, y: position.y - startHeight - 0.5*legLength };
    const rightLegCenter = { x: 2*position.x - leftLegCenter.x, y: leftLegCenter.y};
    const leftArmCenter = { x: position.x - 0.5*torsoWidth - gapSize - 0.5*armLength, y: position.y - startHeight - legLength - gapSize - torsoHeight + 0.5 * limbThickness };
    const rightArmCenter = { x: 2*position.x - leftArmCenter.x, y: leftArmCenter.y };


    if (position == undefined) {
      position = { x: 0, y: 0 };
    }

    this.bodies = [
      // torso
      MATTER.Bodies.rectangle(torsoCenter.x, torsoCenter.y, torsoWidth, torsoHeight),
      // legs
      MATTER.Bodies.rectangle(leftLegCenter.x, leftLegCenter.y, limbThickness, legLength),
      MATTER.Bodies.rectangle(rightLegCenter.x, rightLegCenter.y, limbThickness, legLength),
      // arms
      MATTER.Bodies.rectangle(leftArmCenter.x, leftArmCenter.y, armLength, limbThickness),
      MATTER.Bodies.rectangle(rightArmCenter.x, rightArmCenter.y, armLength, limbThickness)
    ];

    const constraintRenderOptions = {
      visible: true
    };

    this.constraints = [
      // left leg:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: 0.5 * limbThickness + gapSize,
        pointA: { x: -0.5*torsoWidth, y: 0.5*torsoHeight },
        pointB: { x: 0, y: -0.5*legLength + 0.5*limbThickness },
        render: constraintRenderOptions
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: 1.0 * limbThickness + gapSize,
        pointA: { x: -0.5*torsoWidth + limbThickness, y: 0.5*torsoHeight },
        pointB: { x: 0, y: -0.5*legLength + 0.5*limbThickness },
        render: constraintRenderOptions
      }),
      // right leg:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[2],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: 0.5*torsoWidth, y: 0.5*torsoHeight },
        pointB: { x: 0, y: -0.5*legLength + 0.5*limbThickness },
        render: constraintRenderOptions
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[2],
        stiffness: 1,
        length: 1.0 * limbThickness + gapSize,
        pointA: { x: 0.5*torsoWidth - limbThickness, y: 0.5*torsoHeight },
        pointB: { x: 0, y: -0.5*legLength + 0.5*limbThickness },
        render: constraintRenderOptions
      }),
      // left arm:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[3],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: -0.5*torsoWidth, y: -0.5*torsoHeight },
        pointB: { x: 0.5*armLength - 0.5*limbThickness, y: 0 },
        render: constraintRenderOptions
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[3],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: -0.5*torsoWidth, y: -0.5*torsoHeight + limbThickness },
        pointB: { x: 0.5*armLength - 0.5*limbThickness, y: 0 },
        render: constraintRenderOptions
      }),
      // right arm:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[4],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: 0.5*torsoWidth, y: -0.5*torsoHeight },
        pointB: { x: -0.5*armLength + 0.5*limbThickness, y: 0 },
        render: constraintRenderOptions
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[4],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: 0.5*torsoWidth, y: -0.5*torsoHeight + limbThickness },
        pointB: { x: -0.5*armLength + 0.5*limbThickness, y: 0 },
        render: constraintRenderOptions
      })
    ];

    this.composite = MATTER.Composite.create({
      bodies: this.bodies,
      constraints: this.constraints
    })
  }

  move(jointTorque) {
    // jointTorque is a 4-element array of torques for the 4 joints
    // NOTE change the actionDim in config.json accordingly.
    for (let i = 0; i < 4; i++) {
      // set torque on the limb...
      this.bodies[i+1].torque = jointTorque[i];
      // but apply negative torque on the torso to keep the total torque at zero
      this.bodies[0].torque -= jointTorque[i];
    }
  }

}

export { SimpleHumanoid };
