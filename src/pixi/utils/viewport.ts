/**
 * Viewport helpers for portrait / mobile layout.
 * Design space stays width-based; height grows with aspect ratio on phones.
 */

export const DESIGN_BASE = 1800;

export type DesignSize = {
    width: number;
    height: number;
};

export type LayoutScales = {
    menu: number;
    panel: number;
    game: number;
};

export function isPortraitLayout(): boolean {
    return window.innerHeight > window.innerWidth;
}

/**
 * True for tall, narrow viewports where the square letterbox hurts readability.
 */
export function isMobileLayout(): boolean {
    if (!isPortraitLayout()) {
        return false;
    }

    return Math.min(window.innerWidth, window.innerHeight) < 900;
}

export function getDesignSize(): DesignSize {
    if (!isPortraitLayout()) {
        return { width: DESIGN_BASE, height: DESIGN_BASE };
    }

    const aspect = window.innerHeight / window.innerWidth;
    const cappedAspect = Math.min(Math.max(aspect, 1.15), 2.35);
    // Narrower design on phones → larger CSS pixels (board can fill the width).
    const width = isMobileLayout() ? 1580 : DESIGN_BASE;

    return {
        width,
        height: Math.round(width * cappedAspect),
    };
}

export function getLayoutScales(): LayoutScales {
    if (!isMobileLayout()) {
        return { menu: 1, panel: 1, game: 1 };
    }

    const shortSide = Math.min(window.innerWidth, window.innerHeight);
    // Narrow phones need a stronger boost so text stays readable after CSS downscale.
    const phoneBoost = shortSide < 430 ? 1 : shortSide < 600 ? 0.65 : 0.35;

    return {
        // CSS already larger via narrower design (1580); keep menu boost moderate.
        menu: 1.35 + phoneBoost * 0.3,
        // Panels rotate + self-fit on mobile — no extra stage scale.
        panel: 1,
        // Board (~1550) already fills the narrow mobile design width.
        game: 1,
    };
}
