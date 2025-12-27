export class GameState {

    baffled: [string, any][] = [];
    baffledNumbers: any[] = [];
    answer: string[] = [];
    guessCounter: number = 0;
    ansStr?: string;

    // UI interaction state
    currentlyHighlighted?: any;
    hitCounter: number = 0;
    currentAccuracy: number = -1;
    clickThruIndex: number = 0;
    clickThruNodes: any[] = [];

    // Game flow state
    redirectable?: any;
    counting?: any;
    ses?: any;
    yesterday?: any;
    loadingIcon?: any;
    gameIsActive: boolean = false;
    pageRevealed: boolean = false;
    numbersRevealed: boolean = false;

    //player data
    public gameWins!: number[];
    public gameScores!: number[];
    public gameAccuracy!: number[];
    public hidingZero!: boolean;
    public selectedArticles!: string;
    public hidingLog!: boolean;
    public streamName!: string;
    public pluralizing!: boolean;
    public gameAnswers!: string[];

    constructor() {
        this.reset();
    }

    reset() {
        // Game content state
        this.baffled = [];
        this.baffledNumbers = [];
        this.answer = [];
        this.guessCounter = 0;
        this.ansStr = undefined;

        // UI interaction state
        this.currentlyHighlighted = undefined;
        this.hitCounter = 0;
        this.currentAccuracy = -1;
        this.clickThruIndex = 0;
        this.clickThruNodes = [];

        // Game flow state
        this.redirectable = undefined;
        this.counting = undefined;
        this.ses = undefined;
        this.yesterday = undefined;
        this.loadingIcon = undefined;
        this.gameIsActive = false;

        this.gameWins = [];
        this.gameScores = [];
        this.gameAccuracy = [];
        this.hidingZero = false;
        this.selectedArticles = "standard";
        this.hidingLog = false;
        this.streamName = "";
        this.pluralizing = false;

    }

    // Getters for commonly accessed state
    get isGameActive(): boolean {
        return this.gameIsActive;
    }

    get totalGuesses(): number {
        return this.guessCounter;
    }

    get currentHits(): number {
        return this.hitCounter;
    }

    // State management methods
    incrementGuessCounter(): void {
        this.guessCounter++;
    }

    incrementHitCounter(): void {
        this.hitCounter++;
    }

    setGameActive(active: boolean): void {
        this.gameIsActive = active;
    }

    setAnswer(answerString: string): void {
        this.ansStr = answerString;
    }

    addBaffledNumber(number: number): void {
        this.baffledNumbers.push(number);
    }

    newGame() {
        console.log("new game");
        this.reset();
    }
}
