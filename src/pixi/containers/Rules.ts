import * as PIXI from 'pixi.js';

import Button from '../components/Button';
import Scroll from '../components/Scroll';
import { gameService } from '../../state/stateMachine';

/**
 * Rules screen - gameplay guide + scoring (scrollable)
 */
export default class Rules extends PIXI.Container {
    private _background: PIXI.Sprite;

    private _title: PIXI.Text;

    private _scroll: Scroll;

    private _mainMenuButton: PIXI.Container;

    constructor() {
        super();
        this.name = 'Rules';
        this._init();
    }

    private _init() {
        this._createBackground();
        this._createTitle();
        this._createScrollBody();
        this._createMainMenuButton();
        this.visible = false;
    }

    private _createBackground() {
        this._background = new PIXI.Sprite(PIXI.Assets.cache.get('highscores'));
        this._background.anchor.set(0.5, 0.5);
        this.addChild(this._background);
    }

    private _createTitle() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 100,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 16,
        });

        this._title = new PIXI.Text('Rules', textStyle);
        this._title.anchor.set(0.5, 1);
        this._title.y = -this._background.height / 2 + 55;
        this.addChild(this._title);
    }

    private _createScrollBody() {
        const content = new PIXI.Container();
        const wrapWidth = this._background.width - 220;

        const sectionStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 44,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 7,
            align: 'left',
            wordWrap: true,
            wordWrapWidth: wrapWidth,
        });

        const bodyStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 36,
            fill: 0xecda81,
            strokeThickness: 3,
            stroke: 0x987800,
            align: 'left',
            lineHeight: 46,
            wordWrap: true,
            wordWrapWidth: wrapWidth,
        });

        let y = 0;
        const addGap = (amount = 16) => {
            y += amount;
        };
        const addText = (textContent: string, style: PIXI.TextStyle) => {
            const text = new PIXI.Text(textContent, style);
            text.anchor.set(0.5, 0);
            text.y = y;
            content.addChild(text);
            y += text.height + 10;
        };

        addText('How to play', sectionStyle);
        addText(
            [
                'A piece appears in the center.',
                'Place it on a side board with:',
                'arrow keys, WASD, or a swipe on mobile.',
                '',
                'Each board builds one octopus from 4 parts.',
                'You cannot place a part that is already there.',
                '',
                'Wrong move or timeout costs a life.',
                'After a few clears the timer speeds up',
                '(shown next to the bar as ×1.0, ×1.1, …).',
                'Losing a life eases the pace a bit.',
            ].join('\n'),
            bodyStyle,
        );
        addGap(18);
        addText('Scoring', sectionStyle);
        addText(
            'Complete an octopus to score points. Points depend on how many parts share the most common color:',
            bodyStyle,
        );
        addGap(8);
        addText(
            [
                '4 matching colors  -  200 pts',
                '3 matching colors  -  100 pts',
                '2 matching colors  -  50 pts',
                '1 matching color     -  10 pts',
            ].join('\n'),
            bodyStyle,
        );

        const viewportHeight = this._background.height - 360;
        const viewportWidth = this._background.width - 200;

        this._scroll = new Scroll(content, {
            width: viewportWidth,
            height: viewportHeight,
            trackGap: 8,
            trackWidth: 40,
        });
        this._scroll.y = -20;
        this.addChild(this._scroll);
    }

    private _createMainMenuButton() {
        this._mainMenuButton = new Button(() => {
            gameService.send({ type: 'MAIN_MENU' });
        }, 'Main Menu');
        this._mainMenuButton.x = this.width / 2 - this._mainMenuButton.width - 80;
        this._mainMenuButton.y = this.height / 2 - this._mainMenuButton.height - 80;
        this.addChild(this._mainMenuButton);
    }
}
