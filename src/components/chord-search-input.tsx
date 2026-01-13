'use client';

import { Grid2X2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  formatChordName as formatName,
  getChordsByCategory,
} from '@/lib/chord-data';
import { cn } from '@/lib/utils';
import type { ChordData, StringState } from '@/types/chord';
import { AndButton } from './and/and-button';
import { AndDialog } from './and/and-dialog';
import { ChordDiagram } from './chord-diagram';
import { ButtonGroup } from './ui/button-group';
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';

interface ChordSearchInputProps {
  onChordSelect: (strings: StringState[], chordName: string) => void;
  showFingers: boolean;
  parseStringsToState: (strings: string, fingering: string) => StringState[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
}

export const ChordSearchInput = ({
  onChordSelect,
  showFingers,
  parseStringsToState,
  searchQuery,
  setSearchQuery,
  loading,
}: ChordSearchInputProps) => {
  const chordCategories = getChordsByCategory();

  const handleDialogChordClick = (chord: ChordData) => {
    const stringStates = parseStringsToState(chord.strings, chord.fingering);
    onChordSelect(stringStates, formatName(chord.chordName));
  };

  return (
    <div className="flex w-full overflow-hidden rounded-full bg-muted">
      <ButtonGroup className="w-full">
        <InputGroup className="h-12 border-none">
          <InputGroupInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search chords (e.g., Am, G, Fmaj7)"
            value={searchQuery}
          />
          <InputGroupAddon className="ml-2 px-2">
            <Search
              className={cn(
                'size-4 text-muted-foreground',
                loading && 'animate-pulse'
              )}
            />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <AndDialog
              description="Browse all chords in the library"
              title="Chord Library"
              trigger={
                <AndButton
                  shape="circle"
                  title="Browse all chords"
                  variant="basic"
                >
                  <Grid2X2 className="size-4" />
                  <span className="text-sm">Browse</span>
                </AndButton>
              }
            >
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="min-h-[calc(100vh-14rem)] space-y-6 px-6 py-6">
                  {chordCategories.map((category) => (
                    <div key={category.name}>
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {category.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.chords.map((chord, index) => {
                          const displayName = formatName(
                            chord.chordName
                          ).replace(/\//g, '');
                          return (
                            <button
                              className="flex cursor-pointer flex-col items-center rounded-lg border border-transparent transition-colors hover:border-primary"
                              key={`${chord.chordName}-${index}`}
                              onClick={() => handleDialogChordClick(chord)}
                              type="button"
                            >
                              <div className="h-fit w-[110px] shrink-0 overflow-hidden">
                                <ChordDiagram
                                  chordName={displayName}
                                  showControls={false}
                                  showFingers={showFingers}
                                  size="sm"
                                  static
                                  strings={parseStringsToState(
                                    chord.strings,
                                    chord.fingering
                                  )}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AndDialog>
          </InputGroupAddon>
        </InputGroup>
      </ButtonGroup>
    </div>
  );
};
