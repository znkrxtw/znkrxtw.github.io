import {commonWords} from '../helper/commonWords.js';
import {articles} from '../helper/articleNames.js';
import {customArticles} from '../helper/customArticleNames.js';
import {confetti} from "@tsparticles/confetti";
import pluralize from "pluralize";
import {IGame} from "@/content/twitchdactle/src/game/types.ts";
import {ProfileData} from "@/content/twitchdactle/src/game/profileData.ts";
import {GameState} from "@/content/twitchdactle/src/game/gameState.ts";
import {UI} from "@/content/twitchdactle/src/game/ui.ts";

export class Logic {

    private profileData: ProfileData;
    private gameState: GameState;
    private ui: UI;

    private clickThruIndex: number;
    private currentlyHighlighted: string | null;
    private guessCounter: number;
    private hitCounter: number;
    private currentAccuracy: string;

    constructor(game: IGame) {
        this.profileData = game.profileData;
        this.gameState = game.gameState;
        this.ui = game.ui;

        this.clickThruIndex = 0;
        this.currentlyHighlighted = null;
        this.guessCounter = 0;
        this.hitCounter = 0;
        this.currentAccuracy = "";
    }

    performGuess(guessedWord: string, populate: boolean) {
        if (!this.gameState.gameIsActive) {
            return;
        }
        this.clickThruIndex = 0;
        this.ui.removeHighlights(false);
        const normGuess = guessedWord.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        if (!commonWords.includes(normGuess)) {
            let alreadyGuessed = false;
            for (let i = 0; i < this.profileData.guessedWords.length; i++) {
                if (this.profileData.guessedWords[i][0] === normGuess) {
                    alreadyGuessed = true;
                }
            }
            if (!alreadyGuessed || populate) {
                let numHits = 0;
                for (let i = 0; i < this.gameState.baffled.length; i++) {
                    if (this.gameState.baffled[i][0] === normGuess) {
                        this.gameState.baffled[i][1].reveal();
                        this.gameState.baffled[i][1].elements[0].element.setAttribute("data-word", normGuess);
                        numHits += 1;
                        if (!populate) {
                            this.gameState.baffled[i][1].elements[0].element.classList.add("highlighted");
                            this.currentlyHighlighted = normGuess;
                        }
                    }
                }
                this.profileData.updateGuesses();
                if (!populate) {
                    this.guessCounter += 1;
                    this.profileData.guessedWords.push([normGuess, numHits]);
                    this.profileData.saveProgress();
                }
                this.logGuess([normGuess, numHits], populate);
            } else {
                const guess = document.querySelector("tr[data-guess='" + normGuess + "']");
                if(!guess){
                    return;
                }
                guess.classList.add("table-secondary");
                guess.scrollIntoView();
                this.currentlyHighlighted = normGuess;
                document.querySelectorAll('.innerTxt').forEach((element) => {
                    if (element.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === normGuess) {
                        element.classList.add('highlighted');
                    }
                });
            }
            if (this.gameState.answer.includes(normGuess)) {
                this.gameState.answer = this.gameState.answer.filter(function (e) {
                    return e !== normGuess
                })
            }
            if (this.gameState.answer.length === 0) {
                this.winRound(populate);
            }
        }
    }

    selectArticlesStandard() {
        this.profileData.selectedArticles = 'standard';
        this.profileData.saveProgress();
    }

    selectArticlesCustom() {
        this.profileData.selectedArticles = 'custom';
        this.profileData.saveProgress();
    }

    buildStats() {
        if(!this.ui.statLogBody){
            return;
        }
        for (let i = this.ui.statLogBody.rows.length - 1; i > 0; i--) {
            this.ui.statLogBody.deleteRow(i);
        }
        for (let i = 0; i < this.profileData.gameWins.length; i++) {
            if (this.profileData.gameWins[i] === 1) {
                this.ui.displayStats(i, this.profileData.gameAnswers, this.profileData.gameScores, this.profileData.gameAccuracy);
            }
        }
    }

    getArticleName() {
        const selectElement = document.getElementById("selectArticle") as HTMLSelectElement;
        const value = selectElement ? selectElement.value : 'standard';
        if (value === 'custom') {
            return customArticles[Math.floor(Math.random() * customArticles.length)];
        }
        return articles[Math.floor(Math.random() * articles.length)];
    }

