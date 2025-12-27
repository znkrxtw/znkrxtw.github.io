import {commonWords} from '../helper/commonWords.js';
import {IGame} from "@/content/twitchdactle/src/game/types.ts";
import {UI} from "@/content/twitchdactle/src/game/ui.ts";
import {GameState} from "@/content/twitchdactle/src/game/gameState.ts";
import {ProfileData} from "@/content/twitchdactle/src/game/profileData.ts";
import {Logic} from "@/content/twitchdactle/src/game/logic.ts";

export class WikiData {

    public ui: UI;
    public gameState: GameState;
    public profileData: ProfileData;
    public logic: Logic;

    public counting: boolean;
    public ansStr: string;

    constructor(game: IGame) {
        this.gameState = game.gameState;
        this.profileData = game.profileData;
        this.ui = game.ui;
        this.logic = game.logic;

        this.counting = false;
        this.ansStr = "";
    }

    async fetchData(retry: boolean, artStr: string) {
        const article = retry ? artStr : atob(artStr);
        this.ui.showSpinner();
        return await fetch('https://en.wikipedia.org/w/api.php?action=parse&format=json&page=' + article + '&prop=text&formatversion=2&origin=*')
            .then(resp => {
                if (!resp.ok) {
                    throw `Server error: [${resp.status}] [${resp.statusText}] [${resp.url}]`;
                }
                return resp.json();
            })
            .then(receivedJson => {
                this.counting = true;
                const cleanText = receivedJson.parse.text.replace(/<img[^>]*>/g, "").replace(/<small>/g, '').replace(/<\/small>/g, '').replace(/–/g, '-').replace(/<audio.*<\/audio>/g, "");
                this.ui.resetWikiHolder(cleanText);
                const redirecting = document.getElementsByClassName('redirectMsg');
                if (redirecting.length > 0) {
                    const redirectURL = document.querySelectorAll('.redirectText')[0].firstChild.firstChild.innerHTML.replace(/ /g, "_");
                    this.counting = false;
                    this.fetchData(!this.counting, redirectURL);
                }
                if (this.counting) {
                    let seeAlso;
                    if (document.getElementById("See_also") != null) {
                        seeAlso = document.getElementById("See_also")?.parentNode;
                    } else if (document.getElementById("Notes") != null) {
                        seeAlso = document.getElementById("Notes")?.parentNode;
                    } else if (document.getElementById("References") != null) {
                        seeAlso = document.getElementById("References")?.parentNode;
                    }
                    const elements = document.getElementsByClassName('mw-parser-output');
                    if (seeAlso) {
                        const alsoIndex = Array.prototype.indexOf.call(seeAlso.parentNode.children, seeAlso);
                        for (let i = alsoIndex; i < elements[0].children.length; i++) {
                            elements[0].removeChild(elements[0].children[i]);
                        }
                    }
                    const allBadElements = this.ui.getAllBadElements();

                    if (allBadElements) {
                        for (let i = 0; i < allBadElements.length; i++) {
                            allBadElements[i].remove();
                        }
                    }

                    const bElement = document.getElementsByTagName('b');
                    while (bElement.length) {
                        let parent = bElement[0].parentNode;
                        while (bElement[0].firstChild) {
                            parent!.insertBefore(bElement[0].firstChild, bElement[0]);
                        }
                        parent!.removeChild(bElement[0]);
                    }
                    const aElement = this.ui.getAlAnchorElements();
                    if (aElement) {
                        while (aElement.length) {
                            let parent = aElement[0].parentNode;
                            while (aElement[0].firstChild) {
                                parent!.insertBefore(aElement[0].firstChild, aElement[0]);
                            }
                            parent!.removeChild(aElement[0]);
                        }
                    }

                    const blockquote = document.getElementsByTagName('blockquote');
                    for (let i = 0; i < blockquote.length; i++) {
                        blockquote[i].innerHTML = blockquote[i].innerHTML.replace(/<[^>]*>?/gm, '');
                    }
                    const sup = document.getElementsByTagName('sup')
                    while (sup.length) {
                        sup[0].remove();
                    }
                    const excerpt = document.getElementsByClassName('excerpt');
                    while (excerpt.length) {
                        excerpt[0].remove();
                    }

                    elements[0].querySelectorAll('[title]').forEach(title => {
                        title.removeAttribute('title');
                    })

                    elements[0].querySelectorAll('.mw-headline').forEach(element => {
                        element.replaceWith(...element.childNodes);
                    });

                    let titleHolder = document.createElement("h1");
                    let titleTxt = article.replace(/_/g, ' ');
                    titleHolder.innerHTML = titleTxt;
                    elements[0].prepend(titleHolder);

                    this.ansStr = titleTxt.replace(/ *\([^)]*\) */g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    this.gameState.answer = this.ansStr.match(/\b(\w+'\w+|\w+)\b/g) || [];
                    this.gameState.answer = this.gameState.answer.filter(function (el) {
                        return commonWords.indexOf(el) < 0;
                    });

                    elements[0].innerHTML = elements[0].innerHTML.replace(/\(; /g, '(').replace(/\(, /g, '(').replace(/\(, /g, '(').replace(/: ​;/g, ';').replace(/ \(\) /g, ' ').replace(/<\/?span[^>]*>/g, "");

                    elements[0].querySelectorAll('*').forEach(el => {
                        el.removeAttribute('class');
                        el.removeAttribute('style');
                    });

                    this.punctuation(elements);

                    elements[0].innerHTML = elements[0].innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/(<style.*<\/style>)/g, "").replace(/(<span class="punctuation">.<\/span>)|(^|<\/?[^>]+>|\s+)|([^\s<]+)/g, '$1$2<span class="innerTxt">$3</span>').replace('<<span class="innerTxt">h1>', '<h1><span class="innerTxt">');
                    elements[0].querySelectorAll('*:empty').forEach(el => el.remove());
                    this.ui.replaceInnerHtml();

                    this.gameState.gameIsActive = true;
                    this.hideWords();

                    if (this.profileData.guessedWords.length > 0) {
                        for (let i = 0; i < this.profileData.guessedWords.length; i++) {
                            this.gameState.guessCounter += 1;
                            this.logic.performGuess(this.profileData.guessedWords[i][0], true);
                        }
                    }
                    if (this.profileData.numbersRevealed) {
                        this.ui.revealNumbers();
                    }

                    document.getElementById("autoPlural").checked = !!window.pluralizing;

                    if (this.profileData.hidingZero) {
                        document.getElementById("hideZero").checked = true;
                        this.ui.hideZero();
                    } else {
                        document.getElementById("hideZero").checked = false;
                        this.ui.showZero();
                    }

                    if (this.profileData.selectedArticles === 'custom') {
                        document.getElementById("selectArticle").value = 'custom';
                        this.logic.selectArticlesCustom();
                    } else {
                        document.getElementById("selectArticle").value = 'standard';
                        this.logic.selectArticlesStandard();
                    }

                    document.getElementById("streamName").value = this.profileData.streamName;

                    if (this.gameState.pageRevealed) {
                        this.logic.winRound(true);
                        this.profileData.saveProgress();
                    }

                    this.ui.wikiHolder.style.display = "flex";
                    this.ui.hideSpinner();
                }
            })
            .catch(err => {
                console.error("Error in while getting article: ", err);
                this.ui.hideSpinner();
            });
    }


    hideWords() {
        const root = this.ui.wikiHolder.querySelector('.mw-parser-output') || this.ui.wikiHolder;
        if (!root) return;

        // select all spans that are not already punctuation
        const nodes = root.querySelectorAll('span:not(.punctuation)');
        nodes.forEach(el => {
            // skip elements already revealed (data-word set) or empty nodes
            if (el.hasAttribute('data-word')) return;
            const raw = el.textContent;
            if (!raw || !raw.trim()) return;

            const txt = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
            if (commonWords.includes(txt)) return;

            // mark as baffled and record length (same behavior as original)
            el.setAttribute('word-length', txt.length.toString());

            // Store original text and replace with squares
            el.textContent = '█'.repeat(txt.length);

            // Create a simple object to track for revealing
            const baffledInstance = {
                element: el,
                elements: [{element: el}],
                originalText: raw,
                reveal: function () {
                    el.textContent = this.originalText;
                }
            };

            this.gameState.baffled.push([txt, baffledInstance]);

            // track numeric tokens separately (preserves original logic)
            if (!txt) {
                this.gameState.baffledNumbers.push(baffledInstance);
            }
        });
    }

    punctuation(elements: any[] | HTMLCollectionOf<Element>) {

        const root = elements[0];
        if (!root) return;

        // punctuation characters to wrap
        const rx = /([.,:()\[\]?!;`~\-\u2013—&*"])/g;
        const selectors = "p, blockquote, h1, h2, table, li, i, cite, span";

        // For each container, replace text node content with a fragment that has punctuation wrapped
        root.querySelectorAll(selectors).forEach((container: Element) => {
            // snapshot child nodes because we'll modify them
            Array.from(container.childNodes).forEach((node: ChildNode) => {
                if (node.nodeType !== Node.TEXT_NODE) return;
                const text = node.nodeValue;
                if (!text || !text.trim()) return;

                const replaced = text.replace(rx, '<span class="punctuation">$1</span>');
                // only replace when something changed
                if (replaced === text) return;

                const frag = document.createRange().createContextualFragment(replaced);
                node.parentNode?.replaceChild(frag, node);
            });
        });
    }
}