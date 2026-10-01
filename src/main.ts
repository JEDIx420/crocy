import { GameEngine } from './game/GameEngine';
import { UIManager } from './ui/UIManager';

async function bootstrap() {
  const container = document.getElementById('game-container')!;
  const loadingScreen = document.getElementById('loading-screen')!;

  const engine = new GameEngine(container);
  new UIManager(engine);

  try {
    // Relative path works both in dev server and GitHub Pages subpath
    await engine.loadAssets('./assets/');
  } catch (err) {
    console.error('Error during asset loading:', err);
  } finally {
    // Fade out loading screen
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 600);

    engine.start();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  bootstrap();
});
