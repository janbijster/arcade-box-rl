import { Environment } from './Environment.js';
import { Trainer } from './Trainer.js';
import { InputManager } from './InputManager.js';

const environment = new Environment();
const trainerPlayer0 = new Trainer(0, environment); // id, object containing renderEffect function
const trainerPlayer1 = new Trainer(1, environment); // id, object containing renderEffect function
const inputManager = new InputManager(environment, [trainerPlayer0, trainerPlayer1]); // environment, trainersArray
