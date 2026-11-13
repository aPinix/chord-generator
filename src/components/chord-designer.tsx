'use client';

import {
  EraserIcon,
  EyeIcon,
  EyeOffIcon,
  type LucideIcon,
  Redo2Icon,
  Undo2Icon,
  WandSparklesIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useHistory } from '@/hooks/use-history';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { playChord, pluckString, setTuning } from '@/lib/chord-audio';
import {
  chordToStrings,
  findLibraryChord,
  findLibraryChordByName,
  formatChordName,
  stringsToPattern,
} from '@/lib/chord-data';
import {
  detectChord,
  getFretPattern,
  getSoundingNotes,
  getStringNames,
  splitChordName,
} from '@/lib/notes';
import {
  findTuningPreset,
  isStandardTuning,
  isValidTuning,
  STANDARD_TUNING,
  type TuningNotes,
} from '@/lib/tunings';
import { cn } from '@/lib/utils';
import type { SavedChord, StringState } from '@/types/chord';
import { TOTAL_STRINGS } from '@/types/chord';
import { AndTooltip } from './and/and-tooltip';
import { ChordDiagram } from './chord-diagram';
import { ChordPlayer, STRUM_SPEED } from './chord-player';
import { ChordSearch } from './chord-search';
import { FretboardLegend } from './fretboard-legend';
import { GuitarFretboard, type Strum } from './guitar-fretboard';
import { SoundSelect, TuningMenu } from './guitar-setup';
import { PickIcon } from './pick-icon';
import { PopularChords } from './popular-chords';
import { SAVED_CHORD_HOTKEYS, SavedChords } from './saved-chords';
import { ZenMode } from './zen-mode';

const initialStrings: StringState[] = Array.from(
  { length: TOTAL_STRINGS },
  () => ({
    fret: 0,
    finger: undefined,
  })
);

interface ChordState {
  strings: StringState[];
  customName: string;
  useCustom: boolean;
}

const initialChordState: ChordState = {
  strings: initialStrings,
  customName: '',
  useCustom: false,
};

const TUNING_STORAGE_KEY = 'g-chord-tuning';
const SAVED_CHORDS_STORAGE_KEY = 'g-chord-saved-chords';
const SHOW_NAME_STORAGE_KEY = 'g-chord-show-name';

const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';

const isSavedChordList = (value: unknown): value is SavedChord[] =>
  Array.isArray(value) &&
  value.every(
    (chord) =>
      typeof chord === 'object' &&
      chord !== null &&
      typeof chord.id === 'string' &&
      typeof chord.name === 'string' &&
      Array.isArray(chord.strings) &&
      chord.strings.length === TOTAL_STRINGS
  );

// Only fret positions decide whether two shapes are the same chord
const fretKey = (strings: StringState[]) =>
  strings.map((s) => s.fret).join(',');

const isTextField = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  target.closest('input, textarea, select, [contenteditable="true"]') !== null;

const isSearchField = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.closest('[role="combobox"]') !== null;

const isInteractive = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  target.closest(
    'input, textarea, select, button, a, [role="dialog"], [contenteditable="true"]'
  ) !== null;

