/** QuietPaws — Browser Prototype Configuration */
export const CONFIG = {
  MODEL_NAME: 'coco-ssd',
  DETECTION_THRESHOLD: 0.45,
  DOG_CLASS: 'dog',
  FFT_SIZE: 2048,
  AUDIO_LOOP_INTERVAL_MS: 100,
  AUDIO_MIN_RMS: 0.02,
  AUDIO_CONSENSUS_MIN_SAMPLES: 2,
  VISION_CONSENSUS_MIN_FRAMES: 3,
  VISION_CONSENSUS_WINDOW: 5,
  FUSION_WINDOW_MS: 3000,
  OBSERVE_WINDOW_MS: 2600,
  INTERVENTION_COOLDOWN_MS: 5000,
  THRESHOLD_GROWL: 0.35,
  THRESHOLD_BARK_STRONG: 0.55,
  THRESHOLD_BARK: 0.40,
  THRESHOLD_WHIMPER: 0.30,
  THRESHOLD_DOG_VOCAL: 0.50,
  VOICE_CUE_TEXT: 'Bruno, bed.',
  ALTERNATE_CUE_TEXT: 'Bruno, stay there.',
  VOICE_CUE_RATE: 1.0,
  VOICE_CUE_PITCH: 1.0,
  VIBRATION_PATTERN: [70, 45, 70],
  LOG_STORAGE_KEY: 'quietpaws_session_log_v2',
  LOG_MAX_ENTRIES: 30,
  LOG_DISPLAY_COUNT: 8,
  WAVEFORM_BARS: 44,
  // Workspace is a normalized rectangle. Adjust from the UI if needed.
  WORKSPACE: { x: 0.58, y: 0.18, w: 0.34, h: 0.58 },
  APPROACH_AREA_RATIO: 1.12,
  PROXIMITY_HOLD_MS: 1200,
};

export const STATE = {
  NO_DOG: 'NO_DOG',
  CALM: 'CALM',
  ATTENTION_SEEKING: 'ATTENTION_SEEKING',
  ACTIVE_PLAYFUL: 'ACTIVE_PLAYFUL',
  HIGH_AROUSAL: 'HIGH_AROUSAL',
  UNCERTAIN: 'UNCERTAIN',
};

export const STATE_DISPLAY = {
  [STATE.NO_DOG]: { cls: 'no-dog', text: 'NO DOG', color: '#6B7280' },
  [STATE.CALM]: { cls: 'calm', text: 'CALM', color: '#10B981' },
  [STATE.ATTENTION_SEEKING]: { cls: 'attention', text: 'ATTENTION-SEEKING', color: '#F59E0B' },
  [STATE.ACTIVE_PLAYFUL]: { cls: 'playful', text: 'ACTIVE PLAYFUL', color: '#3B82F6' },
  [STATE.HIGH_AROUSAL]: { cls: 'arousal', text: 'HIGH AROUSAL', color: '#EF4444' },
  [STATE.UNCERTAIN]: { cls: 'uncertain', text: 'UNCERTAIN', color: '#A855F7' },
};
