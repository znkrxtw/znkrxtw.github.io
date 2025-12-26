import {StartUp} from './startup.js';
import {Logic} from './logic.js';
import {WikiData} from './wikiData.js';
import {UI} from './ui.js';
import {Utility} from './utility.js';
import {ProfileData} from './profileData.js';
import {GameState} from './gameState.js';

class TwitchDactleGame {

    constructor() {
        this.state = new GameState();
        this.ui = new UI(this);
        this.utility = new Utility();
        this.profileData = new ProfileData(this);
        this.logic = new Logic(this);
        this.startUp = new StartUp(this);
        this.wikiData = new WikiData(this);

        // Initialize immediately - modals are loaded synchronously
        this.init();
    }

    // Auto-create getters and setters for all state properties
    // This maintains backward compatibility while reducing boilerplate
    _initializeStateProperties() {
        const stateProps = [
            'baffled', 'baffledNumbers', 'answer', 'guessCounter', 'ansStr',
            'currentlyHighlighted', 'hitCounter', 'currentAccuracy',
            'clickThruIndex', 'clickThruNodes', 'redirectable', 'counting',
            'ses', 'yesterday', 'loadingIcon', 'gameIsActive'
        ];
        
        stateProps.forEach(prop => {
            Object.defineProperty(this, prop, {
                get() { return this.state[prop]; },
                set(value) { this.state[prop] = value; },
                enumerable: true,
                configurable: true
            });
        });
    }

    async init() {
        this._initializeStateProperties();
        
        this.profileData.loadSave(this);

        if (!this.profileData.articleName) {
            this.profileData.articleName = this.logic.getArticleName();
        }

        await this.wikiData.fetchData(true, this.profileData.articleName);
    }
}

// Factory function to create game instance
export const createGame = () => {
    return new TwitchDactleGame();
};
