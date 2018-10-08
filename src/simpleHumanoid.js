const MATTER = require('matter-js');

class SimpleHumanoid {
  constructor (position) {
    // setup params
    const startHeight = 50;

    const limbThickness = 20;
    const legLength = 100;
    const armLength = 80;
    const gapSize = 20;
    const bodyWidth = 80;
    const bodyHeight = 80;

    // calc params
    const bodyCenter = { x: position.x, y: position.y - startHeight - legLength - gapSize - 0.5*bodyHeight };
    const leftLegCenter = { x: position.x - 0.5*bodyWidth + 0.5*limbThickness, y: position.y - startHeight - 0.5*legLength };
    const rightLegCenter = { x: 2*position.x - leftLegCenter.x, y: leftLegCenter.y};
    const leftArmCenter = { x: position.x - 0.5*bodyWidth - gapSize - 0.5*armLength, y: position.y - startHeight - legLength - gapSize - bodyHeight + 0.5 * limbThickness };
    const rightArmCenter = { x: 2*position.x - leftArmCenter.x, y: leftArmCenter.y };


    if (position == undefined) {
      position = { x: 0, y: 0 };
    }


    this.bodies = [
      // body
      MATTER.Bodies.rectangle(bodyCenter.x, bodyCenter.y, bodyWidth, bodyHeight),
      // legs
      MATTER.Bodies.rectangle(leftLegCenter.x, leftLegCenter.y, limbThickness, legLength),
      MATTER.Bodies.rectangle(rightLegCenter.x, rightLegCenter.y, limbThickness, legLength),
      // arms
      MATTER.Bodies.rectangle(leftArmCenter.x, leftArmCenter.y, armLength, limbThickness),
      MATTER.Bodies.rectangle(rightArmCenter.x, rightArmCenter.y, armLength, limbThickness)
    ];
    this.constraints = [
      // left leg:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: -0.5*bodyWidth, y: 0.5*bodyHeight },
        pointB: { x: 0, y: -0.5*legLength + 0.5*limbThickness }
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: -0.5*bodyWidth + limbThickness, y: 0.5*bodyHeight },
        pointB: { x: 0, y: -0.5*legLength + 0.5*limbThickness }
      }),
      // right leg:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[2],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: 0.5*bodyWidth, y: 0.5*bodyHeight },
        pointB: { x: 0, y: -0.5*legLength + 0.5*limbThickness }
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[2],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: 0.5*bodyWidth - limbThickness, y: 0.5*bodyHeight },
        pointB: { x: 0, y: -0.5*legLength + 0.5*limbThickness }
      }),
      // left arm:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[3],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: -0.5*bodyWidth, y: -0.5*bodyHeight },
        pointB: { x: 0.5*armLength - 0.5*limbThickness, y: 0 }
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[3],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: -0.5*bodyWidth, y: -0.5*bodyHeight + limbThickness },
        pointB: { x: 0.5*armLength - 0.5*limbThickness, y: 0 }
      }),
      // right arm:
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[4],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: 0.5*bodyWidth, y: -0.5*bodyHeight },
        pointB: { x: -0.5*armLength + 0.5*limbThickness, y: 0 }
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[4],
        stiffness: 1,
        length: 0.5* limbThickness + gapSize,
        pointA: { x: 0.5*bodyWidth, y: -0.5*bodyHeight + limbThickness },
        pointB: { x: -0.5*armLength + 0.5*limbThickness, y: 0 }
      })
    ];

    this.composite = MATTER.Composite.create({
      bodies: this.bodies,
      constraints: this.constraints
    })
  }

  move(jointTorque) {
    // jointTorque is a 4-element array of torques for the 4 joints
    //console.log(jointTorque);
    for (let i = 0; i < 4; i++) {
      // set torque on the limb...
      this.bodies[i+1].torque = jointTorque[i];
      // but apply negative torque on the body to keep the total torque at zero
      this.bodies[0].torque -= jointTorque[i];
    }
    //MATTER.Body.applyForce(this.bodies[1], this.bodies[1].position, { x: 1, y: 0 });
  }

}

export { SimpleHumanoid };
