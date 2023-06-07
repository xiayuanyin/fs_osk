import React, { Dispatch, SetStateAction, RefObject, MutableRefObject } from 'react';
export type KeyboardElement = HTMLInputElement | HTMLTextAreaElement;
export declare function isKeyboardElement(element: any): boolean;
export declare function desiredKeyboardState(input: KeyboardElement): KeyboardState.Standard | KeyboardState.Decimal;
export declare enum KeyboardState {
    None = 0,
    Standard = 1,
    Decimal = 2
}
export interface XYSetter {
    x: number;
    y: number;
    setX: Dispatch<SetStateAction<number>>;
    setY: Dispatch<SetStateAction<number>>;
    keyboardRef: RefObject<HTMLElement>;
}
export declare function handleMove(event: React.PointerEvent<Element>, { x, y, setX, setY, keyboardRef }: XYSetter): void;
export declare function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string, selectionStart: number, selectionEnd: number): void;
export declare function inputCharacterAtCursor(input: HTMLInputElement | HTMLTextAreaElement, keyname: string, pattern?: RegExp): void;
export declare function backspace(input: HTMLInputElement | HTMLTextAreaElement): void;
export declare function delayedRepeatInput(timeoutRef: MutableRefObject<number>, intervalRef: MutableRefObject<number>, action: () => void): void;
//# sourceMappingURL=util.d.ts.map