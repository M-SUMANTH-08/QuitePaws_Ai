/**
 * QuietPaws — Vision Engine
 * Wraps TensorFlow.js COCO-SSD for real-time dog detection.
 */

import { CONFIG } from './config.js';

export class VisionEngine {
  constructor() {
    this.model = null;
    this.lastInferenceMs = 0;
  }

  /**
   * Wait for the global cocoSsd from the CDN script.
   */
  async waitForLibrary() {
    if (window.cocoSsd) return;
    await new Promise((resolve) => {
      const check = () => (window.cocoSsd ? resolve() : setTimeout(check, 50));
      check();
    });
  }

  /**
   * Load the model. Idempotent — safe to call multiple times.
   */
  async load() {
    if (this.model) return this.model;

    await this.waitForLibrary();

    // Lite MobileNet V2 — fast and small (~27MB), perfect for browsers
    this.model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
    return this.model;
  }

  /**
   * Run detection on a video element. Returns array of dog detections.
   * @param {HTMLVideoElement} video
   * @returns {Promise<{dogs: Array, topConfidence: number, inferenceMs: number}>}
   */
  async detect(video) {
    if (!this.model) return { dogs: [], topConfidence: 0, inferenceMs: 0 };

    const t0 = performance.now();
    const predictions = await this.model.detect(video);
    const dogs = predictions
      .filter((p) => p.class === CONFIG.DOG_CLASS && p.score >= CONFIG.DETECTION_THRESHOLD)
      .map((d) => ({
        bbox: d.bbox, // [x, y, width, height]
        score: d.score,
      }));

    const topConfidence = dogs.length > 0
      ? Math.max(...dogs.map((d) => d.score))
      : 0;

    this.lastInferenceMs = performance.now() - t0;

    return { dogs, topConfidence, inferenceMs: this.lastInferenceMs };
  }

  /**
   * Draw bounding boxes onto a canvas.
   */
  drawTo(canvas, dogs) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (dogs.length === 0) return;

    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 4;
    ctx.font = 'bold 18px monospace';

    for (const d of dogs) {
      const [x, y, w, h] = d.bbox;
      ctx.strokeRect(x, y, w, h);

      const label = `dog ${Math.round(d.score * 100)}%`;
      const textW = ctx.measureText(label).width;

      ctx.fillStyle = '#EF4444';
      ctx.fillRect(x, y - 28, textW + 16, 24);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, x + 8, y - 10);
    }
  }
}
