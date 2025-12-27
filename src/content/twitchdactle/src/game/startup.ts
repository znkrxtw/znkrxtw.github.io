import 'bootstrap';
import { modalManager } from '../modals';
import {UI} from './ui';
import {ProfileData} from './profileData.ts';
import {Logic} from './logic';
import {GameState} from "./gameState.ts";

// Game interface to break circular dependency
interface IGame {
    ui: UI;
    profileData: ProfileData;
    logic: Logic;
    gameState: GameState;
}

export class StartUp {

    public ui: UI;
    private profileData: ProfileData;
    private logic: Logic;
    private gameState: GameState;
    private ComfyJS: any;

    constructor(game: IGame) {
        this.ui = game.ui;
        this.logic = game.logic;
        this.gameState = game.gameState;
        this.profileData = game.profileData;

        // Modals are now loaded synchronously, so we can initialize immediately
        this.init();
    }

    init() {

        const input = document.getElementById("userGuess") as HTMLInputElement;
        input?.addEventListener("keyup",  (event) => {
            if (event.key === "Enter" && event.shiftKey) {
                event.preventDefault();
                const pluralizing = (this.profileData.pluralizing !== event.shiftKey);
                if (input.value.trim() !== '') {
                    const allGuesses = [input.value.replace(/\s/g, '')];
                    this.logic.enterGuess(allGuesses, pluralizing);
                }
                input.value = '';
            } else if (event.key === "Enter") {
                if (input.value.trim() !== '') {
                    const allGuesses = [input.value.replace(/\s/g, '')];
                    this.logic.enterGuess(allGuesses, this.profileData.pluralizing);
                }
                input.value = '';
            }
        });

        document.getElementById("submitGuess")?.addEventListener("click", () => {
            const userGuess = document.getElementById("userGuess") as HTMLInputElement;
            if (userGuess.value.trim() !== '') {
                const allGuesses = [userGuess.value.replace(/\s/g, '')];
                this.logic.enterGuess(allGuesses, this.profileData.pluralizing);
            }
        });

        document.getElementById('hideZero')?.addEventListener('change',  (event) => {
            const target = event.target as HTMLInputElement;
            target.checked ? this.ui.hideZero(): this.ui.showZero();
            this.profileData.saveProgress();
        });

        document.getElementById('autoPlural')?.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            this.profileData.pluralizing = target.checked;
            this.profileData.saveProgress();
        });

        document.getElementById('selectArticle')?.addEventListener('change', (event) => {
            const target = event.target as HTMLSelectElement;
            this.profileData.selectedArticles = target.value === 'custom' ? 'custom' : 'standard';
            this.profileData.saveProgress();
        });

        document.getElementById('streamName')?.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            this.profileData.streamName = target.value;
            this.profileData.saveProgress();
        });

        document.getElementById('infoBtn')?.addEventListener('click', async () => {
            await modalManager.showModal('info');
            document.body.style.overflow = "hidden";
        });

        document.getElementById('statsBtn')?.addEventListener('click', async () => {
            this.logic.buildStats();
            await modalManager.showModal('stats');
            document.body.style.overflow = "hidden";
        });

        document.getElementById('settingsBtn')?.addEventListener('click', async () => {
            await modalManager.showModal('settings');
            document.body.style.overflow = "hidden";
        });

        document.getElementById('revealPageButton')?.addEventListener('click', async () => {
            await modalManager.showModal('revealPage');
            document.body.style.overflow = "hidden";
        });

        document.getElementById('revealNumbersButton')?.addEventListener('click', () => {
            this.ui.revealNumbers();
            this.profileData.saveProgress();
        });

        document.querySelectorAll('.closeInfo').forEach((element) => {
            element.addEventListener('click',  async () => {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('info');
                document.body.style.overflow = "auto";
            });
        });

        document.querySelectorAll('.closeSettings').forEach((element) => {
            element.addEventListener('click', async () => {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('settings');
                document.body.style.overflow = "auto";
                this.profileData.streamName = (document.getElementById('streamName') as HTMLInputElement).value;
                this.connectStream();
                this.profileData.saveProgress();
            });
        });

        document.querySelectorAll('.closeStats').forEach(function (element) {
            element.addEventListener('click', async ()=> {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('stats');
                document.body.style.overflow = "auto";
            });
        });

        document.querySelectorAll('.closeReveal').forEach(function (element) {
            element.addEventListener('click', async () => {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('revealPage');
                document.body.style.overflow = "auto";
            });
        });

        document.querySelectorAll('.doReveal').forEach( (element) => {
            element.addEventListener('click', async() => {
                this.logic.winRound(false);
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('revealPage');
                document.body.style.overflow = "auto";
            });
        });

        document.getElementById('backToTop')?.addEventListener('click', function () {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });

        document.getElementById('newGame')?.addEventListener('click',  () => {
            this.profileData.newGame();
            this.ui.disableUserGuess();
            this.ui.emptyGuessBody();
        });

        this.ui.navBarButton?.addEventListener('click',  () => {
            this.ui.toggleNavBar();
        });

        window.onclick = async(event) => {
            if (event.target === document.getElementById("infoModal")) {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('info');
                document.querySelector("body")!.style.overflow = "auto";
            }
            if (event.target === document.getElementById("settingsModal")) {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('settings');
                document.querySelector("body")!.style.overflow = "auto";
                this.connectStream();
            }
            if (event.target === document.getElementById("statsModal")) {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('stats');
                document.querySelector("body")!.style.overflow = "auto";
            }
            if (event.target === document.getElementById("revealModal")) {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('revealPage');
                document.querySelector("body")!.style.overflow = "auto";
            }
        };

        // Initialize ComfyJS if available
        //this.initComfyJS();
    }

    async initComfyJS() {
        try {
            const ComfyJS = await import('comfy.js');
            
            ComfyJS.default.onChat = (message) => {
                const firstWord = [message.split(' ')[0]];
                const autoPlural = document.getElementById('autoPlural') as HTMLInputElement;
                const pluralizing = autoPlural?.checked;
                this.logic.enterGuess(firstWord, pluralizing);
            };

            ComfyJS.default.onCommand = (command) => {
                if (command === "next" && this.gameState.pageRevealed) {
                    this.gameState.newGame();
                }
            };
            
            this.ComfyJS = ComfyJS;

            this.connectStream();
        } catch (e) {
            console.warn('ComfyJS could not be loaded:', e);
        }
    }

    connectStream() {
        if (this.profileData.streamName && this.ComfyJS) {
            this.ComfyJS.default.Init(this.profileData.streamName);
        }
    }
}
