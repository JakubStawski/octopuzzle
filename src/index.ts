import { gameService } from './state/stateMachine';
import Stage from './pixi/Stage';
import { setKeyBindings, addVisibilityChangeListener } from './engine/utils';
import { gameStartedSound } from './engine/game';
import SoundMediator from './engine/SoundMediator';

const soundMediator = new SoundMediator();

// Start game function to export as a package
const startGame = () => {
    const Octopuses = new Stage();
    //
    gameService.start();
    window.addEventListener('assetsLoaded', () => {
        gameService.send({ type: 'START' });
        window.dispatchEvent(gameStartedSound);
    });
};

// Setting the stage up
startGame();
// Setting arrow keys to control the game for player
setKeyBindings();
addVisibilityChangeListener();
