import { PlayerProgress, PillPath } from '../types/cyberlab';
import { sound } from './audio';

const STORAGE_KEY = 'cyberlab_game_save_v2';

export const INITIAL_PLAYER_PROGRESS: PlayerProgress = {
  userName: 'Anonymous',
  completedRedLevels: [],
  completedBlueLevels: [],
  unlockedRedLevel: 1,
  unlockedBlueLevel: 1,
  lastPlayedPath: 'RED',
  isSuperuserActive: false,
  settings: {
    soundEnabled: true,
    reducedMotion: false,
    fontSize: 'base'
  }
};

export function loadPlayerProgress(): PlayerProgress {
  if (typeof window === 'undefined') return INITIAL_PLAYER_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      savePlayerProgress(INITIAL_PLAYER_PROGRESS);
      return INITIAL_PLAYER_PROGRESS;
    }
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    if (!parsed || typeof parsed !== 'object') {
      return INITIAL_PLAYER_PROGRESS;
    }

    const state: PlayerProgress = {
      userName: typeof parsed.userName === 'string' && parsed.userName.trim() ? parsed.userName.trim() : 'Anonymous',
      completedRedLevels: Array.isArray(parsed.completedRedLevels) ? parsed.completedRedLevels : [],
      completedBlueLevels: Array.isArray(parsed.completedBlueLevels) ? parsed.completedBlueLevels : [],
      unlockedRedLevel: typeof parsed.unlockedRedLevel === 'number' ? Math.max(1, Math.min(5, parsed.unlockedRedLevel)) : 1,
      unlockedBlueLevel: typeof parsed.unlockedBlueLevel === 'number' ? Math.max(1, Math.min(5, parsed.unlockedBlueLevel)) : 1,
      lastPlayedPath: parsed.lastPlayedPath === 'BLUE' ? 'BLUE' : 'RED',
      isSuperuserActive: parsed.isSuperuserActive === true,
      settings: {
        soundEnabled: parsed.settings?.soundEnabled ?? true,
        reducedMotion: parsed.settings?.reducedMotion ?? false,
        fontSize: parsed.settings?.fontSize ?? 'base'
      }
    };

    if (state.settings) {
      sound.setEnabled(state.settings.soundEnabled);
    }

    return state;
  } catch (err) {
    console.error('Failed to load Cyber Lab progress from localStorage:', err);
    return INITIAL_PLAYER_PROGRESS;
  }
}

export function savePlayerProgress(state: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist player progress:', err);
  }
}

export function resetPlayerProgress(): PlayerProgress {
  if (typeof window === 'undefined') return INITIAL_PLAYER_PROGRESS;
  try {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = { ...INITIAL_PLAYER_PROGRESS };
    savePlayerProgress(fresh);
    return fresh;
  } catch {
    return INITIAL_PLAYER_PROGRESS;
  }
}

export function markMissionCompleted(
  currentState: PlayerProgress,
  missionId: string,
  path: PillPath,
  level: number
): { newState: PlayerProgress; nextLevelUnlocked: number; isNewlyCompleted: boolean } {
  let isNewlyCompleted = false;
  let nextLevelUnlocked = level;

  // Single guard check: If Superuser mode is active, treat as temporary testing sandbox
  // Run victory debrief/animations, but skip updating saved progress in localStorage.
  if (currentState.isSuperuserActive) {
    return {
      newState: currentState,
      nextLevelUnlocked: level < 5 ? level + 1 : level,
      isNewlyCompleted: true
    };
  }

  const completedList = path === 'RED' ? [...currentState.completedRedLevels] : [...currentState.completedBlueLevels];
  if (!completedList.includes(missionId)) {
    completedList.push(missionId);
    isNewlyCompleted = true;
  }

  let unlockedRed = currentState.unlockedRedLevel;
  let unlockedBlue = currentState.unlockedBlueLevel;

  if (path === 'RED') {
    if (level >= unlockedRed && level < 5) {
      unlockedRed = level + 1;
      nextLevelUnlocked = unlockedRed;
    }
  } else {
    if (level >= unlockedBlue && level < 5) {
      unlockedBlue = level + 1;
      nextLevelUnlocked = unlockedBlue;
    }
  }

  const newState: PlayerProgress = {
    ...currentState,
    completedRedLevels: path === 'RED' ? completedList : currentState.completedRedLevels,
    completedBlueLevels: path === 'BLUE' ? completedList : currentState.completedBlueLevels,
    unlockedRedLevel: unlockedRed,
    unlockedBlueLevel: unlockedBlue,
    lastPlayedPath: path
  };

  savePlayerProgress(newState);

  return {
    newState,
    nextLevelUnlocked,
    isNewlyCompleted
  };
}
