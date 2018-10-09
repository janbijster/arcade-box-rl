import { Environment } from './Environment.js';
import { InputManager } from './InputManager.js';

const environment = new Environment();
const inputManager = new InputManager(
  environment.passSetInputFunction(),
  environment.passGetOutputFunction()
);
