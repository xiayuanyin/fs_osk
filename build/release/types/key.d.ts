import React from 'react';
import { KeyboardMode, KeyCap } from "./keycap";
export interface KeyProps {
    keycap: KeyCap;
    mode: KeyboardMode;
    onPointerDown: React.PointerEventHandler;
}
export declare function Key({ keycap, mode, onPointerDown }: KeyProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=key.d.ts.map