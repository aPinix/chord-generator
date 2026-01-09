'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { StringState } from '@/types/chord';
import { STRING_NAMES_LOW_TO_HIGH } from '@/types/chord';

interface ChordDiagramProps {
  strings: StringState[];
  chordName?: string;
  width?: number;
  height?: number;
}

export const ChordDiagram = forwardRef<HTMLCanvasElement, ChordDiagramProps>(
  function ChordDiagram(
    { strings, chordName = '', width = 200, height = 280 },
    ref
  ) {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef =
      (ref as React.RefObject<HTMLCanvasElement>) || internalRef;
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

    const drawDiagram = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const padding = 30;
      const titleHeight = 40;
      const stringLabelHeight = 25;
      const diagramWidth = width - padding * 2;
      const diagramHeight =
        height - padding * 2 - titleHeight - stringLabelHeight;
      const stringSpacing = diagramWidth / 5;
      const fretSpacing = diagramHeight / 5;

      const startX = padding;
      const startY = padding + titleHeight;

      if (chordName) {
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(chordName, width / 2, 28);
      }

      const reversedStrings = [...strings].reverse();

      // Calculate the fret range to display
      const frettedNotes = reversedStrings
        .map((s) => s.fret)
        .filter((f): f is number => typeof f === 'number' && f > 0);
      const minFret = frettedNotes.length > 0 ? Math.min(...frettedNotes) : 1;
      const maxFret = frettedNotes.length > 0 ? Math.max(...frettedNotes) : 5;
      const startFret = maxFret <= 5 ? 1 : Math.max(1, minFret);

      ctx.fillStyle = '#1a1a1a';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 6; i++) {
        const x = startX + i * stringSpacing;
        const stringState = reversedStrings[i];
        if (stringState.fret === 'X') {
          ctx.fillText('X', x, startY - 8);
        } else if (stringState.fret === 0) {
          ctx.fillText('O', x, startY - 8);
        }
      }

      // Draw nut (thick bar) only if showing from fret 1, otherwise show fret number
      ctx.strokeStyle = '#1a1a1a';
      if (startFret === 1) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + diagramWidth, startY);
        ctx.stroke();
      } else {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + diagramWidth, startY);
        ctx.stroke();
        // Draw fret number indicator
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${startFret}`, startX - 8, startY + fretSpacing / 2 + 4);
      }

      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        const y = startY + i * fretSpacing;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + diagramWidth, y);
        ctx.stroke();
      }

      for (let i = 0; i < 6; i++) {
        const x = startX + i * stringSpacing;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + diagramHeight);
        ctx.stroke();
      }

      const dotRadius = 10;

      // Detect barres: same finger on multiple strings at the same fret
      const barres: {
        finger: number;
        fret: number;
        startString: number;
        endString: number;
      }[] = [];
      const fingerPositions: Map<
        number,
        { fret: number; strings: number[] }[]
      > = new Map();

      for (let i = 0; i < 6; i++) {
        const stringState = reversedStrings[i];
        if (
          typeof stringState.fret === 'number' &&
          stringState.fret > 0 &&
          stringState.finger
        ) {
          const finger = stringState.finger;
          const fret = stringState.fret;
          if (!fingerPositions.has(finger)) {
            fingerPositions.set(finger, []);
          }
          const positions = fingerPositions.get(finger)!;
          const existing = positions.find((p) => p.fret === fret);
          if (existing) {
            existing.strings.push(i);
          } else {
            positions.push({ fret, strings: [i] });
          }
        }
      }

      // Convert to barres (finger used on 2+ strings at same fret)
      fingerPositions.forEach((positions, finger) => {
        for (const pos of positions) {
          if (pos.strings.length >= 2) {
            const minString = Math.min(...pos.strings);
            const maxString = Math.max(...pos.strings);
            barres.push({
              finger,
              fret: pos.fret,
              startString: minString,
              endString: maxString,
            });
          }
        }
      });

      // Draw barres first (behind dots)
      for (const barre of barres) {
        const relativeFret = barre.fret - startFret + 1;
        const y = startY + (relativeFret - 0.5) * fretSpacing;
        const x1 = startX + barre.startString * stringSpacing;
        const x2 = startX + barre.endString * stringSpacing;
        const barreHeight = dotRadius * 1.6;

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(
          x1 - dotRadius,
          y - barreHeight / 2,
          x2 - x1 + dotRadius * 2,
          barreHeight,
          barreHeight / 2
        );
        ctx.fill();
      }

      // Track which strings are part of a barre (to show finger number only once)
      const barreStrings = new Set<string>();
      for (const barre of barres) {
        for (let s = barre.startString; s <= barre.endString; s++) {
          barreStrings.add(`${barre.fret}-${s}`);
        }
      }

      // Draw individual dots
      for (let i = 0; i < 6; i++) {
        const stringState = reversedStrings[i];
        if (typeof stringState.fret === 'number' && stringState.fret > 0) {
          const x = startX + i * stringSpacing;
          const relativeFret = stringState.fret - startFret + 1;
          const y = startY + (relativeFret - 0.5) * fretSpacing;
          const isInBarre = barreStrings.has(`${stringState.fret}-${i}`);

          // Don't draw separate dot if it's covered by a barre
          if (!isInBarre) {
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw finger number (for barre, only on the first string of the barre)
          if (stringState.finger) {
            const barre = barres.find(
              (b) =>
                b.fret === stringState.fret && b.finger === stringState.finger
            );
            const shouldShowFinger = !barre || i === barre.startString;
            if (shouldShowFinger) {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 12px system-ui, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(stringState.finger.toString(), x, y);
            }
          }
        }
      }

      ctx.fillStyle = '#666666';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 6; i++) {
        const x = startX + i * stringSpacing;
        ctx.fillText(
          STRING_NAMES_LOW_TO_HIGH[i],
          x,
          startY + diagramHeight + 18
        );
      }

      // Convert canvas to data URL for draggable image
      setImageDataUrl(canvas.toDataURL('image/png'));
    }, [strings, chordName, width, height, canvasRef]);

    useEffect(() => {
      drawDiagram();
    }, [drawDiagram]);

    const fileName = chordName
      ? `${chordName.replace(/[^a-zA-Z0-9]/g, '-')}-chord.png`
      : 'chord-diagram.png';

    return (
      <div className="relative">
        <canvas className="hidden" ref={canvasRef} />
        {imageDataUrl && (
          <img
            alt={chordName ? `${chordName} chord diagram` : 'Chord diagram'}
            className="rounded-lg border border-border bg-white"
            draggable
            height={height}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', fileName);
            }}
            src={imageDataUrl}
            width={width}
          />
        )}
      </div>
    );
  }
);