export function ChordDesigner() {
  const {
    state: chordState,
    set: setChordState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<ChordState>(initialChordState);

  const { strings, customName, useCustom } = chordState;
  const [strum, setStrum] = useState<Strum | null>(null);
  const [isZenOpen, setIsZenOpen] = useState(false);

  const [tuning, setTuningState] = usePersistentState<TuningNotes>(
    TUNING_STORAGE_KEY,
    STANDARD_TUNING,
    isValidTuning
  );
  const [savedChords, setSavedChords] = usePersistentState<SavedChord[]>(
    SAVED_CHORDS_STORAGE_KEY,
    [],
    isSavedChordList
  );

  // Whether the chord name is printed on the exported diagram
  const [showName, setShowName] = usePersistentState<boolean>(
    SHOW_NAME_STORAGE_KEY,
    true,
    isBoolean
  );

  // Keep the audio engine in the same tuning as the fretboard
  useEffect(() => {
    setTuning(tuning);
  }, [tuning]);

  const tuningPreset = findTuningPreset(tuning);
  const flats = tuningPreset?.flats ?? false;
  const isStandard = isStandardTuning(tuning);
  const stringNames = useMemo(
    () => getStringNames(tuning, flats),
    [tuning, flats]
  );
  const stringNamesLowFirst = useMemo(
    () => [...stringNames].reverse(),
    [stringNames]
  );
  const soundingNotes = useMemo(
    () => getSoundingNotes(strings, tuning, flats),
    [strings, tuning, flats]
  );

  // The name follows the notes, so it stays right when the tuning changes
  const detectedName = useMemo(
    () => detectChord(strings, tuning),
    [strings, tuning]
  );
  // An unrecognised shape reads "Custom" rather than an old name
  const chordName = useCustom ? customName : (detectedName ?? '');
  const isBlank = strings.every((s) => s.fret === 0);
  // Exactly what Clear would leave behind: nothing left to clear
  const isCleared = isBlank && customName === '' && !useCustom;

  // A shape the library knows, played with other fingers (or "any finger"):
  // offer the library's fingering. Library shapes assume standard tuning.
  //
  // Two cases:
  // - the exact shape is in the library: offer its fingering
  // - the notes make a chord the library knows, played another way, and no
  //   finger is chosen yet: offer the library's usual shape for that chord
  const fingeringSuggestion = useMemo(() => {
    if (!isStandard || isBlank) return null;

    const exact = findLibraryChord(strings);
    if (exact) {
      const suggested = chordToStrings(exact);
      const differs = suggested.some(
        (s, i) =>
          s.fret !== 0 && s.fret !== 'X' && s.finger !== strings[i].finger
      );
      return differs
        ? {
            kind: 'fingering' as const,
            name: formatChordName(exact.chordName),
            strings: suggested,
          }
        : null;
    }

    const fretted = strings.filter((s) => s.fret !== 0 && s.fret !== 'X');
    const allAnyFinger = fretted.every((s) => s.finger === undefined);
    if (!detectedName || !allAnyFinger) return null;

    const usual = findLibraryChordByName(detectedName);
    return usual
      ? {
          kind: 'shape' as const,
          name: detectedName,
          strings: chordToStrings(usual),
        }
      : null;
  }, [isStandard, isBlank, strings, detectedName]);

  // One string at a time, with the chosen sound and tuning
  const handlePlayNote = useCallback(
    (lowStringIndex: number) => {
      const fret = strings[TOTAL_STRINGS - 1 - lowStringIndex].fret;
      pluckString(lowStringIndex, fret);
    },
    [strings]
  );

  // Closing the suggestion holds until the dots or fingers change
  const suggestionKey = JSON.stringify(strings);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const offeredSuggestion =
    dismissedKey === suggestionKey ? null : fingeringSuggestion;

  // The callout fades out in place rather than vanishing, so it keeps
  // showing the last suggestion until the fade ends
  const [shownSuggestion, setShownSuggestion] = useState(offeredSuggestion);
  useEffect(() => {
    if (offeredSuggestion) setShownSuggestion(offeredSuggestion);
  }, [offeredSuggestion]);

  // Hovering the suggestion tries it on the fretboard before committing
  const [isPreviewingSuggestion, setIsPreviewingSuggestion] = useState(false);
  const fretboardStrings =
    isPreviewingSuggestion && offeredSuggestion
      ? offeredSuggestion.strings
      : strings;

  const applyFingering = useCallback(() => {
    if (!offeredSuggestion) return;
    setIsPreviewingSuggestion(false);
    setChordState({ ...chordState, strings: offeredSuggestion.strings });
  }, [offeredSuggestion, chordState, setChordState]);

  const dismissFingering = useCallback(() => {
    setIsPreviewingSuggestion(false);
    setDismissedKey(suggestionKey);
  }, [suggestionKey]);

  const handleStrum = useCallback(
    (speed: number) => {
      // Audio wants the low string first, the UI keeps the high string first
      playChord(
        [...strings].reverse().map((s) => s.fret),
        { strumSpeed: speed }
      );
      setStrum({ id: Date.now(), speed });
    },
    [strings]
  );

  // Let the strings settle, so a later re-render doesn't replay the strum
  useEffect(() => {
    if (!strum) return;
    const settle = setTimeout(
      () => setStrum(null),
      1000 + strum.speed * (TOTAL_STRINGS - 1)
    );
    return () => clearTimeout(settle);
  }, [strum]);

  /** Put a chord on the fretboard, keeping `name` if detection disagrees. */
  const loadChord = useCallback(
    (newStrings: StringState[], name?: string) => {
      const keepName =
        Boolean(name) && name !== detectChord(newStrings, tuning);
      setChordState({
        strings: newStrings,
        customName: keepName && name ? name : '',
        useCustom: keepName,
      });
    },
    [tuning, setChordState]
  );

  // Library shapes are named for standard tuning; elsewhere the notes decide
  const handleLibrarySelect = useCallback(
    (newStrings: StringState[], name: string) => {
      loadChord(newStrings, isStandard ? name : undefined);
    },
    [loadChord, isStandard]
  );

  // The open strings in the current tuning, chord or not
  const handlePlayOpen = useCallback(() => {
    playChord(Array(TOTAL_STRINGS).fill(0), {
      strumSpeed: STRUM_SPEED.normal,
    });
  }, []);

  // Picking a popular chord plays it straight away, strings and all
  const handlePopularSelect = useCallback(
    (newStrings: StringState[], name: string) => {
      handleLibrarySelect(newStrings, name);
      playChord(
        [...newStrings].reverse().map((s) => s.fret),
        { strumSpeed: STRUM_SPEED.normal }
      );
      setStrum({ id: Date.now(), speed: STRUM_SPEED.normal });
    },
    [handleLibrarySelect]
  );

  const handleSavedSelect = useCallback(
    (chord: SavedChord) => {
      loadChord(chord.strings, chord.name);
    },
    [loadChord]
  );

  const activeSavedId = useMemo(() => {
    const key = fretKey(strings);
    return (
      savedChords.find((chord) => fretKey(chord.strings) === key)?.id ?? null
    );
  }, [savedChords, strings]);

  // A saved chord needs a label even when the shape has no name
  const saveName =
    chordName || (isBlank ? 'Open' : getFretPattern(strings).join(''));

  const handleSaveChord = useCallback(() => {
    if (activeSavedId !== null) return;
    setSavedChords((previous) => [
      ...previous,
      { id: crypto.randomUUID(), name: saveName, strings },
    ]);
  }, [activeSavedId, saveName, strings, setSavedChords]);

  // Kept until the "Undo" toast goes away, so ⌘Z can bring them back too
  const clearedSaved = useRef<SavedChord[] | null>(null);

  const restoreSaved = useCallback(() => {
    const cleared = clearedSaved.current;
    if (!cleared) return false;
    clearedSaved.current = null;
    setSavedChords(cleared);
    toast.dismiss('saved-chords-cleared');
    return true;
  }, [setSavedChords]);

  const handleClearSaved = useCallback(() => {
    const cleared = savedChords;
    if (cleared.length === 0) return;
    clearedSaved.current = cleared;
    setSavedChords([]);
    toast(
      cleared.length === 1
        ? 'Cleared 1 saved chord'
        : `Cleared ${cleared.length} saved chords`,
      {
        id: 'saved-chords-cleared',
        duration: 8000,
        action: { label: 'Undo', onClick: () => restoreSaved() },
        onAutoClose: () => {
          clearedSaved.current = null;
        },
        onDismiss: () => {
          clearedSaved.current = null;
        },
      }
    );
  }, [savedChords, setSavedChords, restoreSaved]);

  const handleRemoveSaved = useCallback(
    (id: string) => {
      setSavedChords((previous) => previous.filter((chord) => chord.id !== id));
    },
    [setSavedChords]
  );

  // Keyboard: undo and redo, Space to strum, 1–9 for saved chords
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // ⌘Z undoes and ⌘⇧Z redoes (Ctrl on Windows, where Ctrl+Y also redoes).
      // With Shift held the key arrives as "Z", hence the lower-casing.
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.altKey &&
        (key === 'z' || key === 'y')
      ) {
        // The search box keeps the browser's own text undo
        if (isSearchField(e.target)) return;
        e.preventDefault();
        if (key === 'y' || e.shiftKey) {
          redo();
        } else if (!restoreSaved()) {
          // Right after clearing saved chords, ⌘Z brings them back first
          undo();
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Number keys work everywhere but in a text field, Zen mode included
      if (/^[1-9]$/.test(e.key) && !isTextField(e.target)) {
        const chord = savedChords[Number(e.key) - 1];
        if (chord && Number(e.key) <= SAVED_CHORD_HOTKEYS) {
          e.preventDefault();
          handleSavedSelect(chord);
        }
        return;
      }

      // Zen mode has its own strumming keys
      if (e.key === ' ' && !e.repeat && !isInteractive(e.target)) {
        e.preventDefault();
        handleStrum(STRUM_SPEED.normal);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleStrum, savedChords, handleSavedSelect, restoreSaved]);

  const handleStringChange = useCallback(
    (stringIndex: number, fret: number | 'X' | 0) => {
      const newStrings = [...strings];
      newStrings[stringIndex] = { ...newStrings[stringIndex], fret };
      // New frets make a new chord, so the name follows the notes again.
      // A typed name stays in the field, one click away.
      setChordState({ ...chordState, strings: newStrings, useCustom: false });
    },
    [strings, chordState, setChordState]
  );

  const handleFingerChange = useCallback(
    (stringIndex: number, finger: number | undefined) => {
      const newStrings = [...strings];
      newStrings[stringIndex] = { ...newStrings[stringIndex], finger };
      setChordState({
        ...chordState,
        strings: newStrings,
      });
    },
    [strings, chordState, setChordState]
  );

  // A normal history step, so Undo brings the chord back
  const handleClear = useCallback(() => {
    setChordState(initialChordState);
  }, [setChordState]);

  const handleCustomNameChange = useCallback(
    (value: string) => {
      setChordState({
        ...chordState,
        customName: value,
        // An emptied field falls back to the detected name
        useCustom: value !== '',
      });
    },
    [chordState, setChordState]
  );

  const handleUseCustomToggle = useCallback(
    (value: boolean) => {
      setChordState({
        ...chordState,
        useCustom: value,
      });
    },
    [chordState, setChordState]
  );

  const tuningLabel = isStandard
    ? undefined
    : (tuningPreset?.name ?? 'Custom tuning');

  return (
    <>
      {/* The instrument */}
      <section
        aria-label="Fretboard"
        className="bg-stage pb-8 text-stage-foreground sm:pb-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 pt-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:pt-8">
            <div className="min-w-0">
              <ChordHeading
                isBlank={isBlank}
                name={chordName}
                notes={soundingNotes}
                onPlayNote={handlePlayNote}
                onPlayOpen={handlePlayOpen}
                strings={strings}
              />
            </div>
            <ChordSearch
              className="w-full lg:-mb-2 lg:max-w-md"
              onChordSelect={handleLibrarySelect}
            />
          </div>

          <PopularChords
            className="mt-6 sm:mt-8"
            currentPattern={stringsToPattern(strings)}
            onSelect={handlePopularSelect}
          />

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6">
            <div className="flex items-center gap-2">
              <ChordPlayer onStrum={handleStrum} />
              <button
                className="ml-auto flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full pr-4 pl-3 text-sm font-medium ring-1 ring-stage-edge transition-colors outline-none hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground active:scale-97 sm:ml-0 pointer-coarse:h-11"
                onClick={() => setIsZenOpen(true)}
                type="button"
              >
                <PickIcon className="h-4.5 w-4 text-pick" />
                Zen mode
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <SoundSelect className="max-sm:flex-1" />
                <TuningMenu
                  className="max-sm:flex-1"
                  onTuningChange={setTuningState}
                  tuning={tuning}
                />
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:ml-1">
                <ToolbarIconButton
                  disabled={!canUndo}
                  icon={Undo2Icon}
                  label="Undo"
                  onClick={undo}
                  shortcut="⌘Z"
                />
                <ToolbarIconButton
                  disabled={!canRedo}
                  icon={Redo2Icon}
                  label="Redo"
                  onClick={redo}
                  shortcut="⌘⇧Z"
                />
                <button
                  className="ml-auto flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium ring-1 ring-stage-edge transition-colors outline-none hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:ml-1 pointer-coarse:h-11"
                  disabled={isCleared}
                  onClick={handleClear}
                  type="button"
                >
                  <EraserIcon className="size-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Previewed dots read as a suggestion until it is applied */}
          <div
            className="mt-4 data-previewing:**:[.fb-dot-in]:opacity-70 data-previewing:**:[.fb-dot-in]:outline-2 data-previewing:**:[.fb-dot-in]:outline-offset-2 data-previewing:**:[.fb-dot-in]:outline-white/80 data-previewing:**:[.fb-dot-in]:outline-dashed"
            data-previewing={isPreviewingSuggestion || undefined}
          >
            <GuitarFretboard
              callout={
                shownSuggestion && {
                  ...calloutAnchor(strings, shownSuggestion.strings),
                  node: (
                    <FingeringSuggestion
                      isVisible={offeredSuggestion !== null}
                      kind={shownSuggestion.kind}
                      name={shownSuggestion.name}
                      onApply={applyFingering}
                      onDismiss={dismissFingering}
                      onHidden={() => {
                        setShownSuggestion(null);
                        setIsPreviewingSuggestion(false);
                      }}
                      onPreviewChange={setIsPreviewingSuggestion}
                      strings={shownSuggestion.strings}
                    />
                  ),
                }
              }
              onFingerChange={handleFingerChange}
              onStringChange={handleStringChange}
              stringNames={stringNames}
              strings={fretboardStrings}
              strum={strum}
              visibleFrets={21}
            />
          </div>

          <SavedChords
            activeId={activeSavedId}
            chords={savedChords}
            className="mb-5"
            currentName={saveName}
            onClear={handleClearSaved}
            onRemove={handleRemoveSaved}
            onSave={handleSaveChord}
            onSelect={handleSavedSelect}
          />

          <FretboardLegend />
        </div>
      </section>

      {/* The diagram */}
      <section
        aria-labelledby="diagram-heading"
        className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="mb-8 max-w-xl">
          <h2
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
            id="diagram-heading"
          >
            Your chord diagram
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Ready for a lyric sheet, a lesson handout or a setlist.
          </p>
        </div>

        <ChordDiagram
          chordName={chordName}
          nameField={
            <ChordNameField
              customName={customName}
              detectedName={detectedName}
              onCustomNameChange={handleCustomNameChange}
              onShowNameChange={setShowName}
              onUseCustomChange={handleUseCustomToggle}
              showName={showName}
              useCustom={useCustom}
            />
          }
          showName={showName}
          stringNames={stringNamesLowFirst}
          strings={strings}
        />
      </section>

      <ZenMode
        activeSavedId={activeSavedId}
        chordName={chordName}
        fallbackName={isBlank ? 'Chord' : 'Custom'}
        notes={soundingNotes}
        onOpenChange={setIsZenOpen}
        onSelectSaved={handleSavedSelect}
        open={isZenOpen}
        savedChords={savedChords}
        strings={strings}
        tuningLabel={tuningLabel}
      />
    </>
  );
}

interface ChordHeadingProps {
  name: string;
  strings: StringState[];
  /** Sounding notes, low string first */
  notes: (string | null)[];
  isBlank: boolean;
  /** Play one string, by its index from the low string */
  onPlayNote: (lowStringIndex: number) => void;
  /** Strum the open strings in the current tuning */
  onPlayOpen: () => void;
}

/** The chord name set large, with its fret pattern and sounding notes. */
function ChordHeading({
  name,
  strings,
  notes,
  isBlank,
  onPlayNote,
  onPlayOpen,
}: ChordHeadingProps) {
  const frets = getFretPattern(strings);
  const { root, rest } = splitChordName(name);

  return (
    <div className="min-w-0">
      {/* The suggestion shares the title's line, so it never pushes anything down */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* One line always: longer names step down in size instead of wrapping */}
        <p
          aria-live="polite"
          className={cn(
            'shrink-0 font-display leading-none font-extrabold tracking-tighter whitespace-nowrap',
            name.length <= 4
              ? 'text-[clamp(3.25rem,9vw,6.5rem)]'
              : name.length <= 7
                ? 'text-[clamp(2.75rem,8vw,5.75rem)]'
                : 'text-[clamp(2.25rem,6.5vw,4.75rem)]'
          )}
        >
          {name ? (
            <>
              <span className="sr-only">Chord: </span>
              {root}
              {rest && <span className="text-[0.58em]">{rest}</span>}
            </>
          ) : (
            // No chord to name yet, so the placeholder stays in the background
            <span className="opacity-30">{isBlank ? 'Chord' : 'Custom'}</span>
          )}
        </p>
      </div>

      <dl className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-1 text-lg">
        <div className="flex items-baseline gap-3">
          <dt className="text-sm text-stage-muted">Frets</dt>
          <dd className="font-semibold tracking-[0.18em] tabular-nums">
            {frets.join('')}
          </dd>
        </div>
        <div className="flex items-baseline gap-3">
          {/* The label itself strums the open strings, to hear the tuning */}
          <dt>
            <button
              className="-mx-1.5 cursor-pointer rounded-full px-1.5 py-0.5 text-sm text-stage-muted underline decoration-stage-muted/40 decoration-dotted underline-offset-4 transition-colors outline-none hover:text-stage-foreground focus-visible:ring-2 focus-visible:ring-stage-foreground"
              onClick={onPlayOpen}
              title="Strum the open strings"
              type="button"
            >
              Notes
            </button>
          </dt>
          {/* Each note plays its string on its own */}
          <dd className="-mx-1.5 flex font-semibold">
            {notes.map((note, index) =>
              note === null ? (
                <span
                  className="flex h-8 min-w-7 items-center justify-center text-stage-muted/60"
                  key={index}
                >
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Muted</span>
                </span>
              ) : (
                <button
                  aria-label={`Play ${note}, string ${6 - index}`}
                  className="flex h-8 min-w-7 cursor-pointer items-center justify-center rounded-full px-1.5 transition-colors outline-none hover:bg-stage-raised/70 focus-visible:ring-2 focus-visible:ring-stage-foreground active:bg-stage-raised pointer-coarse:h-10 pointer-coarse:min-w-9"
                  key={index}
                  onClick={() => onPlayNote(index)}
                  title={`Play ${note}`}
                  type="button"
                >
                  {note}
                </button>
              )
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Which fret the suggestion points at: the middle of your shape, or of the
 * suggested one when nothing is fretted yet.
 */
function calloutAnchor(current: StringState[], suggested: StringState[]) {
  const frets = (list: StringState[]) =>
    list.flatMap((s) =>
      typeof s.fret === 'number' && s.fret > 0 ? [s.fret] : []
    );
  const shape = frets(current).length ? frets(current) : frets(suggested);
  if (!shape.length) return { fret: 1 };
  return { fret: Math.round((Math.min(...shape) + Math.max(...shape)) / 2) };
}

interface FingeringSuggestionProps {
  /** Same frets with the usual fingers, or the usual shape for the chord */
  kind: 'fingering' | 'shape';
  name: string;
  /** The library's fingering, high string first */
  strings: StringState[];
  /** False while fading out after it no longer applies */
  isVisible: boolean;
  onApply: () => void;
  /** Close it without changing anything */
  onDismiss: () => void;
  /** Called once the fade-out has finished */
  onHidden: () => void;
  /** True while pointing at or focusing it, to try it on the fretboard */
  onPreviewChange: (isPreviewing: boolean) => void;
}

/**
 * A callout on the fretboard, beside the chord: the usual fingers, numbered.
 * Pointing at it tries them on the fretboard; clicking keeps them.
 */
function FingeringSuggestion({
  kind,
  name,
  strings,
  isVisible,
  onApply,
  onDismiss,
  onHidden,
  onPreviewChange,
}: FingeringSuggestionProps) {
  // Low string first, the way fingerings are read
  const fingers = [...strings].reverse();
  const description =
    kind === 'fingering'
      ? `Use the usual ${name} fingering`
      : `Switch to the usual ${name} shape`;

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        'relative flex h-11 items-center gap-1 rounded-full bg-popover pr-1.5 text-popover-foreground shadow-[0_2px_4px_rgb(0_0_0/14%),0_12px_28px_-8px_rgb(0_0_0/40%)] ring-1 ring-black/5 transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none starting:translate-y-1 starting:opacity-0',
        !isVisible && 'pointer-events-none translate-y-1 opacity-0'
      )}
      onTransitionEnd={(e) => {
        if (
          !isVisible &&
          e.target === e.currentTarget &&
          e.propertyName === 'opacity'
        )
          onHidden();
      }}
    >
      {/* Points down at the chord; the fretboard sets where */}
      <span
        aria-hidden="true"
        className="absolute -bottom-1 left-(--arrow-x) size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-popover"
      />
      <button
        aria-label={description}
        className="group/callout relative flex h-full cursor-pointer items-center gap-2.5 rounded-full pl-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-97"
        onBlur={() => onPreviewChange(false)}
        onClick={onApply}
        onFocus={(e) => {
          // Keyboard focus previews; a tap or click goes straight to applying
          if (e.currentTarget.matches(':focus-visible')) onPreviewChange(true);
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') onPreviewChange(true);
        }}
        onPointerLeave={() => onPreviewChange(false)}
        tabIndex={isVisible ? 0 : -1}
        type="button"
      >
        {/* A whole-pixel width keeps the dots after it on the pixel grid */}
        <span className="w-12 text-xs font-semibold whitespace-nowrap">
          Is this?
        </span>
        <span aria-hidden="true" className="flex gap-0.5">
          {fingers.map((s, index) => (
            <span
              className={cn(
                // 13px digits in a 24px circle land on whole pixels, dead centre
                'flex size-6 items-center justify-center rounded-full text-[0.8125rem] font-bold',
                s.finger
                  ? 'finger-dot'
                  : 'text-muted-foreground ring-[1.5px] ring-foreground/25 ring-inset'
              )}
              data-finger={s.finger}
              // Flat: no shadow, so they read as a key, not as dots to press
              data-flat=""
              key={index}
            >
              {s.finger ?? (s.fret === 'X' ? '×' : '')}
            </span>
          ))}
        </span>
        {/* Says what a click does */}
        <span className="flex h-8 items-center gap-1 rounded-full bg-primary pr-3 pl-2.5 text-xs font-semibold whitespace-nowrap text-primary-foreground transition-colors group-hover/callout:bg-primary/90">
          <WandSparklesIcon aria-hidden="true" className="size-3.5" />
          Apply
        </span>
      </button>
      <button
        aria-label="Dismiss the suggestion"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground ring-[1.5px] ring-border transition-colors outline-none ring-inset hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        onClick={onDismiss}
        tabIndex={isVisible ? 0 : -1}
        title="Dismiss"
        type="button"
      >
        <XIcon className="size-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}

interface ToolbarIconButtonProps {
  icon: LucideIcon;
  label: string;
  shortcut: string;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarIconButton({
  icon: Icon,
  label,
  shortcut,
  disabled,
  onClick,
}: ToolbarIconButtonProps) {
  return (
    <AndTooltip
      asChild
      trigger={
        <button
          aria-label={label}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors outline-none hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent pointer-coarse:size-11"
          disabled={disabled}
          onClick={onClick}
          type="button"
        >
          <Icon className="size-5" />
        </button>
      }
    >
      {label} ({shortcut})
    </AndTooltip>
  );
}

interface ChordNameFieldProps {
  detectedName: string | null;
  customName: string;
  useCustom: boolean;
  /** Whether the name is printed on the diagram */
  showName: boolean;
  onCustomNameChange: (value: string) => void;
  onUseCustomChange: (value: boolean) => void;
  onShowNameChange: (value: boolean) => void;
}

/** Choose between the detected chord name and one you type yourself. */
function ChordNameField({
  detectedName,
  customName,
  useCustom,
  showName,
  onCustomNameChange,
  onUseCustomChange,
  onShowNameChange,
}: ChordNameFieldProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <div
        className={cn(
          'flex h-10 min-w-0 flex-1 items-center gap-1 rounded-full bg-muted p-1 transition-shadow focus-within:ring-2 focus-within:ring-ring pointer-coarse:h-12',
          !showName && 'opacity-50'
        )}
      >
        {detectedName && (
          <button
            aria-pressed={!useCustom}
            className={cn(
              'h-8 shrink-0 cursor-pointer rounded-full px-3 font-display text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-10',
              useCustom
                ? 'text-muted-foreground hover:text-foreground'
                : 'bg-card text-foreground shadow-sm dark:bg-foreground/15'
            )}
            onClick={() => onUseCustomChange(false)}
            title="Use the detected chord name"
            type="button"
          >
            {detectedName}
          </button>
        )}
        <input
          aria-label="Custom chord name"
          className={cn(
            'h-8 min-w-0 flex-1 rounded-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground pointer-coarse:h-10 pointer-coarse:text-base',
            useCustom &&
              detectedName &&
              'bg-card shadow-sm dark:bg-foreground/15'
          )}
          onChange={(e) => onCustomNameChange(e.target.value)}
          onFocus={() => customName && onUseCustomChange(true)}
          placeholder={detectedName ? 'Or type your own' : 'Name this chord'}
          value={customName}
        />
      </div>
      <AndTooltip
        asChild
        trigger={
          <button
            aria-label="Show the name on the diagram"
            aria-pressed={showName}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full ring-1 ring-border transition-colors outline-none ring-inset hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:scale-97 pointer-coarse:size-11"
            onClick={() => onShowNameChange(!showName)}
            type="button"
          >
            {showName ? (
              <EyeIcon className="size-4" />
            ) : (
              <EyeOffIcon className="size-4" />
            )}
          </button>
        }
      >
        {showName
          ? 'Hide the name on the diagram'
          : 'Show the name on the diagram'}
      </AndTooltip>
    </div>
  );
}
