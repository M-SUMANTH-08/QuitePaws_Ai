# Stack Research

**Domain:** Offline-first, on-device AI for pet interruption prevention (native Android)
**Researched:** 2026-10-05
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Kotlin | 1.9+ | Primary language | Industry standard for Android development; seamless coroutine support for asynchronous ML tasks. |
| Jetpack Compose | 1.6+ | UI Framework | Declarative UI makes it easier to react to rapid ML state changes (e.g., bounding boxes, audio states). |
| MediaPipe Tasks Vision | latest | Object Detection | Provides high-level `ObjectDetector` API for EfficientDet-Lite0. Simplifies camera frame processing and GPU acceleration. |
| MediaPipe Tasks Audio | latest | Audio Classification | Provides high-level `AudioClassifier` API for YAMNet. Handles 16kHz resampling, buffering, and streaming audio natively. |
| LiteRT (formerly TFLite) | 2.2.0 | Core Inference Engine | The standard for on-device inference (`com.google.ai.edge.litert:litert`). Operates fully offline without Play Services dependencies. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CameraX | 1.3+ | Camera API | Essential for extracting image frames via `ImageAnalysis` to feed into MediaPipe Tasks Vision. |
| Qualcomm QNN Delegate | 2.34+ | Hardware Acceleration | Use specifically to verify NPU capabilities on the target iQOO 15 (Snapdragon 8 Elite). |
| Kotlin Coroutines/Flow | 1.7+ | State Management | For aggregating audio and vision streams into a "behavioral state" machine. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Android Studio | Koala+ | Recommended IDE for modern Android Compose and ML development. |
| Qualcomm AI Hub | Model Optimization | Use to pre-compile and quantize models (EfficientDet/YAMNet) specifically for the iQOO 15 NPU if the QNN delegate is used. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| MediaPipe Tasks | Raw LiteRT C++ / Java API | Use if custom preprocessing is required that MediaPipe's turnkey solutions do not support, or if strictly forcing NPU across all operations. |
| EfficientDet-Lite0 | MobileNetV2 SSD | Use if EfficientDet-Lite0 proves too slow or memory-intensive on older devices (e.g., POCO X6 Pro testing fallback). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Android NNAPI | Deprecated in Android 15+. It will not efficiently leverage the Snapdragon 8 Elite NPU on the iQOO 15. | LiteRT with Qualcomm QNN Delegate. |
| ExecuTorch | Highly optimized for PyTorch LLMs, but lacks the mature, out-of-the-box Audio/Vision pipelines (YAMNet/EfficientDet) that MediaPipe provides for hackathons. | MediaPipe Tasks or LiteRT. |
| Cloud AI APIs | Violates the strict offline-first, privacy-preserving core value of the product. Adds latency. | On-device models (LiteRT/MediaPipe). |
| MediaPipe Pose | Animal pose estimation is explicitly out of scope for the core demo and adds unnecessary overhead. | Simple bounding box heuristics (EfficientDet). |

## Stack Patterns by Variant

**If testing NPU on iQOO 15:**
- Use `com.qualcomm.qti:qnn-litert-delegate` with raw LiteRT.
- Because MediaPipe Tasks abstracts away low-level delegate control, and NNAPI is deprecated.

**If building the core behavioral logic:**
- Use `StateFlow` to combine `YAMNet` confidence scores + `EfficientDet` bounding box changes.
- Because the system needs a multimodal state machine (NO_DOG, CALM, ATTENTION_SEEKING) based on simultaneous visual and auditory cues without heavy pose estimation.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `com.google.ai.edge.litert` | MediaPipe Tasks | Ensure you don't mix old `org.tensorflow:tensorflow-lite` dependencies with the new `litert` namespace to avoid dex collisions. |
| CameraX `ImageAnalysis` | MediaPipe `Image` | CameraX produces `ImageProxy` which needs efficient conversion to MediaPipe's `MPImage` format for Vision tasks. |

## Sources

- **Google AI Edge Docs** — Verified MediaPipe Tasks Audio/Vision capabilities and migration to LiteRT.
- **Qualcomm Documentation** — Verified deprecation of NNAPI and transition to QNN Delegate for modern Snapdragon NPUs.
- **Project Context** — PROJECT.md boundaries (Offline-first, iQOO 15 hardware target, out-of-scope technologies).

---
*Stack research for: Offline-first, on-device AI for pet interruption prevention (native Android)*
*Researched: 2026-10-05*
