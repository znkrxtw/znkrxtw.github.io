import {StartUp} from './startup.js';
import {Logic} from './logic.js';
import {WikiData} from './wikiData.js';

class TwitchDactleGame {

    constructor(dependencies = {}) {
        // Initialize game state
        this.state = new GameState();

        // Dependency injection with defaults for backward compatibility
        this.ui = dependencies.ui || new UI(this);
        this.utility = dependencies.utility || new Utility();
        this.profileData = dependencies.profileData || new ProfileData(this);
        this.logic = dependencies.logic || new Logic(this);
        this.startUp = dependencies.startUp || new StartUp(this);

        // Wait for modals to be loaded before initializing
        document.addEventListener('modalsLoaded', () => {
            this.init().then();
        });
    }

    async init() {
        this.profileData.loadSave(this);

        if (!this.profileData.articleName) {
            this.profileData.articleName = this.logic.getArticleName();
        }

        this.wikiData = new WikiData(this);
        await this.wikiData.fetchData(true, this.profileData.articleName);

        window.redactleGame = this;
    }

    // Backward compatibility - expose state properties with getters and setters
    get baffled() {
        return this.state.baffled;
    }

    set baffled(value) {
        this.state.baffled = value;
    }

    get baffledNumbers() {
        return this.state.baffledNumbers;
    }

    set baffledNumbers(value) {
        this.state.baffledNumbers = value;
    }

    get answer() {
        return this.state.answer;
    }

    set answer(value) {
        this.state.answer = value;
    }

    get guessCounter() {
        return this.state.guessCounter;
    }

    set guessCounter(value) {
        this.state.guessCounter = value;
    }

    get ansStr() {
        return this.state.ansStr;
    }

    set ansStr(value) {
        this.state.ansStr = value;
    }

    get currentlyHighlighted() {
        return this.state.currentlyHighlighted;
    }

    set currentlyHighlighted(value) {
        this.state.currentlyHighlighted = value;
    }

    get hitCounter() {
        return this.state.hitCounter;
    }

    set hitCounter(value) {
        this.state.hitCounter = value;
    }

    get currentAccuracy() {
        return this.state.currentAccuracy;
    }

    set currentAccuracy(value) {
        this.state.currentAccuracy = value;
    }

    get clickThruIndex() {
        return this.state.clickThruIndex;
    }

    set clickThruIndex(value) {
        this.state.clickThruIndex = value;
    }

    get clickThruNodes() {
        return this.state.clickThruNodes;
    }

    set clickThruNodes(value) {
        this.state.clickThruNodes = value;
    }

    get redirectable() {
        return this.state.redirectable;
    }

    set redirectable(value) {
        this.state.redirectable = value;
    }

    get counting() {
        return this.state.conting;
    }

    set counting(value) {
        this.state.conting = value;
    }

    get ses() {
        return this.state.ses;
    }

    set ses(value) {
        this.state.ses = value;
    }

    get yesterday() {
        return this.state.yesterday;
    }

    set yesterday(value) {
        this.state.yesterday = value;
    }

    get loadingIcon() {
        return this.state.loadingIcon;
    }

    set loadingIcon(value) {
        this.state.loadingIcon = value;
    }

    get gameIsActive() {
        return this.state.gameIsActive;
    }

    set gameIsActive(value) {
        this.state.gameIsActive = value;
    }

    // Convenience methods for common operations
    incrementGuessCounter() {
        this.state.incrementGuessCounter();
    }

    incrementHitCounter() {
        this.state.incrementHitCounter();
    }

    setAnswer(answerString) {
        this.state.setAnswer(answerString);
    }
}

window.RedactleGame = new TwitchDactleGame();
