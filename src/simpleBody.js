const MATTER = require('matter-js');

class SimpleBody {
  constructor (position) {
    this.thickness = 20;
    this.legLength = 100;
    this.footlength = 80;
    this.heelLength = 20;
    this.gapSize = 10;

    if (position == undefined) {
      position = { x: 0, y: 0 };
    }
    const startHeight = 10;
    this.bodies = [
      MATTER.Bodies.rectangle(position.x - 0.5*this.footlength + this.heelLength, position.y - 0.5*this.thickness - startHeight, this.footlength, this.thickness),
      MATTER.Bodies.rectangle(position.x, position.y - 0.5*this.legLength - 2*this.thickness - this.gapSize, this.thickness, this.legLength)
    ];
    this.constraints = [
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: this.thickness + this.gapSize,
        pointA: { x: 0.5*this.footlength - this.heelLength - 0.5 * (this.thickness + this.gapSize), y: 0 },
        pointB: { x: 0, y: 0.5*this.legLength - 0.5*this.thickness }
      }),
      MATTER.Constraint.create({
        bodyA: this.bodies[0],
        bodyB: this.bodies[1],
        stiffness: 1,
        length: this.thickness + this.gapSize,
        pointA: { x: 0.5*this.footlength - this.heelLength + 0.5 * (this.thickness + this.gapSize), y: 0 },
        pointB: { x: 0, y: 0.5*this.legLength - 0.5*this.thickness }
      })
    ];

    this.composite = MATTER.Composite.create({
      bodies: this.bodies,
      constraints: this.constraints
    })
  }

}

export { SimpleBody };
