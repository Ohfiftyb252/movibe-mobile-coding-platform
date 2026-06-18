import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ─── Types ────────────────────────────────────────────────────────────────────

type SoundCategory = 'Drums' | '808s' | 'Loops' | 'Chops' | 'FX' | 'Trash' | 'Uncategorized';
type SoundMark = 'Keep' | 'Fire' | 'Mutate' | 'Chop' | 'Stack' | 'Trash' | null;
type PackType = 'Drum Kit' | 'Loop Pack' | 'One Shot Pack' | 'Beat Starter Pack' | 'Producer Bundle';

interface SoundFile {
  id: string;
  name: string;
  file: File;
  category: SoundCategory;
  mark: SoundMark;
  url: string | null;
  size: number;
}

interface PersistedSound {
  id: string;
  name: string;
  category: SoundCategory;
  mark: SoundMark;
  size: number;
}

interface Receipt {
  packName: string;
  dateCreated: string;
  fileCount: number;
  licenseType: string;
  sourceFolder: string;
  exportHash: string;
  usageNotes: string;
  ohfiftybTag: string;
  categories: Record<string, number>;
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

const LS_MARKS_KEY = 'desklab:marks';
const LS_PACK_KEY = 'desklab:packName';

function loadPersistedMarks(): Map<string, { mark: SoundMark; category: SoundCategory }> {
  try {
    const raw = localStorage.getItem(LS_MARKS_KEY);
    if (!raw) return new Map();
    const arr: PersistedSound[] = JSON.parse(raw);
    return new Map(arr.map(s => [s.name + ':' + s.size, { mark: s.mark, category: s.category }]));
  } catch {
    return new Map();
  }
}

function savePersistedMarks(sounds: SoundFile[]) {
  const arr: PersistedSound[] = sounds.map(({ id, name, category, mark, size }) => ({ id, name, category, mark, size }));
  localStorage.setItem(LS_MARKS_KEY, JSON.stringify(arr));
}

// ─── Sound classifier ─────────────────────────────────────────────────────────

const DRUM_KEYWORDS = ['kick', 'snare', 'hat', 'hihat', 'hi-hat', 'clap', 'rim', 'tom', 'cymbal', 'crash', 'ride', 'perc', 'drum'];
const BASS_KEYWORDS = ['808', 'sub', 'bass', 'slide', 'glide'];
const LOOP_KEYWORDS = ['loop', 'phrase', 'pattern', 'full', 'stem'];
const CHOP_KEYWORDS = ['chop', 'slice', 'hit', 'shot', 'stab', 'piece'];
const FX_KEYWORDS = ['riser', 'impact', 'sweep', 'noise', 'fx', 'effect', 'vox', 'vocal', 'transition', 'upfx', 'swell'];

function classifySound(filename: string): SoundCategory {
  const lower = filename.toLowerCase();
  if (DRUM_KEYWORDS.some(k => lower.includes(k))) return 'Drums';
  if (BASS_KEYWORDS.some(k => lower.includes(k))) return '808s';
  if (LOOP_KEYWORDS.some(k => lower.includes(k))) return 'Loops';
  if (FX_KEYWORDS.some(k => lower.includes(k))) return 'FX';
  if (CHOP_KEYWORDS.some(k => lower.includes(k))) return 'Chops';
  return 'Uncategorized';
}

function isAudioFile(name: string) {
  return /\.(wav|mp3|aif|aiff|flac|ogg|m4a)$/i.test(name);
}

// Dedup key: name + file size catches both same-name and renamed duplicates
function dedupKey(name: string, size: number) {
  return `${name}:${size}`;
}

async function hashFiles(files: SoundFile[]): Promise<string> {
  const str = files.map(f => f.name + f.size).join('|');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12).toUpperCase();
}

// ─── Export validation ────────────────────────────────────────────────────────

interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function validateExport(packName: string, sounds: SoundFile[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!packName.trim()) errors.push('Pack name is required.');

  const exportable = sounds.filter(s => s.mark !== 'Trash');
  const selected = sounds.filter(s => s.mark === 'Fire' || s.mark === 'Keep');

  if (exportable.length === 0) errors.push('No sounds to export — all files are trashed or nothing was loaded.');
  else if (selected.length === 0) warnings.push('No sounds marked Fire or Keep — exporting all non-trashed files.');

  const allUncategorized = exportable.length > 0 && exportable.every(s => s.category === 'Uncategorized');
  if (allUncategorized) warnings.push('Every file is Uncategorized. Consider reclassifying sounds before exporting.');

  return { ok: errors.length === 0, errors, warnings };
}

