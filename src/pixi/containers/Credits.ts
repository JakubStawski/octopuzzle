import * as PIXI from 'pixi.js';

import Button from '../components/Button';
import Scroll from '../components/Scroll';
import { gameService } from '../../state/stateMachine';

/**
 * Credits screen - asset attribution (scrollable)
 */
export default class Credits extends PIXI.Container {
    private _background: PIXI.Sprite;

    private _title: PIXI.Text;

    private _scroll: Scroll;

    private _mainMenuButton: PIXI.Container;

    constructor() {
        super();
        this.name = 'Credits';
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

        this._title = new PIXI.Text('Credits', textStyle);
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
            fontSize: 48,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 8,
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

        const linkStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 28,
            fill: 0xb8e8ff,
            strokeThickness: 2,
            stroke: 0x2a5a70,
            align: 'left',
            lineHeight: 36,
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

        addText('Author', sectionStyle);
        addText('Octo`puzzle by Jakub Stawski', bodyStyle);
        addGap(18);
        addText('Audio', sectionStyle);
        addText(
            'The following audio assets were obtained from Pixabay and are used under the Pixabay Content License:',
            bodyStyle,
        );
        addText(
            [
                '"Technology Click" - Pixabay',
                '"Nature Gentle Ocean and Birdsong" - Pixabay',
                '"Marimba Ringtone" sound effects - Pixabay',
                '"Musical Ukewave" - Pixabay',
                '"Bubble Pop 06" (countdown 3-2-1) - Universfield / Pixabay',
                '"bubble pop" (countdown Go) - u_xio2tir4to / Pixabay',
                '"Correct Answer Toy Bi-bling" (score popup) - Pixabay',
                'Additional sound effects from FreeSound Community via Pixabay',
            ].join('\n'),
            bodyStyle,
        );
        addGap(8);
        addText('Sources:', bodyStyle);
        addText(
            [
                'https://pixabay.com/sound-effects/technology-click-21156/',
                'https://pixabay.com/sound-effects/nature-gentle-ocean-and-birdsong-24068/',
                'https://pixabay.com/users/freesound_community-46691455/',
                'https://pixabay.com/pl/sound-effects/search/marimba%20ringtone/',
                'https://pixabay.com/sound-effects/musical-ukewave-74471/',
                'https://pixabay.com/sound-effects/film-special-effects-bubble-pop-06-351337/',
                'https://pixabay.com/sound-effects/bubble-pop-389501/',
                'https://pixabay.com/sound-effects/technology-correct-answer-toy-bi-bling-476370/',
            ].join('\n'),
            linkStyle,
        );
        addGap(18);
        addText('User Interface', sectionStyle);
        addText('Island Game GUI - Craftpix', bodyStyle);
        addText('Source:', bodyStyle);
        addText('https://craftpix.net/freebies/island-game-gui/', linkStyle);
        addGap(18);
        addText('Attribution', sectionStyle);
        addText(
            'This game was created as a personal portfolio project. All third-party assets remain the property of their respective authors and are used in accordance with their applicable licenses.',
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
        this._mainMenuButton.x = this._background.width / 2 - this._mainMenuButton.width - 80;
        this._mainMenuButton.y = this._background.height / 2 - this._mainMenuButton.height - 68;
        this.addChild(this._mainMenuButton);
    }
}
