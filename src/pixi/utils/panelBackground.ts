import * as PIXI from 'pixi.js';

import { getDesignSize, isMobileLayout } from './viewport';

export type PanelSize = {
    width: number;
    height: number;
};

/**
 * Shared highscores-style panel background.
 * On mobile the landscape asset is rotated 90° so it reads as portrait.
 */
export function setupPanelBackground(sprite: PIXI.Sprite): PanelSize {
    const panel = sprite;
    panel.anchor.set(0.5, 0.5);

    const baseW = panel.texture.width;
    const baseH = panel.texture.height;

    if (!isMobileLayout()) {
        panel.rotation = 0;
        panel.scale.set(1);
        return { width: baseW, height: baseH };
    }

    // Landscape → portrait
    panel.rotation = Math.PI / 2;

    const visualWidth = baseH;
    const targetWidth = getDesignSize().width * 0.9;
    const scale = targetWidth / visualWidth;
    panel.scale.set(scale);

    return {
        width: baseH * scale,
        height: baseW * scale,
    };
}
