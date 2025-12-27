import {GameState} from './gameState';
import {uuidv7} from 'uuidv7';
import {SaveStructure} from './types';

export class ProfileData {

    private readonly saveString: string;
    private save: SaveStructure;
    private gameState: GameState;

    //save data
    private playerID: string | null;
    private twitchDactleIndex: number;
    private guessedWords: [];
    private numbersRevealed: boolean;
    private gameAccuracy = [];
    public articleName: string;
    private pageRevealed = false;
    private gameWins = [];
    private gameScores = [];
    private gameAnswers = [];

    //save prefs
    private hidingZero: boolean;
    private hidingLog: boolean;
    public selectedArticles: string;
    public streamName: string;
    public pluralizing: boolean;

    constructor(gameInstance: any) {
        this.gameState = gameInstance.gameState;
        this.saveString = "redactleSave";
        this.save = {
            saveData: {
                twitchDactleIndex: 0,
                gameWins: [],
                gameScores: [],
                gameAccuracy: [],
                gameAnswers: [],
                articleName: "",
                guessedWords: [],
                numbersRevealed: false,
                pageRevealed: false
            },
            prefs: {
                hidingZero: false,
                hidingLog: false,
                selectedArticles: "",
                streamName: "",
                pluralizing: false
            },
            id: {}
        };

        //save data
        this.playerID = null;
        this.twitchDactleIndex = 0;
        this.guessedWords = [];
        this.numbersRevealed = false;
        this.gameAccuracy = [];
        this.articleName = "";
        this.pageRevealed = false;
        this.gameWins = [];
        this.gameScores = [];
        this.gameAnswers = [];

        //save prefs
        this.hidingZero = false;
        this.hidingLog = false;
        this.selectedArticles = 'standard';
        this.streamName = '';
        this.pluralizing = false;
    }

    saveProgress() {
        this.save.saveData.twitchDactleIndex = this.twitchDactleIndex;
        this.save.saveData.articleName = this.articleName;
        this.save.saveData.guessedWords = this.guessedWords;
        this.save.saveData.numbersRevealed = this.numbersRevealed;
        this.save.saveData.pageRevealed = this.pageRevealed;
        this.initSave();
        localStorage.setItem(this.saveString, JSON.stringify(this.save));
    }

    newGame() {
        localStorage.clear();
        this.initSave();
        this.gameState.baffled = [];
        this.gameState.baffledNumbers = [];
        this.gameState.answer = [];
        this.gameState.guessCounter = 0;
        this.gameState.hitCounter = 0;
        this.gameState.currentAccuracy = -1;
        this.gameState.clickThruIndex = 0;
        this.gameState.clickThruNodes = [];

        localStorage.setItem(this.saveString, JSON.stringify(this.save));

        this.loadSave();
    }

    initSave() {
        this.save.saveData.twitchDactleIndex += 1;
        this.save.saveData.articleName = "";
        this.save.saveData.guessedWords = [];
        this.save.saveData.gameWins = this.gameWins;
        this.save.saveData.gameScores = this.gameScores;
        this.save.saveData.gameAccuracy = this.gameAccuracy;
        this.save.saveData.numbersRevealed = false;
        this.save.saveData.pageRevealed = false;
        this.save.prefs.hidingZero = this.hidingZero;
        this.save.prefs.selectedArticles = this.selectedArticles;
        this.save.prefs.hidingLog = this.hidingLog;
        this.save.prefs.streamName = this.streamName;
        this.save.prefs.pluralizing = this.pluralizing;
    }

    loadSave() {
        const savedData = localStorage.getItem(this.saveString);
        if (savedData === null) {
            this.createNewSave()
        } else {
            this.save = JSON.parse(savedData) as SaveStructure;
        }
        localStorage.setItem(this.saveString, JSON.stringify(this.save));

        this.gameState.hidingZero = this.save.prefs.hidingZero;
        this.gameState.hidingLog = this.save.prefs.hidingLog;
        this.gameState.selectedArticles = this.save.prefs.selectedArticles;
        this.gameState.pluralizing = this.save.prefs.pluralizing;
        this.gameState.streamName = this.save.prefs.streamName;
        this.gameState.gameWins = this.save.saveData.gameWins;
        this.gameState.gameScores = this.save.saveData.gameScores;
        this.gameState.gameAccuracy = this.save.saveData.gameAccuracy;
        this.gameState.gameAnswers = this.save.saveData.gameAnswers;
        const gameDelta = this.twitchDactleIndex - this.save.saveData.gameWins.length;
        for (let i = 0; i < gameDelta; i++) {
            this.gameState.gameWins.push(0);
            this.gameState.gameScores.push(0);
            this.gameState.gameAccuracy.push(0);
            this.gameState.gameAnswers.push('');
        }

        this.guessedWords = this.save.saveData.guessedWords;
        this.numbersRevealed = this.save.saveData.numbersRevealed;
        this.pageRevealed = this.save.saveData.pageRevealed;

        this.saveProgress();
    }

    createNewSave() {
        localStorage.clear();
        this.playerID = uuidv7();
        this.articleName = "";
        this.twitchDactleIndex = 0;
        this.save = JSON.parse(JSON.stringify({
            "saveData": {
                twitchDactleIndex: this.twitchDactleIndex,
                articleName: this.articleName,
                guessedWords: this.guessedWords,
                gameWins: this.gameWins,
                gameScores: this.gameScores,
                gameAccuracy: this.gameAccuracy,
                gameAnswers: this.gameAnswers,
                numbersRevealed: this.numbersRevealed,
                pageRevealed: this.pageRevealed
            },
            "prefs": {
                hidingZero: this.hidingZero,
                hidingLog: this.hidingLog,
                pluralizing: this.pluralizing,
                selectedArticles: this.selectedArticles,
                streamName: this.streamName
            },
            "id": {playerID: this.playerID}
        })) as SaveStructure;
    }
}

