import infoModal from './modals/info.html?raw';
import settingsModal from './modals/settings.html?raw';
import statsModal from './modals/stats.html?raw';
import revealPageModal from './modals/revealPage.html?raw';

export function loadModals() {
    const modals = [
        { name: 'info', html: infoModal },
        { name: 'settings', html: settingsModal },
        { name: 'stats', html: statsModal },
        { name: 'revealPage', html: revealPageModal }
    ];

    modals.forEach(({ name, html }) => {
        if (html) {
            document.body.insertAdjacentHTML('beforeend', html);
        } else {
            console.warn(`Modal ${name} not found`);
        }
    });
}
