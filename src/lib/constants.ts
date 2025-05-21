
import type { BobbinCell, FabricBlockData, LevelData, BobbinColor } from './types';

export const DEFAULT_LEVEL_NUMBER = 1;
export const DEFAULT_BOBBIN_ROWS = 5;
export const DEFAULT_BOBBIN_COLS = 5;
export const DEFAULT_FABRIC_COLS = 4;
export const DEFAULT_MAX_FABRIC_HEIGHT = 8;

export const AVAILABLE_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];
export const LIMITED_FABRIC_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

export const createEmptyBobbinCell = (): BobbinCell => ({ type: 'empty' });
// Creates an actual fabric block object, not a null placeholder
export const createFabricBlock = (color?: BobbinColor): FabricBlockData => ({ color: color || LIMITED_FABRIC_COLORS[0] });

export const createDefaultLevelData = (): LevelData => ({
  level: DEFAULT_LEVEL_NUMBER,
  bobbinArea: {
    rows: DEFAULT_BOBBIN_ROWS,
    cols: DEFAULT_BOBBIN_COLS,
    cells: Array(DEFAULT_BOBBIN_ROWS)
      .fill(null)
      .map(() => Array(DEFAULT_BOBBIN_COLS).fill(null).map(createEmptyBobbinCell)),
  },
  fabricArea: {
    cols: DEFAULT_FABRIC_COLS,
    maxFabricHeight: DEFAULT_MAX_FABRIC_HEIGHT,
    columns: Array(DEFAULT_FABRIC_COLS)
      .fill(null)
      .map(() => Array(DEFAULT_MAX_FABRIC_HEIGHT).fill(null)), // Initialize with nulls
  },
});

// EXAMPLE_LEVEL_DATA might need adjustment if used, to reflect (FabricBlockData | null)[][]
// For now, focusing on the default creation.
export const EXAMPLE_LEVEL_DATA: LevelData = {
  level: 1,
  bobbinArea: {
    rows: 7,
    cols: 7,
    cells: [
      [
        { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" },
      ],
      [
        { type: "bobbin", color: "Blue" }, { type: "empty" }, { type: "empty" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "hidden", color: "Red" }, { type: "bobbin", color: "Green" },
      ],
      [
        { type: "empty" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "empty" }, { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "pipe", colors: ["Red", "Blue", "Green"] }, { type: "bobbin", color: "Blue" }, { type: "hidden", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "pipe", colors: ["Red", "Blue", "Green"] }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "hidden", color: "Red" },
      ],
      [
        { type: "pipe", colors: ["Red", "Blue", "Green"] }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "empty" }, { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "empty" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "hidden", color: "Blue" },
      ],
    ],
  },
  fabricArea: {
    cols: 4,
    maxFabricHeight: 8,
    // Example data now needs to be an array of (FabricBlockData | null)
    // Each inner array should have length maxFabricHeight
    columns: [
      [{ color: "Red" }, { color: "Green" }, { color: "Red" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Blue" }],
      [{ color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Red" }, { color: "Red" }],
      [{ color: "Green" }, { color: "Red" }, { color: "Red" }, { color: "Green" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Green" }],
      [{ color: "Red" }, { color: "Blue" }, { color: "Red" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Red" }],
    ].map(col => { // Ensure example columns match maxFabricHeight, padding with null if needed
        const newCol = [...col];
        while(newCol.length < 8) newCol.push(null);
        return newCol.slice(0, 8);
    }),
  },
};


export const COLOR_MAP: Record<BobbinColor, string> = {
  Red: 'hsl(var(--knitout-red))',
  Blue: 'hsl(var(--knitout-blue))',
  Green: 'hsl(var(--knitout-green))',
  Yellow: 'hsl(var(--knitout-yellow))',
  Purple: 'hsl(var(--knitout-purple))',
};
