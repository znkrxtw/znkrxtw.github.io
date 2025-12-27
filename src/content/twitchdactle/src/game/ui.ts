import {IGame} from './types';
import {GameState} from "@/content/twitchdactle/src/game/gameState.ts";
import {Logic} from "@/content/twitchdactle/src/game/logic";

export class UI {

    private gameState: GameState;
    private logic: Logic;

    public wikiHolder: HTMLElement | null;
    public guessLogBody: HTMLElement | null;
    private highlightedGuess: NodeListOf<Element>;
    private superHighlightedGuess: NodeListOf<Element>;
    private guessBody: NodeListOf<Element>;
    private readonly userGuess: HTMLInputElement | null;
    public readonly navBarButton: HTMLElement | null;
    private statRow: HTMLTableElement | null;
    private navBarButtonContainer: HTMLElement | null;
    private navBar: HTMLElement | null;
    private navBarBrand: HTMLElement | null;
    private navBarCollapse: HTMLElement | null;
    public spinner: HTMLElement | null;

    constructor(game: IGame) {
        this.gameState = game.gameState;
        this.logic = game.logic;

        // DOM references
        this.wikiHolder = document.getElementById("wikiHolder");
        this.guessLogBody = document.getElementById("guessLogBody");
        // statLogBody will be initialized on-demand when needed

        //guesses
        this.highlightedGuess = document.querySelectorAll('.highlighted');
        this.superHighlightedGuess = document.querySelectorAll('.superHighlighted');
        this.guessBody = document.querySelectorAll('#guessLogBody');
        this.userGuess = document.getElementById("userGuess") as HTMLInputElement;

        this.navBarButton = document.getElementById('hideNavBarButton');
        this.navBarButtonContainer = document.getElementById('hideNavBarButtonContainer');
        this.navBar = document.getElementById('navBar');
        this.navBarBrand = document.getElementById('navbar-brand');
        this.navBarCollapse = document.getElementById('navbarNav');

        this.statRow = document.getElementById("statsTable") as HTMLTableElement;

        this.spinner = document.getElementById('loadingSpinner');
    }

    removeHighlights(clearCur: boolean) {
        if (clearCur) {
            this.gameState.currentlyHighlighted = null;
        }

        this.highlightedGuess.forEach(function (el) {
            el.classList.remove('highlighted');
        });

        this.superHighlightedGuess.forEach(function (el) {
            el.classList.remove('superHighlighted');
        })

        this.guessBody.forEach((element) => {
            element.classList.remove('table-secondary');
        })
    }

    // helper used in logGuess for robust retrieval (keeps logic isolated)
    getInnerTextFromRow(row: HTMLTableRowElement, colIndex: number) {
        return row.getElementsByTagName('td')[colIndex].innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    emptyGuessBody() {
        this.guessBody.forEach(element => {
            element.innerHTML = '';
        });
    }

    revealPage() {
        this.removeHighlights(false);
        for (let i = 0; i < this.gameState.baffled.length; i++) {
            this.gameState.baffled[i][1].reveal();
        }
        this.gameState.pageRevealed = true;
    }

    displayStats(index: number, gameAnswers: [], gameScores: [], gameAccuracy: []) {
        if (this.statRow) {
            this.statRow.insertRow(1);
            this.statRow.innerHTML = '<td>' + (index + 1) + '</td><td>' + gameAnswers[index] + '</td><td>' + gameScores[index] + '</td><td>' + gameAccuracy[index] + '%</td>';
        }
    }

    hideZero() {
        this.gameState.hidingZero = true;
        document.querySelectorAll('.tableHits').forEach((el) => {
            if (el.innerHTML === '0') {
                el.parentElement?.classList.add('hiddenRow');
            }
        });
    }

    showZero() {
        this.gameState.hidingZero = false;
        document.querySelectorAll('.hiddenRow').forEach((el) => {
            if (el.innerHTML === '0') {
                el.parentElement?.classList.remove('hiddenRow');
            }
        });
    }

    revealNumbers() {
        this.gameState.numbersRevealed = true;
        for (let i = 0; i < this.gameState.baffledNumbers.length; i++) {
            this.gameState.baffledNumbers[i].reveal();
            const dataWord = this.gameState.baffledNumbers[i].elements[0].value;
            this.gameState.baffledNumbers[i].elements[0].element.setAttribute("data-word", dataWord);
            if (this.gameState.answer.includes(dataWord)) {
                this.gameState.answer = this.gameState.answer.filter(function (e) {
                    return e !== dataWord
                })
            }
            if (this.gameState.answer.length === 0) {
                this.logic.winRound(true);
                break;
            }
        }
    }

    disableUserGuess() {
        if (this.userGuess) {
            this.userGuess.disabled = true;
        }
    }

    enableUserGuess() {
        if (this.userGuess) {
            this.userGuess.disabled = false;
        }
    }

    toggleNavBar() {
        this.navBarBrand?.classList.toggle('hidden');
        this.navBarCollapse?.classList.toggle('hidden');
        this.navBarButtonContainer?.classList.toggle('shrink');
        const isNavBarHidden = this.navBar?.classList.toggle('hidden');
        if (this.navBarButton) {
            this.navBarButton.innerText = isNavBarHidden ? "↓" : "↑";
        }
    }

    showSpinner() {
        let textBox = document.getElementById('.mw-parser-output');
        if (textBox) {
            textBox.style.display = 'none';
        }
        this.spinner?.classList.add('visible');
    }

    hideSpinner() {
        this.spinner?.classList.remove('visible');
        let textBox = document.getElementById('.mw-parser-output');
        if (textBox) {
            textBox.style.display = 'block';
        }
    }
}