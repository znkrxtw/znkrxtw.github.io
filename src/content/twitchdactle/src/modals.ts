import infoModal from './modals/info.html?raw';
import settingsModal from './modals/settings.html?raw';
import statsModal from './modals/stats.html?raw';
import revealPageModal from './modals/revealPage.html?raw';
import newGameModal from './modals/newGame.html?raw';
import 'bootstrap';
import { Modal } from 'bootstrap';

interface ModalData {
  [key: string]: any;
}

class ModalManager {
  private static instance: ModalManager;
  private activeModals: Map<string, Modal> = new Map();
  private modalElements: Map<string, HTMLElement> = new Map();

  static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  private constructor() {
    this.loadModals();
  }

  private loadModals(): void {
    const modals = [
      { name: 'info', html: infoModal },
      { name: 'settings', html: settingsModal },
      { name: 'stats', html: statsModal },
      { name: 'revealPage', html: revealPageModal },
      { name: 'newGame', html: newGameModal },
    ];

    modals.forEach(({ name, html }) => {
      if (html) {
        document.body.insertAdjacentHTML('beforeend', html);
        const element = document.getElementById(`${name}Modal`);
        if (element) {
          this.modalElements.set(name, element);
          this.activeModals.set(name, new Modal(element));
        }
      } else {
        console.warn(`Modal ${name} not found`);
      }
    });
  }

  showModal(name: string, data?: ModalData): Promise<void> {
    return new Promise((resolve, reject) => {
      const modal = this.activeModals.get(name);
      const element = this.modalElements.get(name);
      
      if (!modal || !element) {
        reject(new Error(`Modal ${name} not found`));
        return;
      }

      // Handle data injection if provided
      if (data) {
        this.injectData(element, data);
      }

      // Listen for modal to be shown
      element.addEventListener('shown.bs.modal', () => {
        resolve();
      }, { once: true });

      modal.show();
    });
  }

  hideModal(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const modal = this.activeModals.get(name);
      const element = this.modalElements.get(name);
      
      if (!modal || !element) {
        reject(new Error(`Modal ${name} not found`));
        return;
      }

      // Listen for modal to be hidden
      element.addEventListener('hidden.bs.modal', () => {
        resolve();
      }, { once: true });

      modal.hide();
    });
  }

  private injectData(element: HTMLElement, data: ModalData): void {
    // Example: Find elements with data-bind attributes and populate them
    Object.entries(data).forEach(([key, value]) => {
      const targetElements = element.querySelectorAll(`[data-bind="${key}"]`);
      targetElements.forEach(el => {
        if (el instanceof HTMLInputElement) {
          el.value = String(value);
        } else {
          el.textContent = String(value);
        }
      });
    });
  }

  // Convenience methods for specific modals
  showInfoModal(): Promise<void> {
    return this.showModal('info');
  }

  showSettingsModal(): Promise<void> {
    return this.showModal('settings');
  }

  showStatsModal(): Promise<void> {
    return this.showModal('stats');
  }

  showRevealPageModal(): Promise<void> {
    return this.showModal('revealPage');
  }
}

// Export singleton instance
export const modalManager = ModalManager.getInstance();

// Legacy export for compatibility
export function loadModals() {
  // Modals are now loaded automatically by ModalManager
}