// ─── Category colors ──────────────────────────────────────────────────────────

const CAT_COLORS: Record<SoundCategory, string> = {
  'Drums':         'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '808s':          'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Loops':         'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Chops':         'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'FX':            'bg-green-500/20 text-green-300 border-green-500/30',
  'Trash':         'bg-red-500/20 text-red-300 border-red-500/30',
  'Uncategorized': 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
};

const MARK_COLORS: Record<NonNullable<SoundMark>, string> = {
  'Keep':   'bg-zinc-600 text-white',
  'Fire':   'bg-orange-500 text-white',
  'Mutate': 'bg-purple-600 text-white',
  'Chop':   'bg-yellow-600 text-black',
  'Stack':  'bg-blue-600 text-white',
  'Trash':  'bg-red-700 text-white',
};

const SHORTCUTS: Record<string, SoundMark> = {
  'k': 'Keep',
  'f': 'Fire',
  'm': 'Mutate',
  'c': 'Chop',
  's': 'Stack',
  't': 'Trash',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function DeskLabPage() {
  const [sounds, setSoundsRaw] = useState<SoundFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<SoundCategory | 'All'>('All');
  const [filterMark, setFilterMark] = useState<SoundMark | 'All'>('All');
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [packType, setPackType] = useState<PackType>('Drum Kit');
  const [packName, setPackName] = useState(() => localStorage.getItem(LS_PACK_KEY) || 'OHFIFTYB_BoomTrap_Vol1');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'pack' | 'export'>('library');
  const [isPlaying, setIsPlaying] = useState(false);
  const [validationMsg, setValidationMsg] = useState<ValidationResult | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wrap setSounds to persist marks on every change
  const setSounds = useCallback((updater: SoundFile[] | ((prev: SoundFile[]) => SoundFile[])) => {
    setSoundsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      savePersistedMarks(next);
      return next;
    });
  }, []);

  // Persist pack name
  useEffect(() => {
    localStorage.setItem(LS_PACK_KEY, packName);
  }, [packName]);

  // ── Play ──────────────────────────────────────────────────────────────────
  const playSound = useCallback((sound: SoundFile) => {
    if (!audioRef.current) return;
    if (!sound.url) {
      const url = URL.createObjectURL(sound.file);
      setSounds(prev => prev.map(s => s.id === sound.id ? { ...s, url } : s));
      audioRef.current.src = url;
    } else {
      audioRef.current.src = sound.url;
    }
    audioRef.current.play();
    setIsPlaying(true);
  }, [setSounds]);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const selectSound = useCallback((sound: SoundFile) => {
    setSelectedId(sound.id);
    playSound(sound);
  }, [playSound]);

  // ── Import files ──────────────────────────────────────────────────────────
  const processFiles = useCallback(async (files: File[]) => {
    setScanning(true);
    const persisted = loadPersistedMarks();
    const audioFiles = files.filter(f => isAudioFile(f.name));

    const newSounds: SoundFile[] = audioFiles.map(file => {
      const key = dedupKey(file.name, file.size);
      const saved = persisted.get(key);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        file,
        category: saved?.category ?? classifySound(file.name),
        mark: saved?.mark ?? null,
        url: null,
        size: file.size,
      };
    });

    setSounds(prev => {
      const existing = new Set(prev.map(s => dedupKey(s.name, s.size)));
      const unique = newSounds.filter(s => !existing.has(dedupKey(s.name, s.size)));
      return [...prev, ...unique];
    });
    setScanning(false);
  }, [setSounds]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setScanning(true);
    const collected: File[] = [];

    async function traverseEntry(entry: FileSystemEntry) {
      if (entry.isFile) {
        await new Promise<void>(res => {
          (entry as FileSystemFileEntry).file(f => { collected.push(f); res(); });
        });
      } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader();
        await new Promise<void>(res => {
          reader.readEntries(async entries => {
            for (const ent of entries) await traverseEntry(ent);
            res();
          });
        });
      }
    }

    for (const item of Array.from(e.dataTransfer.items)) {
      const entry = item.webkitGetAsEntry();
      if (entry) await traverseEntry(entry);
    }
    processFiles(collected);
  }, [processFiles]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const mark = SHORTCUTS[e.key.toLowerCase()];
      if (mark && selectedId) {
        setSounds(prev => prev.map(s => s.id === selectedId ? { ...s, mark } : s));
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (isPlaying) stopSound();
        else {
          const sel = sounds.find(s => s.id === selectedId);
          if (sel) playSound(sel);
        }
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const filtered = sounds.filter(s => {
          if (filterCat !== 'All' && s.category !== filterCat) return false;
          if (filterMark !== 'All' && s.mark !== filterMark) return false;
          return true;
        });
        const idx = filtered.findIndex(s => s.id === selectedId);
        const next = e.key === 'ArrowDown' ? Math.min(idx + 1, filtered.length - 1) : Math.max(idx - 1, 0);
        if (filtered[next]) selectSound(filtered[next]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, sounds, isPlaying, filterCat, filterMark, playSound, stopSound, selectSound, setSounds]);

  const markSound = useCallback((id: string, mark: SoundMark) => {
    setSounds(prev => prev.map(s => s.id === id ? { ...s, mark } : s));
  }, [setSounds]);

  const filteredSounds = sounds.filter(s => {
    if (filterCat !== 'All' && s.category !== filterCat) return false;
    if (filterMark !== 'All' && s.mark !== filterMark) return false;
    return true;
  });

  const catCounts = sounds.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const markedCounts = {
    Fire: sounds.filter(s => s.mark === 'Fire').length,
    Keep: sounds.filter(s => s.mark === 'Keep').length,
    Trash: sounds.filter(s => s.mark === 'Trash').length,
  };

  // ── Build + export ZIP ─────────────────────────────────────────────────────
  const buildAndExport = async () => {
    const validation = validateExport(packName, sounds);
    if (!validation.ok) {
      setValidationMsg(validation);
      return;
    }
    if (validation.warnings.length > 0) {
      setValidationMsg(validation);
      // Warnings don't block — proceed after showing them
    } else {
      setValidationMsg(null);
    }

    const kept = sounds.filter(s => s.mark !== 'Trash');
    const zip = new JSZip();

    const folders: Record<string, SoundFile[]> = {
      '01_Drums':         kept.filter(s => s.category === 'Drums'),
      '02_808s':          kept.filter(s => s.category === '808s'),
      '03_Loops':         kept.filter(s => s.category === 'Loops'),
      '04_Chops':         kept.filter(s => s.category === 'Chops'),
      '05_FX':            kept.filter(s => s.category === 'FX'),
      '06_Uncategorized': kept.filter(s => s.category === 'Uncategorized'),
    };

    for (const [folder, files] of Object.entries(folders)) {
      for (const sf of files) {
        zip.file(`${packName}/${folder}/${sf.name}`, sf.file);
      }
    }

    const hash = await hashFiles(kept);
    const rec: Receipt = {
      packName,
      dateCreated: new Date().toISOString(),
      fileCount: kept.length,
      licenseType: 'OHFIFTYB Standard — Non-Exclusive',
      sourceFolder: 'Drag Import',
      exportHash: hash,
      usageNotes: 'For beat production, film, and commercial use. Do not resell unaltered.',
      ohfiftybTag: '@ohfiftyb252 | OHFIFTYB Sounds',
      categories: Object.fromEntries(Object.entries(folders).map(([k, v]) => [k, v.length])),
    };
    setReceipt(rec);

    zip.file(`${packName}/08_Receipt/receipt.json`, JSON.stringify(rec, null, 2));
    zip.file(`${packName}/07_License/license.txt`,
`OHFIFTYB STANDARD LICENSE
Pack: ${packName}
Date: ${rec.dateCreated}
Hash: ${hash}

You are licensed to:
  - Use these sounds in original musical compositions
  - Release music commercially using these sounds
  - Use in film, TV, sync, and podcast productions

You may NOT:
  - Resell, redistribute, or repackage these sounds as-is
  - Claim ownership of unaltered sounds
  - Share this pack without written permission

Contact: @ohfiftyb252
`);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${packName}.zip`);
  };

  const generateReceipt = async () => {
    const validation = validateExport(packName, sounds);
    if (!validation.ok) { setValidationMsg(validation); return; }
    setValidationMsg(validation.warnings.length > 0 ? validation : null);
    const kept = sounds.filter(s => s.mark !== 'Trash');
    const hash = await hashFiles(kept);
    setReceipt({
      packName,
      dateCreated: new Date().toISOString(),
      fileCount: kept.length,
      licenseType: 'OHFIFTYB Standard — Non-Exclusive',
      sourceFolder: 'Drag Import',
      exportHash: hash,
      usageNotes: 'For beat production, film, and commercial use.',
      ohfiftybTag: '@ohfiftyb252 | OHFIFTYB Sounds',
      categories: sounds.reduce<Record<string, number>>((a, s) => { a[s.category] = (a[s.category] || 0) + 1; return a; }, {}),
    });
    setActiveTab('export');
  };

  const clearAll = () => {
    sounds.forEach(s => { if (s.url) URL.revokeObjectURL(s.url); });
    setSounds([]);
    setSelectedId(null);
    setReceipt(null);
    setValidationMsg(null);
    localStorage.removeItem(LS_MARKS_KEY);
  };

  const selectedSound = sounds.find(s => s.id === selectedId) ?? null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono flex flex-col">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-orange-400 font-bold tracking-widest text-sm">DESKLAB</span>
          <span className="text-zinc-600 text-xs">by OHFIFTYB</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="text-orange-400">{sounds.length} files</span>
          <span className="text-yellow-400">🔥 {markedCounts.Fire} fire</span>
          <span className="text-zinc-400">✓ {markedCounts.Keep} keep</span>
          <span className="text-red-400">✗ {markedCounts.Trash} trash</span>
          {sounds.length > 0 && (
            <button onClick={clearAll} className="text-zinc-600 hover:text-red-400 transition-colors ml-2">
              clear all
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <aside className="w-44 border-r border-zinc-800 bg-zinc-900 flex flex-col py-4 gap-1 shrink-0">
          <div className="px-3 pb-2 text-xs text-zinc-600 uppercase tracking-wider">Category</div>
          {(['All', 'Drums', '808s', 'Loops', 'Chops', 'FX', 'Trash', 'Uncategorized'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-left px-3 py-1.5 text-xs rounded mx-2 transition-colors ${
                filterCat === cat
                  ? 'bg-orange-500/20 text-orange-300'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cat}
              {cat !== 'All' && catCounts[cat] ? (
                <span className="ml-1 text-zinc-600">({catCounts[cat]})</span>
              ) : null}
            </button>
          ))}

          <div className="px-3 pt-4 pb-2 text-xs text-zinc-600 uppercase tracking-wider">Mark</div>
          {(['All', 'Fire', 'Keep', 'Mutate', 'Chop', 'Stack', 'Trash', null] as const).map(mark => (
            <button
              key={String(mark)}
              onClick={() => setFilterMark(mark as SoundMark | 'All')}
              className={`text-left px-3 py-1.5 text-xs rounded mx-2 transition-colors ${
                filterMark === mark
                  ? 'bg-orange-500/20 text-orange-300'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {mark === null ? 'Unmarked' : mark || 'All'}
            </button>
          ))}

          <div className="mt-auto px-3 pt-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Shortcuts</div>
            {Object.entries(SHORTCUTS).map(([key, mark]) => (
              <div key={key} className="flex justify-between text-xs text-zinc-600 py-0.5">
                <span className="bg-zinc-800 px-1 rounded">{key}</span>
                <span>{mark}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-zinc-600 py-0.5">
              <span className="bg-zinc-800 px-1 rounded">space</span>
              <span>Play/Stop</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-600 py-0.5">
              <span className="bg-zinc-800 px-1 rounded">↑↓</span>
              <span>Navigate</span>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Tab bar */}
          <div className="border-b border-zinc-800 px-4 flex gap-0 bg-zinc-900">
            {(['library', 'pack', 'export'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab === 'library' ? '01 Library' : tab === 'pack' ? '02 Build Pack' : '03 Export'}
              </button>
            ))}
          </div>

          {/* LIBRARY TAB */}
          {activeTab === 'library' && (
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                {sounds.length === 0 ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed m-4 rounded-lg transition-colors cursor-pointer ${
                      isDragging ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-4xl">📂</div>
                    <div className="text-zinc-400 text-sm text-center">
                      <div className="font-bold text-zinc-200 mb-1">Drop your sounds here</div>
                      <div>WAVs, MP3s, folders, ZIP kits</div>
                      <div className="text-xs text-zinc-600 mt-2">or click to browse</div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      // @ts-ignore — non-standard but widely supported
                      webkitdirectory=""
                      className="hidden"
                      onChange={handleFileInput}
                      accept=".wav,.mp3,.aif,.aiff,.flac,.ogg,.m4a"
                    />
                  </div>
                ) : (
                  <>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`mx-4 mt-3 mb-2 border border-dashed rounded px-3 py-2 text-xs text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-zinc-700 text-zinc-600 hover:border-zinc-600'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {scanning ? '⏳ Scanning...' : '+ Drop more sounds or click to add'}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        // @ts-ignore
                        webkitdirectory=""
                        className="hidden"
                        onChange={handleFileInput}
                        accept=".wav,.mp3,.aif,.aiff,.flac,.ogg,.m4a"
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                      <div className="text-xs text-zinc-600 mb-2">
                        {filteredSounds.length} of {sounds.length} sounds
                      </div>
                      {filteredSounds.map((sound, i) => (
                        <SoundRow
                          key={sound.id}
                          sound={sound}
                          isSelected={sound.id === selectedId}
                          isPlaying={sound.id === selectedId && isPlaying}
                          index={i}
                          onSelect={() => selectSound(sound)}
                          onMark={(mark) => markSound(sound.id, mark)}
                          onCategoryChange={(cat) => setSounds(prev => prev.map(s => s.id === sound.id ? { ...s, category: cat } : s))}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right panel: player + mark */}
              {selectedSound && (
                <div className="w-64 border-l border-zinc-800 bg-zinc-900 flex flex-col p-4 gap-4 shrink-0">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Now Playing</div>
                    <div className="text-sm text-zinc-200 font-bold break-all leading-tight">{selectedSound.name}</div>
                    <div className="text-xs text-zinc-600 mt-1">{(selectedSound.size / 1024).toFixed(1)} KB</div>
                  </div>

                  <div className={`inline-flex px-2 py-0.5 rounded border text-xs w-fit ${CAT_COLORS[selectedSound.category]}`}>
                    {selectedSound.category}
                  </div>

                  <button
                    onClick={() => isPlaying ? stopSound() : playSound(selectedSound)}
                    className="w-full py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    {isPlaying ? '⏹ Stop' : '▶ Play'}
                  </button>

                  <div>
                    <div className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Mark</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Keep', 'Fire', 'Mutate', 'Chop', 'Stack', 'Trash'] as const).map(mark => (
                        <button
                          key={mark}
                          onClick={() => markSound(selectedSound.id, selectedSound.mark === mark ? null : mark)}
                          className={`py-1.5 text-xs rounded transition-colors font-medium ${
                            selectedSound.mark === mark ? MARK_COLORS[mark] : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          {mark}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Reclassify</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Drums', '808s', 'Loops', 'Chops', 'FX', 'Uncategorized'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSounds(prev => prev.map(s => s.id === selectedSound.id ? { ...s, category: cat } : s))}
                          className={`py-1 text-xs rounded transition-colors ${
                            selectedSound.category === cat ? CAT_COLORS[cat] : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto text-xs text-zinc-700 space-y-0.5">
                    <div>[k] Keep  [f] Fire</div>
                    <div>[m] Mutate  [c] Chop</div>
                    <div>[s] Stack  [t] Trash</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PACK BUILDER TAB */}
          {activeTab === 'pack' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-zinc-200 mb-1">Build Pack</h2>
                  <p className="text-xs text-zinc-500">Configure and auto-assemble your sound pack</p>
                </div>

                {/* Validation messages */}
                {validationMsg && (
                  <div className="space-y-2">
                    {validationMsg.errors.map(e => (
                      <div key={e} className="flex gap-2 items-start text-xs bg-red-950/50 border border-red-800 rounded px-3 py-2 text-red-300">
                        <span className="shrink-0">✖</span> {e}
                      </div>
                    ))}
                    {validationMsg.warnings.map(w => (
                      <div key={w} className="flex gap-2 items-start text-xs bg-yellow-950/40 border border-yellow-800 rounded px-3 py-2 text-yellow-300">
                        <span className="shrink-0">⚠</span> {w}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Pack Name</label>
                  <input
                    type="text"
                    value={packName}
                    onChange={e => {
                      setPackName(e.target.value.replace(/\s+/g, '_'));
                      setValidationMsg(null);
                    }}
                    className={`w-full bg-zinc-800 border rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 ${
                      validationMsg?.errors.some(e => e.includes('Pack name')) ? 'border-red-600' : 'border-zinc-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Pack Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Drum Kit', 'Loop Pack', 'One Shot Pack', 'Beat Starter Pack', 'Producer Bundle'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setPackType(type)}
                        className={`py-2 px-3 text-xs rounded border transition-colors text-left ${
                          packType === type
                            ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider mb-3">Pack Contents Preview</div>
                  <PackContentsPreview sounds={sounds} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Total Sounds" value={sounds.length} color="zinc" />
                  <StatCard label="Fire Sounds" value={markedCounts.Fire} color="orange" />
                  <StatCard label="Ready to Export" value={sounds.filter(s => s.mark !== 'Trash').length} color="green" />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={buildAndExport}
                    disabled={sounds.length === 0}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold text-sm rounded transition-colors"
                  >
                    Build Pack + Export ZIP
                  </button>
                  <button
                    onClick={generateReceipt}
                    disabled={sounds.length === 0}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-300 text-sm rounded transition-colors"
                  >
                    Receipt Only
                  </button>
                </div>

                <div className="text-xs text-zinc-600">
                  Output: <span className="text-zinc-400">{packName}/01_Drums/, 02_808s/, 03_Loops/ …</span>
                </div>
              </div>
            </div>
          )}

          {/* EXPORT TAB */}
          {activeTab === 'export' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-zinc-200 mb-1">Export + Ship</h2>
                  <p className="text-xs text-zinc-500">Platform-ready export options and receipt</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ExportButton icon="🎵" label="BeatStars Prep" desc="MP3, WAV, tags" onClick={buildAndExport} disabled={sounds.length === 0} />
                  <ExportButton icon="💰" label="Gumroad Pack" desc="ZIP + license" onClick={buildAndExport} disabled={sounds.length === 0} />
                  <ExportButton icon="⚗️" label="Mutant Stack Lab" desc="Cleaned kit" onClick={buildAndExport} disabled={sounds.length === 0} />
                  <ExportButton icon="✂️" label="ChopZip" desc="Source samples" onClick={buildAndExport} disabled={sounds.length === 0} />
                  <ExportButton
                    icon="🤖"
                    label="Suno Prompt"
                    desc="Genre + mood seed"
                    onClick={() => {
                      const prompt = `OHFIFTYB ${packName.replace(/_/g, ' ')} — dark trap, hard 808s, crisp drums, melodic tension. BPM: 140–150. Key: minor. Mood: cinematic, street, flex.`;
                      navigator.clipboard.writeText(prompt);
                      alert('Suno prompt copied to clipboard!');
                    }}
                    disabled={false}
                  />
                  <ExportButton
                    icon="📤"
                    label="Share Sheet"
                    desc="Sales page text"
                    onClick={() => {
                      const count = sounds.filter(s => s.mark !== 'Trash').length;
                      const text = `🔥 ${packName.replace(/_/g, ' ')} — by OHFIFTYB\n\n${count} sounds. Drums, 808s, loops, chops, FX.\n\nGet it: [link] | @ohfiftyb252`;
                      navigator.clipboard.writeText(text);
                      alert('Sales copy copied to clipboard!');
                    }}
                    disabled={false}
                  />
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Suggested Pricing</div>
                  <div className="space-y-2">
                    {[
                      { offer: 'Starter Pack', price: '$9' },
                      { offer: 'Full Kit', price: '$29' },
                      { offer: 'Producer Bundle', price: '$49' },
                      { offer: 'Custom Pack', price: '$150–$300' },
                    ].map(({ offer, price }) => (
                      <div key={offer} className="flex justify-between text-xs">
                        <span className="text-zinc-400">{offer}</span>
                        <span className="text-orange-400 font-bold">{price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {receipt ? (
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider">Receipt</div>
                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
                          saveAs(blob, `${packName}_receipt.json`);
                        }}
                        className="text-xs text-orange-400 hover:text-orange-300"
                      >
                        Download JSON
                      </button>
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      <ReceiptRow label="Pack" value={receipt.packName} />
                      <ReceiptRow label="Date" value={new Date(receipt.dateCreated).toLocaleString()} />
                      <ReceiptRow label="Files" value={String(receipt.fileCount)} />
                      <ReceiptRow label="Hash" value={receipt.exportHash} />
                      <ReceiptRow label="License" value={receipt.licenseType} />
                      <ReceiptRow label="Tag" value={receipt.ohfiftybTag} />
                      <div className="pt-2 border-t border-zinc-800 text-zinc-600">{receipt.usageNotes}</div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-zinc-800 rounded-lg p-4 text-center text-zinc-600 text-xs">
                    Build a pack first to generate a receipt
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SoundRow({
  sound, isSelected, isPlaying, index, onSelect, onMark, onCategoryChange,
}: {
  sound: SoundFile;
  isSelected: boolean;
  isPlaying: boolean;
  index: number;
  onSelect: () => void;
  onMark: (mark: SoundMark) => void;
  onCategoryChange: (cat: SoundCategory) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer group transition-colors mb-0.5 ${
        isSelected ? 'bg-zinc-800 ring-1 ring-orange-500/40' : 'hover:bg-zinc-800/50'
      }`}
    >
      <span className="text-zinc-700 text-xs w-6 shrink-0">{index + 1}</span>
      <span className="w-4 text-xs shrink-0">
        {isPlaying
          ? <span className="text-orange-400">▶</span>
          : <span className="text-zinc-700 group-hover:text-zinc-500">▷</span>}
      </span>
      <span className="flex-1 text-xs text-zinc-300 truncate">{sound.name}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${CAT_COLORS[sound.category]}`}>
        {sound.category}
      </span>
      {sound.mark && (
        <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 font-medium ${MARK_COLORS[sound.mark]}`}>
          {sound.mark}
        </span>
      )}
    </div>
  );
}

function PackContentsPreview({ sounds }: { sounds: SoundFile[] }) {
  const kept = sounds.filter(s => s.mark !== 'Trash');
  const cats: [string, string][] = [
    ['01_Drums', 'Drums'],
    ['02_808s', '808s'],
    ['03_Loops', 'Loops'],
    ['04_Chops', 'Chops'],
    ['05_FX', 'FX'],
    ['06_Uncategorized', 'Uncategorized'],
  ];

  return (
    <div className="space-y-1 text-xs font-mono">
      <div className="text-zinc-500">
        {kept.length > 0 ? `${kept.length} files ready` : 'No sounds loaded'}
      </div>
      {cats.map(([folder, cat]) => {
        const count = kept.filter(s => s.category === cat).length;
        if (count === 0) return null;
        return (
          <div key={folder} className="flex gap-2 text-zinc-400">
            <span className="text-zinc-600">├─</span>
            <span>{folder}/</span>
            <span className="text-orange-400">{count} files</span>
          </div>
        );
      })}
      <div className="text-zinc-600">├─ 07_License/</div>
      <div className="text-zinc-600">└─ 08_Receipt/</div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    zinc: 'text-zinc-300',
    orange: 'text-orange-400',
    green: 'text-green-400',
  };
  return (
    <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900">
      <div className={`text-2xl font-bold ${colorMap[color] ?? 'text-zinc-300'}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{label}</div>
    </div>
  );
}

function ExportButton({
  icon, label, desc, onClick, disabled,
}: {
  icon: string; label: string; desc: string; onClick: () => void; disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border border-zinc-800 hover:border-zinc-600 disabled:opacity-40 rounded-lg p-3 text-left transition-colors group"
    >
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xs font-bold text-zinc-300 group-hover:text-zinc-100">{label}</div>
      <div className="text-xs text-zinc-600">{desc}</div>
    </button>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-zinc-600 w-16 shrink-0">{label}</span>
      <span className="text-zinc-300 break-all">{value}</span>
    </div>
  );
}
