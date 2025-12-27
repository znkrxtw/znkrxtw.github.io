import {modalManager} from '../modals';
import {UI} from './ui.ts';
import {ProfileData} from './profileData.ts';
import {Logic} from './logic.ts';
import {GameState} from "./gameState.ts";
import {IGame} from './types';

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
        input?.addEventListener("keyup", (event) => {
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

        this.InitHideZero();
        this.InitAutoPlural();
        this.InitSelectedArticle();
        this.InitStreamName();

        document.getElementById('infoBtn')?.addEventListener('click', async () => {
            await modalManager.showModal('info');
        });

        document.getElementById('statsBtn')?.addEventListener('click', async () => {
            this.logic.buildStats();
            await modalManager.showModal('stats');
        });

        document.getElementById('settingsBtn')?.addEventListener('click', async () => {
            await modalManager.showModal('settings');
        });

        document.getElementById('newGameBtn')?.addEventListener('click', async () => {
            await modalManager.showModal('newGame');
        });

        document.getElementById('revealPageButton')?.addEventListener('click', async () => {
            await modalManager.showModal('revealPage');
        });

        document.getElementById('revealNumbersButton')?.addEventListener('click', () => {
            this.ui.revealNumbers();
            this.profileData.saveProgress();
        });

        document.querySelectorAll('.closeInfo').forEach((element) => {
            element.addEventListener('click', async () => {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('info');
            });
        });

        document.querySelectorAll('.closeSettings').forEach((element) => {
            element.addEventListener('click', async () => {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('settings');
                this.profileData.streamName = (document.getElementById('streamName') as HTMLInputElement).value;
                this.connectStream();
                this.profileData.saveProgress();
            });
        });

        document.querySelectorAll('.closeStats').forEach(function (element) {
            element.addEventListener('click', async () => {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('stats');
            });
        });

        document.querySelectorAll('.closeReveal').forEach(function (element) {
            element.addEventListener('click', async () => {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('revealPage');
            });
        });

        document.querySelectorAll('.closeNewGame').forEach(function (element) {
            element.addEventListener('click', async () => {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('newGame');
            });
        });

        document.querySelectorAll('.doReveal').forEach((element) => {
            element.addEventListener('click', async () => {
                this.logic.winRound(false);
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('revealPage');
            });
        });

        document.getElementById('backToTop')?.addEventListener('click', () => {
            const articleContainer = document.querySelector('.article-container');
            if (articleContainer) {
                articleContainer.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });

        // Hide/show back to top button based on scroll position
        const articleContainer = document.querySelector('.article-container');
        const backToTopButton = document.getElementById('backToTop') as HTMLElement;
        
        if (articleContainer && backToTopButton) {
            articleContainer.addEventListener('scroll', () => {
                if (articleContainer.scrollTop > 100) {
                    backToTopButton.style.opacity = '1';
                } else {
                    backToTopButton.style.opacity = '0';
                }
            });
        }

        document.getElementById('startNewGame')?.addEventListener('click', () => {
            this.profileData.newGame();
            this.ui.disableUserGuess();
            this.ui.emptyGuessBody();
        });

        this.ui.navBarButton?.addEventListener('click', () => {
            this.ui.toggleNavBar();
        });

        window.onclick = async (event) => {
            if (event.target === document.getElementById("infoModal")) {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('info');
            }
            if (event.target === document.getElementById("settingsModal")) {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('settings');
                this.connectStream();
            }
            if (event.target === document.getElementById("statsModal")) {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('stats');
            }
            if (event.target === document.getElementById("revealModal")) {
                (document.activeElement as HTMLElement).blur();
                await modalManager.hideModal('revealPage');
            }
        };

        // Initialize ComfyJS if available
        this.initComfyJS();
    }

    private InitStreamName() {
        const streamName = document.getElementById('streamName') as HTMLInputElement;
        if (streamName) {
            streamName.value = this.profileData.streamName;

            streamName.addEventListener('change', (event) => {
                const target = event.target as HTMLInputElement;
                this.profileData.streamName = target.value;
                this.profileData.saveProgress();
            });
        }
    }

    private InitSelectedArticle() {
        const selectedArticle = document.getElementById('selectArticle') as HTMLSelectElement;
        if (selectedArticle) {
            selectedArticle.value = this.profileData.selectedArticles;

            selectedArticle.addEventListener('change', (event) => {
                const target = event.target as HTMLSelectElement;
                this.profileData.selectedArticles = target.value === 'custom' ? 'custom' : 'standard';
                this.profileData.saveProgress();
            });
        }
    }

    private InitAutoPlural() {
        const autoPlural = document.getElementById('autoPlural') as HTMLInputElement;

        if (autoPlural) {
            autoPlural.checked = this.profileData.pluralizing;

            autoPlural?.addEventListener('change', (event) => {
                const target = event.target as HTMLInputElement;
                this.profileData.pluralizing = target.checked;
                this.profileData.saveProgress();
            });
        }
    }

    private InitHideZero() {
        const hideZero = document.getElementById('hideZero') as HTMLInputElement;

        if (hideZero) {
            if (this.profileData.hidingZero) {
                hideZero.checked = this.profileData.hidingZero;
                this.ui.hideZero();
            } else {
                hideZero.checked = false;
                this.ui.showZero();
            }

            hideZero.addEventListener('change', (event) => {
                const target = event.target as HTMLInputElement;
                target.checked ? this.ui.hideZero() : this.ui.showZero();
                this.profileData.saveProgress();
            });
        }
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
