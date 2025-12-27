import {StartUp} from './startup.ts';
import {Logic} from './logic.ts';
import {WikiData} from './wikiData.ts';
import {UI} from './ui.ts';
import {ProfileData} from './profileData.ts';
import {GameState} from './gameState.ts';

export class TwitchDactleGame {
    public ui: UI;
    public gameState: GameState;
    public profileData: ProfileData;
    public logic: Logic;
    private wikiData: WikiData;

    constructor() {
        this.gameState = new GameState();
        this.ui = new UI(this);
        this.profileData = new ProfileData(this);
        this.logic = new Logic(this);
        this.wikiData = new WikiData(this);

        // Initialize startup for event listeners (no need to store reference)
        new StartUp(this);

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
                get() { return this.gameState[prop]; },
                set(value) { this.gameState[prop] = value; },
                enumerable: true,
                configurable: true
            });
        });
    }

    async init() {
        this._initializeStateProperties();
        
        this.profileData.loadSave();

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
