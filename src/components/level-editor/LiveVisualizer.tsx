
"use client";
import React from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import type { BobbinCell, FabricBlockData, LevelData, BobbinColor, BobbinPair } from '@/lib/types';
import { COLOR_MAP, LIMITED_FABRIC_COLORS, createFabricBlock, PAIRING_LINE_COLOR } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FabricBlockPopover } from './FabricBlockPopover';


interface LiveVisualizerProps {
  editorType: 'bobbin' | 'fabric';
  className?: string;
}

const CELL_SIZE = 32; 
const SPOOL_WIDTH_RATIO = 0.8;
const SPOOL_END_HEIGHT_RATIO = 0.2;
const FABRIC_BLOCK_GAP = 2; 
const FABRIC_EMPTY_SLOT_COLOR = "hsl(var(--muted) / 0.5)"; 

const BobbinVisualizer: React.FC<{data: LevelData['bobbinArea'], hasErrors: boolean}> = ({ data, hasErrors }) => {
  const { rows, cols, cells, pairs = [] } = data;
  const width = cols * CELL_SIZE;
  const height = rows * CELL_SIZE;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={cn("border rounded-md bg-background shadow-inner overflow-visible", hasErrors && "outline outline-2 outline-offset-2 outline-destructive")}
      aria-label="Bobbin area visualization"
    >
      {/* Grid Lines */}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={`h-line-${i}`} x1="0" y1={i * CELL_SIZE} x2={width} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v-line-${i}`} x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={height} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}

      {/* Cells */}
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

          if (cell.type === 'pipe' && cell.colors && cell.colors.length >= 1) { // Check for at least 1 color
            const numColors = cell.colors.length;
            const stripeWidth = CELL_SIZE / numColors;
            cellElement = (
              <g>
                {cell.colors.map((pipeColor, i) => (
                  <rect
                    key={`pipe-stripe-${rIdx}-${cIdx}-${i}`}
                    x={x + i * stripeWidth}
                    y={y}
                    width={stripeWidth}
                    height={CELL_SIZE}
                    fill={COLOR_MAP[pipeColor] || pipeColor}
                  />
                ))}
              </g>
            );
          } else if (cell.type === 'pipe') { 
             cellElement = <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill="hsl(var(--muted))" stroke="hsl(var(--destructive))" strokeWidth="1" />;
          }
          
          return <React.Fragment key={`bobbin-${rIdx}-${cIdx}`}>{cellElement}</React.Fragment>;
        })
      )}
       {/* Pairing Lines */}
       {pairs.map((pair, pIdx) => {
        const fromX = pair.from.col * CELL_SIZE + CELL_SIZE / 2;
        const fromY = pair.from.row * CELL_SIZE + CELL_SIZE / 2;
        const toX = pair.to.col * CELL_SIZE + CELL_SIZE / 2;
        const toY = pair.to.row * CELL_SIZE + CELL_SIZE / 2;
        return (
          <line
            key={`pair-line-${pIdx}`}
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke={PAIRING_LINE_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
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
          const bIdxInColumnData = maxFabricHeight - 1 - bIdxInVis; 
          const currentColumn = columns[cIdx] || []; 
          const currentBlock = currentColumn[bIdxInColumnData];

          const x = cIdx * CELL_SIZE + FABRIC_BLOCK_GAP / 2;
          const y = bIdxInVis * CELL_SIZE + FABRIC_BLOCK_GAP / 2;

          const fillColor = currentBlock ? (COLOR_MAP[currentBlock.color] || currentBlock.color) : FABRIC_EMPTY_SLOT_COLOR;
          const strokeColor = currentBlock ? (COLOR_MAP[currentBlock.color] || currentBlock.color) : "hsl(var(--border))";
          const blockOpacity = currentBlock?.hidden ? 0.5 : 1;

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
                  opacity={blockOpacity} 
                  rx="2"
                  style={{ cursor: 'pointer' }}
                  aria-label={
                    currentBlock 
                      ? `Fabric block color ${currentBlock.color}${currentBlock.hidden ? ' (hidden)' : ''}, column ${cIdx + 1}, visual row ${bIdxInVis + 1}. Click to edit.` 
                      : `Empty fabric slot, column ${cIdx + 1}, visual row ${bIdxInVis + 1}. Click to add/edit block.`
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <FabricBlockPopover
                  blockData={currentBlock || null} 
                  colIndex={cIdx}
                  rowIndexInVisualizer={bIdxInVis} 
                  onBlockChange={(newBlockState: FabricBlockData | null) => {
                    setLevelData(draft => {
                      if (!draft.fabricArea.columns[cIdx]) {
                        draft.fabricArea.columns[cIdx] = [];
                      }
                      const columnDraft = draft.fabricArea.columns[cIdx];
                      
                      // Ensure columnDraft can hold up to bIdxInColumnData
                      while (columnDraft.length <= bIdxInColumnData && newBlockState !== null) {
                         // This is tricky because we want sparse arrays.
                         // If adding a new block, we might need to insert it.
                         // If it's exactly at the end, push. Otherwise, careful splice.
                         // The simplest is to pad with nulls, set, then filter.
                         columnDraft.push(null as any); 
                      }
                      
                      if(newBlockState === null && bIdxInColumnData < columnDraft.length) {
                        // Removing a block
                        columnDraft.splice(bIdxInColumnData, 1);
                      } else if (newBlockState !== null) {
                         // Adding or updating a block
                         // If adding a block to a position that extends the current array, 
                         // or replacing an existing block.
                         // This logic assumes that if newBlockState is not null, we intend to place it
                         // at bIdxInColumnData.
                         // If bIdxInColumnData is beyond current length, we need to pad conceptually.
                         // But since we filter nulls, direct assignment is better if the conceptual slot is to be filled.

                         // If newBlockState is not null, try to place it.
                         // If bIdxInColumnData is beyond current real blocks, it effectively adds to the top.
                         // The filter will keep it sparse.

                         // Create a temporary array of maxFabricHeight with nulls
                         const tempCol = Array(draft.fabricArea.maxFabricHeight).fill(null).map((_, i) => {
                            const existingBlock = columnDraft.find((b, originalIndex) => {
                                // This mapping is a bit off, we need to map visual index to data index
                                // for the *current* data before modification.
                                // Let's reconsider the update logic to be simpler for sparse arrays.
                                return draft.fabricArea.maxFabricHeight - 1 - i === originalIndex;
                            });
                            return existingBlock;
                         });

                         // Simplified logic:
                         // 1. Get current blocks.
                         // 2. If newBlockState is null, remove block at bIdxInColumnData (if exists).
                         // 3. If newBlockState is FabricBlockData, update/insert at bIdxInColumnData.
                         
                         let updatedColumn = [...columnDraft];
                         if (newBlockState === null) {
                            // Find if a block exists at this *data* index and remove
                            if(bIdxInColumnData < updatedColumn.length) {
                               updatedColumn.splice(bIdxInColumnData, 1);
                            }
                         } else {
                           // This might create gaps if not careful, but filter handles it
                           updatedColumn[bIdxInColumnData] = newBlockState;
                         }

                         draft.fabricArea.columns[cIdx] = updatedColumn
                            .filter(block => block !== null && block !== undefined)
                            .slice(0, draft.fabricArea.maxFabricHeight) as FabricBlockData[];
                      } else {
                           // newBlockState is null and trying to remove from an already empty slot (or beyond current height)
                           // No action needed, filter will keep it clean.
                           draft.fabricArea.columns[cIdx] = columnDraft
                            .filter(block => block !== null && block !== undefined)
                            .slice(0, draft.fabricArea.maxFabricHeight) as FabricBlockData[];
                      }
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
          );
        })
      )}
      {Array.from({ length: maxFabricHeight +1 }).map((_, i) => (
         <line key={`h-fabric-line-${i}`} x1="0" y1={i * CELL_SIZE} x2={svgWidth} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray={i === maxFabricHeight ? "none" : "2 2"} opacity="0.5"/>
      ))}
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
