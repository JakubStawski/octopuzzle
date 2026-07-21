import { gameService } from './state/stateMachine';
import Stage from './pixi/core/Stage';
import { setKeyBindings, setSwipeBindings, addVisibilityChangeListener } from './engine/utils';
import SoundMediator from './engine/SoundMediator';

// Side-effect: wires Howler to gameService events
const soundMediator = new SoundMediator();

const startGame = () => {
    // eslint-disable-next-line no-new
    new Stage();
    gameService.start();
};

startGame();
setKeyBindings();
setSwipeBindings();
addVisibilityChangeListener();

export { soundMediator };
