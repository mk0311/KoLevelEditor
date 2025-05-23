
"use client";
import React from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import type { BobbinCell, FabricBlockData, LevelData, BobbinColor } from '@/lib/types';
import { COLOR_MAP, LIMITED_FABRIC_COLORS, createFabricBlock } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FabricBlockPopover } from './FabricBlockPopover';


interface LiveVisualizerProps {
  editorType: 'bobbin' | 'fabric';
  className?: string;
}

const CELL_SIZE = 32; // px
const SPOOL_WIDTH_RATIO = 0.8;
const SPOOL_END_HEIGHT_RATIO = 0.2;
const PIPE_RADIUS_RATIO = 0.25;
const FABRIC_BLOCK_GAP = 2; // Gap between blocks in fabric visualizer
const FABRIC_EMPTY_SLOT_COLOR = "hsl(var(--muted) / 0.5)"; // Color for empty clickable slots

const BobbinVisualizer: React.FC<{data: LevelData['bobbinArea'], hasErrors: boolean}> = ({ data, hasErrors }) => {
  const { rows, cols, cells } = data;
  const width = cols * CELL_SIZE;
  const height = rows * CELL_SIZE;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={cn("border rounded-md bg-background shadow-inner", hasErrors && "outline outline-2 outline-offset-2 outline-destructive")}
      aria-label="Bobbin area visualization"
    >
      {cells.map((row, rIdx) => 
        row.map((cell, cIdx) => {
          const x = cIdx * CELL_SIZE;
          const y = rIdx * CELL_SIZE;
          
          let cellElement = <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill="hsl(var(--muted))" />;

          if (cell.type === 'hidden' && cell.color) {
            cellElement = <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill={COLOR_MAP[cell.color] || cell.color} opacity={0.3} />;
          }

          if (cell.type === 'bobbin' && cell.color) {
            const spoolColor = COLOR_MAP[cell.color] || cell.color;
            cellElement = (
              <g transform={`translate(${x + CELL_SIZE / 2}, ${y + CELL_SIZE / 2})`}>
                <rect 
                  x={-CELL_SIZE * SPOOL_WIDTH_RATIO / 2} 
                  y={-CELL_SIZE / 2 * (1 - SPOOL_END_HEIGHT_RATIO)} 
                  width={CELL_SIZE * SPOOL_WIDTH_RATIO} 
                  height={CELL_SIZE * (1 - SPOOL_END_HEIGHT_RATIO * 2)}
                  fill={spoolColor}
                  rx="2"
                />
                <rect x={-CELL_SIZE / 2} y={-CELL_SIZE / 2} width={CELL_SIZE} height={CELL_SIZE * SPOOL_END_HEIGHT_RATIO} fill={spoolColor} opacity="0.7" rx="1"/>
                <rect x={-CELL_SIZE / 2} y={CELL_SIZE / 2 * (1-SPOOL_END_HEIGHT_RATIO*2)} width={CELL_SIZE} height={CELL_SIZE * SPOOL_END_HEIGHT_RATIO} fill={spoolColor} opacity="0.7" rx="1"/>
              </g>
            );
          }

          if (cell.type === 'pipe' && cell.colors && cell.colors.length > 0) {
            const primaryColor = COLOR_MAP[cell.colors[0]] || cell.colors[0];
            const secondaryColor = cell.colors.length > 1 ? (COLOR_MAP[cell.colors[1]] || cell.colors[1]) : primaryColor;
             cellElement = (
              <g transform={`translate(${x + CELL_SIZE / 2}, ${y + CELL_SIZE / 2})`}>
                 <rect x={-CELL_SIZE/2} y={-CELL_SIZE/2} width={CELL_SIZE} height={CELL_SIZE} fill="hsl(var(--muted))" />
                <circle 
                  cx="0" 
                  cy="0" 
                  r={CELL_SIZE * PIPE_RADIUS_RATIO} 
                  fill={primaryColor} 
                  stroke={secondaryColor}
                  strokeWidth="2"
                />
              </g>
            );
          }
          
          return <React.Fragment key={`bobbin-${rIdx}-${cIdx}`}>{cellElement}</React.Fragment>;
        })
      )}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={`h-line-${i}`} x1="0" y1={i * CELL_SIZE} x2={width} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v-line-${i}`} x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={height} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
    </svg>
  );
};

const FabricVisualizer: React.FC<{data: LevelData['fabricArea'], hasErrors: boolean}> = ({ data, hasErrors }) => {
  const { setLevelData } = useLevelData();
  const { cols, maxFabricHeight, columns } = data;
  
  const blockDisplayHeight = CELL_SIZE - FABRIC_BLOCK_GAP;
  const svgWidth = cols * CELL_SIZE;
  const svgHeight = maxFabricHeight * CELL_SIZE;

  return (
    <svg 
      width={svgWidth} 
      height={svgHeight} 
      viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
      className={cn("border rounded-md bg-background shadow-inner", hasErrors && "outline outline-2 outline-offset-2 outline-destructive")}
      aria-label="Fabric area visualization (interactive)"
    >
      {Array.from({ length: cols }).map((_, cIdx) => 
        Array.from({ length: maxFabricHeight }).map((_, bIdxInVis) => { 
          // bIdxInVis is 0-indexed from top visual row
          // bIdxInColumnData is 0-indexed from bottom data layer
          const bIdxInColumnData = maxFabricHeight - 1 - bIdxInVis; 

          const currentBlock = columns[cIdx]?.[bIdxInColumnData]; // May be undefined if slot is empty

          const x = cIdx * CELL_SIZE + FABRIC_BLOCK_GAP / 2;
          const y = bIdxInVis * CELL_SIZE + FABRIC_BLOCK_GAP / 2;

          const fillColor = currentBlock ? (COLOR_MAP[currentBlock.color] || currentBlock.color) : FABRIC_EMPTY_SLOT_COLOR;
          const strokeColor = currentBlock ? (COLOR_MAP[currentBlock.color] || currentBlock.color) : "hsl(var(--border))";

          return (
            <Popover key={`fabric-popover-${cIdx}-${bIdxInVis}`}>
              <PopoverTrigger asChild>
                <rect
                  x={x}
                  y={y}
                  width={CELL_SIZE - FABRIC_BLOCK_GAP}
                  height={blockDisplayHeight}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={currentBlock ? 1 : 0.5}
                  rx="2"
                  style={{ cursor: 'pointer' }}
                  aria-label={
                    currentBlock 
                      ? `Fabric block color ${currentBlock.color}, column ${cIdx + 1}, visual row ${bIdxInVis + 1}. Click to edit.` 
                      : `Empty fabric slot, column ${cIdx + 1}, visual row ${bIdxInVis + 1}. Click to add/edit block.`
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <FabricBlockPopover
                  blockData={currentBlock || null} // Pass null if undefined for popover
                  colIndex={cIdx}
                  rowIndexInVisualizer={bIdxInVis} // Popover might use this for display, or we could pass bIdxInColumnData
                  onBlockChange={(newBlockState: FabricBlockData | null) => {
                    setLevelData(draft => {
                      // Ensure column array exists
                      if (!draft.fabricArea.columns[cIdx]) {
                        draft.fabricArea.columns[cIdx] = [];
                      }
                      const columnDraft = draft.fabricArea.columns[cIdx];
                      
                      // Pad with temporary nulls if needed to reach the target index
                      while (columnDraft.length <= bIdxInColumnData && newBlockState !== null) {
                        columnDraft.push(null as any); // Temporarily push null
                      }

                      if (newBlockState === null) { // Removing a block
                        if (bIdxInColumnData < columnDraft.length) {
                           columnDraft[bIdxInColumnData] = null as any; // Mark for removal
                        }
                      } else { // Adding or updating a block
                         if (bIdxInColumnData < columnDraft.length) {
                            columnDraft[bIdxInColumnData] = newBlockState;
                         } else {
                            // This case should ideally be handled by padding above
                            // or ensuring only valid slots (up to maxHeight) are targeted.
                            // For safety, if trying to add beyond current padded length but within maxHeight:
                            if (bIdxInColumnData < draft.fabricArea.maxFabricHeight) {
                                columnDraft[bIdxInColumnData] = newBlockState;
                            }
                         }
                      }
                      
                      // Compact the array: remove all nulls and keep only FabricBlockData
                      // Also ensure the column does not exceed maxFabricHeight
                      draft.fabricArea.columns[cIdx] = columnDraft
                        .filter(block => block !== null && block !== undefined)
                        .slice(0, draft.fabricArea.maxFabricHeight) as FabricBlockData[];
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
          );
        })
      )}
      {/* Max height indicator lines (horizontal) */}
      {Array.from({ length: maxFabricHeight +1 }).map((_, i) => (
         <line key={`h-fabric-line-${i}`} x1="0" y1={i * CELL_SIZE} x2={svgWidth} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray={i === maxFabricHeight ? "none" : "2 2"} opacity="0.5"/>
      ))}
      {/* Column separator lines (vertical) */}
       {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v-fabric-line-${i}`} x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={svgHeight} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
    </svg>
  );
};


export const LiveVisualizer: React.FC<LiveVisualizerProps> = ({ editorType, className }) => {
  const { levelData, validationMessages } = useLevelData();
  const hasErrors = validationMessages.some(msg => msg.type === 'error');

  return (
    <div className={cn("p-4 bg-card rounded-lg shadow space-y-3", className)}>
      <h3 className="text-lg font-semibold text-primary">
        {editorType === 'bobbin' ? 'Bobbin Area Preview' : 'Fabric Area Preview'}
         {editorType === 'fabric' && <span className="text-sm font-normal text-muted-foreground"> (Click to edit)</span>}
      </h3>
      <div className="flex justify-center items-center overflow-auto">
      {editorType === 'bobbin' ? (
        <BobbinVisualizer data={levelData.bobbinArea} hasErrors={hasErrors} />
      ) : (
        <FabricVisualizer data={levelData.fabricArea} hasErrors={hasErrors} />
      )}
      </div>
    </div>
  );
};
