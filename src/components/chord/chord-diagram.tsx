'use client';

import { Download, RotateCcw, Volume2 } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { playChord } from '@/lib/chord-audio';
import type { StringState } from '@/types/chord';
import { STRING_NAMES_LOW_TO_HIGH } from '@/types/chord';
import { AndImage } from '../and/and-image';

interface ChordDiagramProps {
  strings: StringState[];
  chordName?: string;
  size?: DiagramSize;
  showControls?: boolean;
  onReset?: () => void;
  /** When true, renders SVG directly without PNG conversion for faster display */
  static?: boolean;
}

const FILL_COLOR = '#545D6A';

type DownloadFormat = 'png' | 'jpg' | 'svg';
type DiagramSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// SVG is always rendered at base size for consistent quality
const BASE_WIDTH = 140;
const BASE_HEIGHT = 160;

// Preview/export sizes - these scale the output, not the SVG internals
const SIZE_SCALES: Record<DiagramSize, number> = {
  xs: 0.3,
  sm: 0.6,
  md: 1,
  lg: 1.2,
  xl: 1.4,
};

export const ChordDiagram = forwardRef<SVGSVGElement, ChordDiagramProps>(
  function ChordDiagram(
    {
      strings,
      chordName = '',
      size,
      showControls = true,
      onReset,
      static: isStatic = false,
    },
    ref
  ) {
    const internalRef = useRef<SVGSVGElement>(null);
    const svgRef = (ref as React.RefObject<SVGSVGElement>) || internalRef;
    const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('png');
    const [diagramSize, setDiagramSize] = useState<DiagramSize>(size || 'md');

    // Sync preferences from localStorage after hydration to avoid SSR mismatch
    useEffect(() => {
      const savedFormat = localStorage.getItem('chord-diagram-format');
      if (savedFormat && ['png', 'jpg', 'svg'].includes(savedFormat)) {
        setDownloadFormat(savedFormat as DownloadFormat);
      }
      if (!size) {
        const savedSize = localStorage.getItem('chord-diagram-size');
        if (savedSize && ['xs', 'sm', 'md', 'lg', 'xl'].includes(savedSize)) {
          setDiagramSize(savedSize as DiagramSize);
        }
      }
    }, [size]);
    const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
    const [xlPngDataUrl, setXlPngDataUrl] = useState<string | null>(null);

    // Persist preferences to localStorage
    useEffect(() => {
      localStorage.setItem('chord-diagram-format', downloadFormat);
    }, [downloadFormat]);

    useEffect(() => {
      if (!size) {
        localStorage.setItem('chord-diagram-size', diagramSize);
      }
    }, [diagramSize, size]);

    // Use prop size if provided (for fixed size previews), otherwise use internal state
    const effectiveSize = size || diagramSize;
    const scale = SIZE_SCALES[effectiveSize];

    // SVG always renders at base size
    const svgWidth = BASE_WIDTH;
    const svgHeight = BASE_HEIGHT;

    // Preview/export dimensions (for drag)
    const outputWidth = Math.round(BASE_WIDTH * scale);
    const outputHeight = Math.round(BASE_HEIGHT * scale);

    // XL dimensions for high-quality display
    const xlScale = SIZE_SCALES.xl;
    const xlWidth = Math.round(BASE_WIDTH * xlScale);
    const xlHeight = Math.round(BASE_HEIGHT * xlScale);

    const diagramData = useMemo(() => {
      // Always use base dimensions for SVG rendering
      const padding = 16; // Side padding
      const topMargin = 24; // Space for X/O markers + top spacing
      const bottomMargin = 44; // Space for string names + chord name + bottom spacing
      const diagramWidth = svgWidth - padding * 2;
      const diagramHeight = svgHeight - topMargin - bottomMargin;
      const stringSpacing = diagramWidth / 5;
      const fretSpacing = diagramHeight / 5;
      const startX = padding;
      const startY = topMargin;
      const dotRadius = 7;

      const reversedStrings = [...strings].reverse();

      const frettedNotes = reversedStrings
        .map((s) => s.fret)
        .filter((f): f is number => typeof f === 'number' && f > 0);
      const minFret = frettedNotes.length > 0 ? Math.min(...frettedNotes) : 1;
      const maxFret = frettedNotes.length > 0 ? Math.max(...frettedNotes) : 5;
      const startFret = maxFret <= 5 ? 1 : Math.max(1, minFret);

      // Calculate barres
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

      const barres: {
        finger: number;
        fret: number;
        startString: number;
        endString: number;
      }[] = [];
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

      const barreStrings = new Set<string>();
      for (const barre of barres) {
        for (let s = barre.startString; s <= barre.endString; s++) {
          barreStrings.add(`${barre.fret}-${s}`);
        }
      }

      return {
        padding,
        diagramWidth,
        diagramHeight,
        stringSpacing,
        fretSpacing,
        startX,
        startY,
        dotRadius,
        reversedStrings,
        startFret,
        barres,
        barreStrings,
      };
    }, [strings, svgWidth, svgHeight]);

    const {
      diagramWidth,
      diagramHeight,
      stringSpacing,
      fretSpacing,
      startX,
      startY,
      dotRadius,
      reversedStrings,
      startFret,
      barres,
      barreStrings,
    } = diagramData;

    const getSvgString = useCallback(() => {
      const svg = svgRef.current;
      if (!svg) return '';
      const serializer = new XMLSerializer();
      return serializer.serializeToString(svg);
    }, [svgRef]);

    // Generate PNG previews from SVG - XL for display, selected size for drag
    // Skip PNG generation in static mode for faster rendering
    // biome-ignore lint/correctness/useExhaustiveDependencies: chordName and diagramData affect SVG content read via DOM serialization
    useEffect(() => {
      if (isStatic) return;
      const svg = svgRef.current;
      if (!svg) return;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const dpr = window.devicePixelRatio || 1;

      // Generate selected-size PNG for drag
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = outputWidth * dpr;
      canvas.height = outputHeight * dpr;
      ctx.scale(dpr, dpr);

      // Generate XL PNG for display
      const xlCanvas = document.createElement('canvas');
      const xlCtx = xlCanvas.getContext('2d');
      if (!xlCtx) return;

      xlCanvas.width = xlWidth * dpr;
      xlCanvas.height = xlHeight * dpr;
      xlCtx.scale(dpr, dpr);

      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        // Render selected size
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputWidth, outputHeight);
        ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
        setPngDataUrl(canvas.toDataURL('image/png'));

        // Render XL size
        xlCtx.fillStyle = '#ffffff';
        xlCtx.fillRect(0, 0, xlWidth, xlHeight);
        xlCtx.drawImage(img, 0, 0, xlWidth, xlHeight);
        setXlPngDataUrl(xlCanvas.toDataURL('image/png'));

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }, [
      svgRef,
      outputWidth,
      outputHeight,
      xlWidth,
      xlHeight,
      chordName,
      diagramData,
    ]);

    const downloadImage = useCallback(() => {
      const fileName = chordName
        ? `${chordName.replace(/[^a-zA-Z0-9]/g, '-')}-${effectiveSize}`
        : `chord-${effectiveSize}`;

      if (downloadFormat === 'svg') {
        const svgString = getSvgString();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${fileName}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Convert SVG to PNG/JPG via canvas
        const svgString = getSvgString();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = outputWidth * dpr;
        canvas.height = outputHeight * dpr;
        ctx.scale(dpr, dpr);

        const img = new Image();
        const svgBlob = new Blob([svgString], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, outputWidth, outputHeight);
          ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
          URL.revokeObjectURL(url);

          const mimeType =
            downloadFormat === 'jpg' ? 'image/jpeg' : 'image/png';
          const dataUrl = canvas.toDataURL(mimeType, 0.95);
          const link = document.createElement('a');
          link.download = `${fileName}.${downloadFormat}`;
          link.href = dataUrl;
          link.click();
        };

        img.src = url;
      }
    }, [
      chordName,
      effectiveSize,
      downloadFormat,
      getSvgString,
      outputWidth,
      outputHeight,
    ]);

    return (
      <div className="flex h-full w-full flex-col items-center">
        {/* SVG - hidden when generating PNG, visible in static mode */}
        <svg
          aria-labelledby="chord-title"
          className={
            isStatic ? 'w-full rounded-sm bg-white' : 'absolute -left-[9999px]'
          }
          height={svgHeight}
          ref={svgRef}
          role="img"
          style={isStatic ? { maxWidth: xlWidth } : undefined}
          viewBox={isStatic ? `0 0 ${svgWidth} ${svgHeight}` : undefined}
          width={svgWidth}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="chord-title">
            {chordName ? `${chordName} chord diagram` : 'Chord diagram'}
          </title>
          <rect fill="white" height={svgHeight} width={svgWidth} />

          {/* String labels (X/O) - close to nut */}
          {reversedStrings.map((stringState, i) => {
            const x = startX + i * stringSpacing;
            if (stringState.fret === 'X') {
              return (
                <text
                  fill={FILL_COLOR}
                  fontFamily="system-ui, sans-serif"
                  fontSize={14}
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
                  key={`label-${i}`}
                  textAnchor="middle"
                  x={x}
                  y={startY - 4}
                >
                  X
                </text>
              );
            } else if (stringState.fret === 0) {
              return (
                <text
                  fill={FILL_COLOR}
                  fontFamily="system-ui, sans-serif"
                  fontSize={14}
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
                  key={`label-${i}`}
                  textAnchor="middle"
                  x={x}
                  y={startY - 4}
                >
                  O
                </text>
              );
            }
            return null;
          })}

          {/* Nut or fret number */}
          {startFret === 1 ? (
            <line
              stroke={FILL_COLOR}
              strokeWidth={3}
              x1={startX}
              x2={startX + diagramWidth}
              y1={startY}
              y2={startY}
            />
          ) : (
            <>
              <line
                stroke={FILL_COLOR}
                strokeWidth={1}
                x1={startX}
                x2={startX + diagramWidth}
                y1={startY}
                y2={startY}
              />
              <text
                fill={FILL_COLOR}
                fontFamily="system-ui, sans-serif"
                fontSize={12}
                fontWeight="bold"
                textAnchor="end"
                x={startX - 8}
                y={startY + fretSpacing / 2 + 4}
              >
                {startFret}
              </text>
            </>
          )}

          {/* Frets */}
          {[1, 2, 3, 4, 5].map((i) => (
            <line
              key={`fret-${i}`}
              stroke={FILL_COLOR}
              strokeWidth={1}
              x1={startX}
              x2={startX + diagramWidth}
              y1={startY + i * fretSpacing}
              y2={startY + i * fretSpacing}
            />
          ))}

          {/* Strings */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`string-${i}`}
              stroke={FILL_COLOR}
              strokeWidth={1}
              x1={startX + i * stringSpacing}
              x2={startX + i * stringSpacing}
              y1={startY}
              y2={startY + diagramHeight}
            />
          ))}

          {/* Barres */}
          {barres.map((barre, idx) => {
            const relativeFret = barre.fret - startFret + 1;
            const y = startY + (relativeFret - 0.5) * fretSpacing;
            const x1 = startX + barre.startString * stringSpacing;
            const x2 = startX + barre.endString * stringSpacing;
            const barreHeight = dotRadius * 1.6;
            return (
              <rect
                fill={FILL_COLOR}
                height={barreHeight}
                // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
                key={`barre-${idx}`}
                rx={barreHeight / 2}
                width={x2 - x1 + dotRadius * 2}
                x={x1 - dotRadius}
                y={y - barreHeight / 2}
              />
            );
          })}

          {/* Finger dots */}
          {reversedStrings.map((stringState, i) => {
            if (typeof stringState.fret !== 'number' || stringState.fret <= 0) {
              return null;
            }
            const x = startX + i * stringSpacing;
            const relativeFret = stringState.fret - startFret + 1;
            const y = startY + (relativeFret - 0.5) * fretSpacing;
            const isInBarre = barreStrings.has(`${stringState.fret}-${i}`);

            const barre = barres.find(
              (b) =>
                b.fret === stringState.fret && b.finger === stringState.finger
            );
            const shouldShowFinger =
              stringState.finger && (!barre || i === barre.startString);

            // Center finger number on barre
            const fingerX = barre
              ? startX +
                ((barre.startString + barre.endString) / 2) * stringSpacing
              : x;

            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
              <g key={`dot-${i}`}>
                {!isInBarre && (
                  <circle cx={x} cy={y} fill={FILL_COLOR} r={dotRadius} />
                )}
                {shouldShowFinger && (
                  <text
                    fill="white"
                    fontFamily="system-ui, sans-serif"
                    fontSize={12}
                    fontWeight="bold"
                    textAnchor="middle"
                    x={fingerX}
                    y={y + 4}
                  >
                    {stringState.finger}
                  </text>
                )}
              </g>
            );
          })}

          {/* String names - close to fretboard */}
          {STRING_NAMES_LOW_TO_HIGH.map((name, i) => (
            <text
              fill="#666666"
              fontFamily="system-ui, sans-serif"
              fontSize={12}
              // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
              key={`name-${i}`}
              textAnchor="middle"
              x={startX + i * stringSpacing}
              y={startY + diagramHeight + 14}
            >
              {name}
            </text>
          ))}

          {/* Chord name at bottom */}
          {chordName && (
            <text
              fill={FILL_COLOR}
              fontFamily="system-ui, sans-serif"
              fontSize={16}
              fontWeight="bold"
              textAnchor="middle"
              x={svgWidth / 2}
              y={svgHeight - 8}
            >
              {chordName}
            </text>
          )}
        </svg>

        {/* PNG preview with high-quality display and draggable selected-size layer */}
        {!isStatic && xlPngDataUrl && (
          <div className="relative">
            {/* High-quality XL display (visible) */}
            <AndImage
              alt={chordName ? `${chordName} chord diagram` : 'Chord diagram'}
              className="w-full rounded-lg border border-border bg-white"
              draggable={false}
              height={xlHeight}
              src={xlPngDataUrl}
              width={xlWidth}
            />
            {/* Selected-size for drag (invisible overlay) */}
            {pngDataUrl && (
              <AndImage
                alt={chordName ? `${chordName} chord diagram` : 'Chord diagram'}
                className="absolute inset-0 h-full w-full opacity-0"
                draggable
                height={outputHeight}
                src={pngDataUrl}
                width={outputWidth}
              />
            )}
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="mt-4 w-full space-y-3">
            {/* Primary action: Download */}
            <div className="flex w-full gap-2">
              {onReset && (
                <Button
                  onClick={onReset}
                  size="icon"
                  title="Reset"
                  variant="ghost"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button className="flex-1" onClick={downloadImage} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            {/* Secondary options: Size, Format & Play (muted/compact) */}
            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span className="w-10 shrink-0">Size</span>
                <div className="flex flex-1 gap-0.5">
                  {(['xs', 'sm', 'md', 'lg', 'xl'] as DiagramSize[]).map(
                    (s) => (
                      <button
                        className={`flex-1 cursor-pointer rounded px-1 py-0.5 text-xs transition-colors ${
                          effectiveSize === s
                            ? 'bg-background text-foreground shadow-sm'
                            : 'hover:bg-background/50'
                        }`}
                        key={s}
                        onClick={() => setDiagramSize(s)}
                        type="button"
                      >
                        {s.toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span className="w-10 shrink-0">Format</span>
                <div className="flex flex-1 gap-0.5">
                  {(['png', 'jpg', 'svg'] as DownloadFormat[]).map((f) => (
                    <button
                      className={`flex-1 cursor-pointer rounded px-1 py-0.5 text-xs transition-colors ${
                        downloadFormat === f
                          ? 'bg-background text-foreground shadow-sm'
                          : 'hover:bg-background/50'
                      }`}
                      key={f}
                      onClick={() => setDownloadFormat(f)}
                      type="button"
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span className="w-10 shrink-0">Play</span>
                <div className="flex flex-1 gap-1">
                  <button
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded bg-background/50 px-1 py-0.5 text-xs transition-colors hover:bg-background"
                    onClick={() => {
                      const audioStrings = [...strings]
                        .reverse()
                        .map((s) => s.fret);
                      playChord(audioStrings, { strumSpeed: 50 });
                    }}
                    type="button"
                  >
                    <Volume2 className="h-3 w-3" />
                    Normal
                  </button>
                  <button
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded bg-background/50 px-1 py-0.5 text-xs transition-colors hover:bg-background"
                    onClick={() => {
                      const audioStrings = [...strings]
                        .reverse()
                        .map((s) => s.fret);
                      playChord(audioStrings, { strumSpeed: 200 });
                    }}
                    type="button"
                  >
                    <Volume2 className="h-3 w-3" />
                    Slow
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
