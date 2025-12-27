// Entry point for Vite bundling
import 'bootstrap/dist/css/bootstrap.css';
import './styles.css';
import 'bootstrap';

// Load modals synchronously before game initialization
import { loadModals } from './modals.ts';
loadModals();

// Create and start the game
import { createGame } from './game/redactleGame.js';
createGame();