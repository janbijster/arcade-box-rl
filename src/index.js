import { Environment } from './Environment.js';
import { Trainer } from './Trainer.js';
import { InputManager } from './InputManager.js';

const environment = new Environment();
const trainer = new Trainer();
const inputManager = new InputManager(
  environment.passSetInputFunction(),
  environment.passGetOutputFunction(),
  trainer.passSetInputFunction(),
  trainer.passGetOutputFunction(),
  trainer.passApproveFunction(),
  trainer.passDisapproveFunction()
);