    enterGuess(allGuesses: string[], pluralizing: boolean) {
        if (pluralizing) {
            const pluralGuess = pluralize(allGuesses[0]);
            const singularGuess = pluralize(allGuesses[0], 1);
            if (pluralGuess !== allGuesses[0]) allGuesses.push(pluralGuess);
            if (singularGuess !== allGuesses[0]) allGuesses.push(singularGuess);
        }
        for (let i = allGuesses.length - 1; i > -1; i--) {
            this.performGuess(allGuesses[i], false);
        }
    }

    logGuess(guess: [string, number], populate: boolean) {
        if (this.profileData.hidingZero) {
            this.ui.hideZero();
        }
        let newRow = this.ui.guessLogBody?.insertRow(0);
        if(!newRow){
            return;
        }

        newRow.className = 'curGuess';
        newRow.setAttribute('data-guess', guess[0]);
        if (!populate) {
            newRow.classList.add('table-secondary');
        }
        if (guess[1] > 0) {
            this.hitCounter += 1;
        }
        if (!this.profileData.pageRevealed) {
            this.currentAccuracy = ((this.hitCounter / this.profileData.guessedWords.length) * 100).toFixed(2);
        }
        if (guess[1] > 0) {
            newRow.addEventListener('click', (e) => {
                e.preventDefault();
                const inTxt = this.ui.getInnerTextFromRow(newRow, 1);
                const allInstances = this.ui.wikiHolder?.querySelectorAll('[data-word="' + inTxt + '"]');
                if (this.currentlyHighlighted == null) {
                    this.clickThruIndex = 0;
                    this.currentlyHighlighted = inTxt;
                    newRow.classList.add('table-secondary');
                    document.querySelectorAll('.innerTxt').forEach((element) => {
                        if (element.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === this.currentlyHighlighted) {
                            element.classList.add('highlighted');
                        }
                    });
                } else {
                    if (inTxt !== this.currentlyHighlighted) {
                        this.clickThruIndex = 0;
                        this.ui.removeHighlights(false);
                        newRow.classList.add('table-secondary');
                        document.querySelectorAll('.innerTxt').forEach((element) => {
                            if (element.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === inTxt) {
                                element.classList.add('highlighted');
                            }
                        })
                        this.currentlyHighlighted = inTxt;
                    }
                }
                document.querySelectorAll('.superHighlighted').forEach((element) => {
                    element.classList.remove('superHighlighted');
                });
                if (allInstances && allInstances.length > 0) {
                    allInstances[this.clickThruIndex % allInstances.length].classList.add('superHighlighted');
                    allInstances[this.clickThruIndex % allInstances.length].scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                        inline: 'end'
                    });
                }
                this.clickThruIndex += 1;
            });
        } else {
            newRow.addEventListener('click', () => {
                this.ui.removeHighlights(true);
            });
        }
        newRow.innerHTML = '<td>' + "remove this" + '</td><td>' + guess[0] + '</td><td class="tableHits">' + guess[1] + '</td>';
        if (!populate) {
            newRow.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'end'
            });
        }
    }

    winRound(populate: boolean) {
        this.gameState.gameIsActive = false;
        this.ui.disableUserGuess();
        const clap = new Audio('Clap.wav');
        clap.volume = 0.5;
        clap.addEventListener('canplaythrough', clap.play);
        confetti({
            scalar: 10,
            particleCount: 50,
            spread: 70,
            shapes: ["emoji", "image"],
            shapeOptions: {
                emoji: {
                    value: ["🍆", "💧", "💦", "🥵", "🍑"]
                }
            },
            origin: {y: 0.6}
        }).then(() => {
            this.ui.revealPage();
            if (!populate) {
                this.profileData.gameScores[this.profileData.twitchDactleIndex] = this.profileData.guessedWords.length;
                this.profileData.gameAccuracy[this.profileData.twitchDactleIndex] = this.currentAccuracy;
                this.profileData.gameAnswers[this.profileData.twitchDactleIndex] = this.gameState.ansStr;
                this.profileData.gameWins[this.profileData.twitchDactleIndex] = 1;
            }
        });
        let streakCount = 0;
        for (let i = this.profileData.gameWins.length; i > -1; i--) {
            if (this.profileData.gameWins[i] === 1) {
                streakCount += 1;
            }
            if (this.profileData.gameWins[i] === 0) {
                break;
            }
        }
    }
}