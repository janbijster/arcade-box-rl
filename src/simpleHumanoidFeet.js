const MATTER = require('matter-js');

class SimpleHumanoidFeet {
  constructor (position) {
    // setup params
    const startHeight = 50;

    const limbThickness = 25;
    const footLength = 90;
    const armLength = 90;
    const gapSize = 10;
    const torsoWidth = 80;
    const torsoHeight = 140;

    this.jointTorqueAmplification = [1.5, 1.5, 2, 2];

    // calc params
    const torsoCenter = { x: position.x, y: position.y - startHeight - footLength - gapSize - 0.5*torsoHeight };
    const leftLegCenter = { x: position.x - 0.5*torsoWidth + 0.5*limbThickness, y: position.y - startHeight - 0.5*footLength };
    const rightLegCenter = { x: 2*position.x - leftLegCenter.x, y: leftLegCenter.y};
    const leftArmCenter = { x: position.x - 0.5*torsoWidth - gapSize - 0.5*armLength, y: position.y - startHeight - footLength - gapSize - torsoHeight + 0.5 * limbThickness };
    const rightArmCenter = { x: 2*position.x - leftArmCenter.x, y: leftArmCenter.y };


    if (position == undefined) {
      position = { x: 0, y: 0 };
    }

    const feetOptions = { friction: 1 };

    this.bodies = [
      // torso
      MATTER.Bodies.rectangle(torsoCenter.x, torsoCenter.y, torsoWidth, torsoHeight),
      // feet
      MATTER.Bodies.rectangle(leftLegCenter.x, leftLegCenter.y, footLength, limbThickness, feetOptions),
      MATTER.Bodies.rectangle(rightLegCenter.x, rightLegCenter.y, footLength, limbThickness, feetOptions),
      // arms
      MATTER.Bodies.rectangle(leftArmCenter.x, leftArmCenter.y, armLength, limbThickness),
      MATTER.Bodies.rectangle(rightArmCenter.x, rightArmCenter.y, armLength, limbThickness)
    ];


    const constraintRenderOptions = {
      visible: true
    };

    this.constraints = [
      // left foot:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: limbThickness + gapSize,
        pointA: { x: -0.5*torsoWidth, y: 0.5*torsoHeight },
        pointB: { x: 0, y: 0 },
        render: constraintRenderOptions
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: limbThickness + gapSize,
        pointA: { x: -0.5*torsoWidth, y: 0.5*torsoHeight },
        pointB: { x: limbThickness, y: 0 },
        render: constraintRenderOptions
      }),
      // right foot:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[2],
        stiffness: 1,
        length: limbThickness + gapSize,
        pointA: { x: 0.5*torsoWidth, y: 0.5*torsoHeight },
        pointB: { x: 0, y: 0 },
        render: constraintRenderOptions
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[2],
        stiffness: 1,
        length: limbThickness + gapSize,
        pointA: { x: 0.5*torsoWidth, y: 0.5*torsoHeight },
        pointB: { x: -limbThickness, y: 0 },
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
        length: 1*limbThickness + gapSize,
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
        length: 1*limbThickness + gapSize,
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
      this.bodies[i+1].torque = this.jointTorqueAmplification[i] * jointTorque[i];
      // but apply negative torque on the torso to keep the total torque at zero
      this.bodies[0].torque -= this.jointTorqueAmplification[i] * jointTorque[i];
    }
  }

}

export { SimpleHumanoidFeet };
