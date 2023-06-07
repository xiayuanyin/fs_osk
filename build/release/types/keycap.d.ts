export declare enum KeyboardMode {
    Standard = "Standard",
    Shift = "Shift",
    Capslocked = "Capslocked",
    Alternate = "Alternate",
    AlternateShift = "AlternateShift"
}
export declare enum Alignment {
    Left = 0,
    Right = 1
}
export declare class KeyCap {
    name: string;
    shiftName: string;
    alternateName?: string;
    alternateShiftName?: string;
    isFunctionKey: boolean;
    reactKey: string;
    constructor(definition: string);
    currentName(mode: KeyboardMode): string;
    currentAlternateName(mode: KeyboardMode): string;
}
//# sourceMappingURL=keycap.d.ts.map