import { UI } from './ui';
import { Logic } from './logic.ts';
import { ProfileData } from './profileData';
import { GameState } from './gameState';

export interface IGame {
    ui: UI;
    profileData: ProfileData;
    logic: Logic;
    gameState: GameState;
}

interface SaveData {
    twitchDactleIndex: number;
    articleName: string;
    guessedWords: [string, number][];
    numbersRevealed: boolean;
    pageRevealed: boolean;
    gameWins: number[];
    gameScores: number[];
    gameAccuracy: string[];
    gameAnswers: string[];
}

interface SavePrefs {
    hidingZero: boolean;
    hidingLog: boolean;
    selectedArticles: string;
    streamName: string;
    pluralizing: boolean;
}

interface SaveId {
    playerID?: string;
}

export interface SaveStructure {
    saveData: SaveData;
    prefs: SavePrefs;
    id: SaveId;
}
