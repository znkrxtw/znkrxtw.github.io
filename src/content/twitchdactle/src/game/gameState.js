export class GameState {

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
        this.conting = undefined;
        this.ses = undefined;
        this.yesterday = undefined;
        this.loadingIcon = undefined;
        this.gameIsActive = false;
    }
    
    // Getters for commonly accessed state
    get isGameActive() {
        return this.gameIsActive;
    }
    
    get totalGuesses() {
        return this.guessCounter;
    }
    
    get currentHits() {
        return this.hitCounter;
    }
    
    // State management methods
    incrementGuessCounter() {
        this.guessCounter++;
    }
    
    incrementHitCounter() {
        this.hitCounter++;
    }
    
    setGameActive(active) {
        this.gameIsActive = active;
    }
    
    setAnswer(answerString) {
        this.ansStr = answerString;
    }
    
    addBaffledWord(word) {
        this.baffled.push(word);
    }
    
    addBaffledNumber(number) {
        this.baffledNumbers.push(number);
    }
}
