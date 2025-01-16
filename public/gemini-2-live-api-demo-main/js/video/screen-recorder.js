import { Logger } from '../utils/logger.js';
import { ApplicationError, ErrorCodes } from '../utils/error-boundary.js';

/**
 * @fileoverview Implements a screen recorder for capturing and processing screen frames.
 * It supports previewing the screen capture and sending frames to a callback function.
 */
export class ScreenRecorder {
    /**
     * Creates a new ScreenRecorder instance.
     * @param {Object} [options] - Configuration options for the recorder.
     * @param {number} [options.fps=5] - Frames per second for screen capture.
     * @param {number} [options.quality=0.8] - JPEG quality for captured frames (0.0 - 1.0).
     * @param {number} [options.width=1280] - Width of the captured video.
     * @param {number} [options.height=720] - Height of the captured video.
     * @param {number} [options.maxFrameSize=204800] - Maximum size of a frame in bytes (200KB).
     */
    constructor(options = {}) {
        this.stream = null;
        this.isRecording = false;
        this.onScreenData = null;
        this.frameCanvas = document.createElement('canvas');
        this.frameCtx = this.frameCanvas.getContext('2d');
        this.captureInterval = null;
        this.previewElement = null;
        this.options = {
            fps: 5, // Lower FPS for screen sharing
            quality: 0.8,
            width: 1280,
            height: 720,
            maxFrameSize: 200 * 1024, // 200KB max per frame
            ...options
        };
        this.frameCount = 0;
        
        // Motion detection properties
        this.lastFrameData = null;
        this.lastSignificantFrame = null;
        this.MOTION_THRESHOLD = 5; // Lower threshold for screen changes
        this.FORCE_FRAME_INTERVAL = 15; // Send frame every N frames regardless of motion
    }

