// Dynamic script loader for game modules
class GameLoader {
    constructor() {
        this.loadedScripts = new Set();
    }

    async loadScript(src) {
        if (this.loadedScripts.has(src)) {
            return;
        }

        try {
            const response = await fetch(src);
            if (!response.ok) {
                console.error(`Failed to load ${src}: ${response.status}`);
                return;
            }
            const script = await response.text();
            eval(script);
            this.loadedScripts.add(src);
            console.log(`Loaded: ${src}`);
        } catch (error) {
            console.error(`Error loading ${src}:`, error);
        }
    }

    async loadGame() {
        // Load scripts in dependency order
        const scripts = [
            'src/commonWords.js',
            'src/pluralize.js',
            'src/lib/clipboard/clipboard.js',
            'src/lib/baffle/baffle.min.js',
            'src/gameList.js',
            'src/articleNames.js',
            'src/customArticleNames.js',
            'src/rejectionFunctions.js',
            'src/game/logic.js',
            'src/game/profileData.js',
            'src/game/startup.js',
            'src/game/ui.js',
            'src/game/utility.js',
            'src/game/wikiData.js',
            'src/game/gameState.js',
            'src/game/redactleGame.js'
        ];

        for (const script of scripts) {
            await this.loadScript(script);
        }

        console.log('All game scripts loaded');
    }
}

// Initialize the game when DOM is ready
const gameLoader = new GameLoader();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gameLoader.loadGame();
    });
} else {
    gameLoader.loadGame();
}
