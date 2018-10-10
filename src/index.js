import { Environment } from './Environment.js';
import { Trainer } from './Trainer.js';
import { InputManager } from './InputManager.js';

const environment = new Environment();
const trainerPlayer1 = new Trainer();
const trainerPlayer2 = new Trainer();
const inputManager = new InputManager(environment, [trainerPlayer1, trainerPlayer2]);
