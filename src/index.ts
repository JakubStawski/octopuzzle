import { gameService } from './state/stateMachine';
import Stage from './pixi/core/Stage';
import { setKeyBindings, addVisibilityChangeListener } from './engine/utils';
import SoundMediator from './engine/SoundMediator';

const soundMediator = new SoundMediator();

// Start game function to export as a package
const startGame = () => {
    const Octopuses = new Stage();
    //
    gameService.start();
    // window.addEventListener('assetsLoaded', () => {
    //     gameService.send({ type: 'START' });
    // });
};

// Setting the stage up
startGame();
// Setting arrow keys to control the game for player
setKeyBindings();
addVisibilityChangeListener();
