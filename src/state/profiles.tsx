import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DINOS } from '../dinos/data';
import { scoreFor, type PieceCount, type Stars } from '../game/scoring';

export type PuzzleResult = { score: number; seconds: number; stars: Stars };

export type Profile = {
  id: string;
  name: string;
  createdAt: number;
  /** dinoId → parça sayısı → o parça sayısındaki en iyi sonuç */
  results: Record<string, Partial<Record<PieceCount, PuzzleResult>>>;
};

export type RecordOutcome = PuzzleResult & { isRecord: boolean; hadPrevious: boolean };

const STORAGE_KEY = 'dino-yapboz/profiles/v1';

type ContextValue = {
  ready: boolean;
  profiles: Profile[];
  current: Profile | null;
  login: (name: string) => void;
  selectProfile: (id: string) => void;
  removeProfile: (id: string) => void;
  recordResult: (dinoId: string, pieces: PieceCount, seconds: number) => RecordOutcome;
};

const ProfileContext = createContext<ContextValue | null>(null);

const normalize = (name: string) => name.trim().toLocaleLowerCase('tr-TR');

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setProfiles(JSON.parse(raw) as Profile[]);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles)).catch(() => {});
  }, [profiles, ready]);

  const login = useCallback((rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    const existing = profiles.find((p) => normalize(p.name) === normalize(name));
    if (existing) {
      setCurrentId(existing.id);
      return;
    }
    const profile: Profile = { id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, name, createdAt: Date.now(), results: {} };
    setProfiles((list) => [...list, profile]);
    setCurrentId(profile.id);
  }, [profiles]);

  const removeProfile = useCallback((id: string) => {
    setProfiles((list) => list.filter((p) => p.id !== id));
    setCurrentId((cur) => (cur === id ? null : cur));
  }, []);

  const recordResult = useCallback(
    (dinoId: string, pieces: PieceCount, seconds: number): RecordOutcome => {
      const { score, stars } = scoreFor(pieces, seconds);
      const profile = profiles.find((p) => p.id === currentId);
      const previous = profile?.results[dinoId]?.[pieces];
      const isRecord = !previous || score > previous.score || (score === previous.score && seconds < previous.seconds);
      if (profile && isRecord) {
        const updated: Profile = {
          ...profile,
          results: { ...profile.results, [dinoId]: { ...profile.results[dinoId], [pieces]: { score, seconds, stars } } },
        };
        setProfiles((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      }
      return { score, seconds, stars, isRecord, hadPrevious: !!previous };
    },
    [profiles, currentId],
  );

  const value = useMemo<ContextValue>(
    () => ({
      ready,
      profiles,
      current: profiles.find((p) => p.id === currentId) ?? null,
      login,
      selectProfile: setCurrentId,
      removeProfile,
      recordResult,
    }),
    [ready, profiles, currentId, login, removeProfile, recordResult],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfiles() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfiles must be used inside ProfileProvider');
  return ctx;
}

export const isSolved = (p: Profile | null, dinoId: string) => !!p && Object.keys(p.results[dinoId] ?? {}).length > 0;

/** Puzzle'lar sırayla açılır: ilki her zaman açık, diğerleri bir öncekinin çözülmesiyle. */
export const isUnlocked = (p: Profile | null, index: number) => index === 0 || isSolved(p, DINOS[index - 1]?.id ?? '');

export const totalScore = (p: Profile | null) =>
  !p ? 0 : Object.values(p.results).reduce((sum, byCount) => sum + Object.values(byCount).reduce((s, r) => s + (r?.score ?? 0), 0), 0);

export const bestStars = (p: Profile | null, dinoId: string): number =>
  !p ? 0 : Math.max(0, ...Object.values(p.results[dinoId] ?? {}).map((r) => r?.stars ?? 0));