    /**
     * Starts screen recording.
     * @param {HTMLVideoElement} previewElement - The video element to display the screen preview.
     * @param {Function} onScreenData - Callback function to receive screen frame data.
     * @throws {ApplicationError} Throws an error if screen sharing permission is denied or if the screen recording fails to start.
     */
    async start(previewElement, onScreenData) {
        try {
            this.onScreenData = onScreenData;
            this.previewElement = previewElement;

            // Request screen sharing access with audio
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: this.options.width },
                    height: { ideal: this.options.height },
                    frameRate: { ideal: this.options.fps }
                },
                audio: false // Set to true if you want to capture audio as well
            });

            // Set up preview
            if (this.previewElement) {
                this.previewElement.srcObject = this.stream;
                await new Promise((resolve) => {
                    this.previewElement.onloadedmetadata = () => {
                        this.previewElement.play()
                            .then(resolve)
                            .catch(error => {
                                Logger.error('Failed to play preview:', error);
                                resolve();
                            });
                    };
                });

                // Set canvas size based on video dimensions
                this.frameCanvas.width = this.previewElement.videoWidth;
                this.frameCanvas.height = this.previewElement.videoHeight;
            }

            // Start frame capture loop
            this.isRecording = true;
            this.startFrameCapture();

            // Handle stream stop
            this.stream.getVideoTracks()[0].addEventListener('ended', () => {
                this.stop();
            });

            Logger.info('Screen recording started');

        } catch (error) {
            if (error.name === 'NotAllowedError') {
                throw new ApplicationError(
                    'Screen sharing permission denied',
                    ErrorCodes.SCREEN_PERMISSION_DENIED,
                    { originalError: error }
                );
            }
            throw new ApplicationError(
                'Failed to start screen recording',
                ErrorCodes.SCREEN_START_FAILED,
                { originalError: error }
            );
        }
    }

    /**
     * Starts the frame capture loop.
     * @private
     */
    startFrameCapture() {
        const frameInterval = 1000 / this.options.fps;

        this.captureInterval = setInterval(() => {
            if (!this.isRecording || !this.previewElement || !this.onScreenData) return;

            try {
                // Ensure video is playing and ready
                if (this.previewElement.readyState >= this.previewElement.HAVE_CURRENT_DATA) {
                    // Update canvas size if needed
                    if (this.frameCanvas.width !== this.previewElement.videoWidth) {
                        this.frameCanvas.width = this.previewElement.videoWidth;
                        this.frameCanvas.height = this.previewElement.videoHeight;
                    }

                    // Draw current video frame to canvas
                    this.frameCtx.drawImage(
                        this.previewElement,
                        0, 0,
                        this.frameCanvas.width,
                        this.frameCanvas.height
                    );

                    // Get current frame data for motion detection
                    const currentFrameData = this.frameCtx.getImageData(
                        0, 0,
                        this.frameCanvas.width,
                        this.frameCanvas.height
                    ).data;

                    let shouldSendFrame = false;

                    // Check for motion if we have a previous frame
                    if (this.lastFrameData) {
                        const motionScore = this.detectMotion(this.lastFrameData, currentFrameData);
                        shouldSendFrame = motionScore > this.MOTION_THRESHOLD ||
                                       this.frameCount % this.FORCE_FRAME_INTERVAL === 0;

                        if (!shouldSendFrame) {
                            Logger.debug(`Skipping screen frame - low motion (score: ${motionScore.toFixed(2)})`);
                            this.frameCount++;
                            return;
                        }
                    } else {
                        // Always send first frame
                        shouldSendFrame = true;
                    }

                    if (shouldSendFrame) {
                        // Convert to JPEG with quality setting
                        const jpegData = this.frameCanvas.toDataURL('image/jpeg', this.options.quality);
                        const base64Data = jpegData.split(',')[1];

                        if (this.validateFrame(base64Data)) {
                            this.frameCount++;
                            Logger.debug(`Screen frame #${this.frameCount} captured (motion detected)`);
                            this.onScreenData(base64Data);
                            this.lastFrameData = currentFrameData;
                        }
                    }
                }
            } catch (error) {
                Logger.error('Screen frame capture error:', error);
            }
        }, frameInterval);

        Logger.info(`Screen capture started at ${this.options.fps} FPS with motion detection`);
    }

    /**
     * Stops screen recording.
     * @throws {ApplicationError} Throws an error if the screen recording fails to stop.
     */
    stop() {
        try {
            this.isRecording = false;

            if (this.captureInterval) {
                clearInterval(this.captureInterval);
                this.captureInterval = null;
            }

            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }

            if (this.previewElement) {
                this.previewElement.srcObject = null;
                this.previewElement = null;
            }

            // Clear motion detection state
            this.lastFrameData = null;
            this.lastSignificantFrame = null;
            this.frameCount = 0;

            Logger.info('Screen recording stopped');

        } catch (error) {
            Logger.error('Failed to stop screen recording:', error);
            throw new ApplicationError(
                'Failed to stop screen recording',
                ErrorCodes.SCREEN_STOP_FAILED,
                { originalError: error }
            );
        }
    }

    /**
     * Validates a captured frame.
     * @param {string} base64Data - Base64 encoded frame data.
     * @returns {boolean} True if the frame is valid, false otherwise.
     * @private
     */
    validateFrame(base64Data) {
        if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            Logger.error('Invalid screen frame base64 data');
            return false;
        }

        if (base64Data.length < 1024) {
            Logger.error('Screen frame too small');
            return false;
        }

        return true;
    }

    /**
     * Checks if screen sharing is supported by the browser.
     * @returns {boolean} True if screen sharing is supported, false otherwise.
     * @throws {ApplicationError} Throws an error if screen sharing is not supported.
     * @static
     */
    static checkBrowserSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new ApplicationError(
                'Screen sharing is not supported in this browser',
                ErrorCodes.SCREEN_NOT_SUPPORTED
            );
        }
        return true;
    }

    /**
     * Detects motion between two frames.
     * @param {Uint8ClampedArray} prevFrame - The previous frame data.
     * @param {Uint8ClampedArray} currentFrame - The current frame data.
     * @returns {number} The motion score between the two frames.
     * @private
     */
    detectMotion(prevFrame, currentFrame) {
        let diff = 0;
        const pixelsToCheck = prevFrame.length / 4;
        const skipPixels = 4; // Skip more pixels for performance since screens have more pixels

        for (let i = 0; i < prevFrame.length; i += 4 * skipPixels) {
            const rDiff = Math.abs(prevFrame[i] - currentFrame[i]);
            const gDiff = Math.abs(prevFrame[i + 1] - currentFrame[i + 1]);
            const bDiff = Math.abs(prevFrame[i + 2] - currentFrame[i + 2]);
            diff += (rDiff + gDiff + bDiff) / 3;
        }

        return diff / (pixelsToCheck / skipPixels);
    }
}