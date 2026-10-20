/**
 * QuietPaws — Vision Engine
 * Wraps TensorFlow.js COCO-SSD for real-time dog detection.
 */

import { CONFIG } from './config.js';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class VisionEngine {
  constructor() {
    this.model = null;
    this.lastInferenceMs = 0;
  }

  async load() {
    if (this.model) return this.model;

    // Hard runtime guards
    if (!tf) {
      throw new Error("TensorFlow.js failed to initialize");
    }
    if (!cocoSsd) {
      throw new Error("COCO-SSD failed to initialize");
    }

    // Initialize backend
    await tf.ready();
    const backend = tf.getBackend();
    if (!backend) {
      console.warn("No TF backend found, attempting to set CPU backend");
      await tf.setBackend('cpu');
    }

    // Lite MobileNet V2 — fast and small (~27MB), perfect for browsers
    this.model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
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
