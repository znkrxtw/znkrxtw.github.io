import { UI } from './ui';
import { Logic } from './logic';
import { ProfileData } from './profileData';
import { GameState } from './gameState';

export interface IGame {
    ui: UI;
    profileData: ProfileData;
    logic: Logic;
    gameState: GameState;
}
