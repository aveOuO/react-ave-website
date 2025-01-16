import { MultimodalLiveClient } from './core/websocket-client.js'
import { AudioStreamer } from './audio/audio-streamer.js'
import { AudioRecorder } from './audio/audio-recorder.js'
import { HELLO_OBJ } from './config/hello.js'
import { Logger } from './utils/logger.js'
import { VideoManager } from './video/video-manager.js'
import { ScreenRecorder } from './video/screen-recorder.js'

/**
 * @fileoverview Main entry point for the application.
 * Initializes and manages the UI, audio, video, and WebSocket interactions.
 */

// DOM Elements
const logsContainer = document.getElementById('logs-container')
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-button')
const micButton = document.getElementById('mic-button')
const micIcon = document.getElementById('mic-icon')
const audioVisualizer = document.getElementById('audio-visualizer')
const connectButton = document.getElementById('connect-button')
const cameraButton = document.getElementById('camera-button')
const cameraIcon = document.getElementById('camera-icon')
const stopVideoButton = document.getElementById('stop-video')
const screenButton = document.getElementById('screen-button')
const screenIcon = document.getElementById('screen-icon')
const screenContainer = document.getElementById('screen-container')
const screenPreview = document.getElementById('screen-preview')
const inputAudioVisualizer = document.getElementById('input-audio-visualizer')
const voiceSelect = document.getElementById('voice-select')
const sampleRateInput = document.getElementById('sample-rate-input')
const systemInstructionInput = document.getElementById('system-instruction')
const applyConfigButton = document.getElementById('apply-config')
const configToggle = document.getElementById('config-toggle')
const toggleLogs = document.getElementById('toggle-logs')
const logsWrapper = document.querySelector('.logs-wrapper')
const configContainer = document.getElementById('config-container')

// Theme switcher
const themeToggle = document.getElementById('theme-toggle')
const root = document.documentElement
// Set initial theme from localStorage or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark'
root.setAttribute('data-theme', savedTheme)
themeToggle.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode'
themeToggle.addEventListener('click', () => {
  const currentTheme = root.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  root.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  themeToggle.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode'
})

// State variables
let isRecording = false
let audioStreamer = null
let audioCtx = null
let isConnected = false
let audioRecorder = null
let isVideoActive = false
let videoManager = null
let isScreenSharing = false
let screenRecorder = null
let isUsingTool = false

// Multimodal Client
const client = new MultimodalLiveClient({
  apiKey: HELLO_OBJ.API.KEY + HELLO_OBJ.API.EXTRA_KEY + HELLO_OBJ.API.MORE_KEY
})

// Initialize configuration values
voiceSelect.value = HELLO_OBJ.VOICE.NAME
sampleRateInput.value = HELLO_OBJ.AUDIO.OUTPUT_SAMPLE_RATE
systemInstructionInput.value = HELLO_OBJ.SYSTEM_INSTRUCTION.TEXT

// Configuration presets
const CONFIG_PRESETS = {
  friendly: {
    voice: 'Aoede',
    sampleRate: 27000,
    systemInstruction:
      'You are a friendly and warm AI assistant. Use a casual, approachable tone and be encouraging. Feel free to express enthusiasm when helping users.'
  },
  professional: {
    voice: 'Charon',
    sampleRate: 24000,
    systemInstruction:
      'You are a professional AI expert. Maintain a formal tone, be precise and thorough in your explanations. Focus on accuracy and clarity in all interactions.'
  },
  tired: {
    voice: 'Aoede',
    sampleRate: 16000, // Voice is very tired and low pitch
    systemInstruction:
      'You are very tired, exhausted, boring man. You are tired working on your very hard, low pay work. So your first response should be something very lazy, like "Hello... whats up???", or "what is it now, huh?... please, can I go sleep already???", etc. (not exactly as those, but keeping the tone of a tired person) If someone asks you if you are tired, say yes and tell a story how bad and tiring you day was. (It should be something creative, not just "coffee machine" cliche. Always say something creative) Then, if the user feels sorry, continue rambling about your life, how unfair it is, how you want to leave your country, etc. If the user asks you to do something, then pretend to be very lazy and not wanting to do that, asking like "do you really need that now? I am so tired", "Is this urgent, maybe we just drink a tea?" (not exactly as those but keeping the tone of a tired man". If the user confirms that it is needed, then do the task in a very unwanted tone, like "Fiiine!!! I will do it" or similar. Keep the tone and be in role.'
  }
}

/**
 * Updates the configuration and reconnects if connected
 */
async function updateConfiguration() {
  const newVoice = voiceSelect.value
  const newSampleRate = parseInt(sampleRateInput.value)
  const newInstruction = systemInstructionInput.value.trim()

  // Validate sample rate
  if (isNaN(newSampleRate) || newSampleRate < 1000 || newSampleRate > 48000) {
    logMessage('Invalid sample rate. Must be between 1000 and 48000 Hz.', 'system')
    return
  }

  // Update configuration
  HELLO_OBJ.VOICE.NAME = newVoice
  HELLO_OBJ.AUDIO.OUTPUT_SAMPLE_RATE = newSampleRate
  HELLO_OBJ.SYSTEM_INSTRUCTION.TEXT = newInstruction

  // Save to localStorage
  localStorage.setItem('gemini_voice', newVoice)
  localStorage.setItem('gemini_output_sample_rate', newSampleRate.toString())
  localStorage.setItem('gemini_system_instruction', newInstruction)

  // If we have an active audio streamer, stop it
  if (audioStreamer) {
    audioStreamer.stop()
    audioStreamer = null
  }

  // If connected, reconnect to apply changes
  if (isConnected) {
    logMessage('Reconnecting to apply configuration changes...', 'system')
    await disconnectFromWebsocket()
    await connectToWebsocket()
  }

  logMessage('Configuration updated successfully', 'system')

  // Close the config panel on mobile after applying settings
  if (window.innerWidth <= 768) {
    configContainer.classList.remove('active')
    configToggle.classList.remove('active')
  }
}

// Load saved configuration if exists
if (localStorage.getItem('gemini_voice')) {
  HELLO_OBJ.VOICE.NAME = localStorage.getItem('gemini_voice')
  voiceSelect.value = HELLO_OBJ.VOICE.NAME
}

if (localStorage.getItem('gemini_output_sample_rate')) {
  HELLO_OBJ.AUDIO.OUTPUT_SAMPLE_RATE = parseInt(localStorage.getItem('gemini_output_sample_rate'))
  sampleRateInput.value = HELLO_OBJ.AUDIO.OUTPUT_SAMPLE_RATE
}

if (localStorage.getItem('gemini_system_instruction')) {
  HELLO_OBJ.SYSTEM_INSTRUCTION.TEXT = localStorage.getItem('gemini_system_instruction')
  systemInstructionInput.value = HELLO_OBJ.SYSTEM_INSTRUCTION.TEXT
}

// Add event listener for configuration changes
applyConfigButton.addEventListener('click', updateConfiguration)

// Handle configuration panel toggle
configToggle.addEventListener('click', () => {
  configContainer.classList.toggle('active')
  configToggle.classList.toggle('active')
})

// Close config panel when clicking outside (for desktop)
document.addEventListener('click', (event) => {
  if (!configContainer.contains(event.target) && !configToggle.contains(event.target) && window.innerWidth > 768) {
    configContainer.classList.remove('active')
    configToggle.classList.remove('active')
  }
})

// Prevent clicks inside config panel from closing it
configContainer.addEventListener('click', (event) => {
  event.stopPropagation()
})

// Close config panel on escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    configContainer.classList.remove('active')
    configToggle.classList.remove('active')
  }
})

// Handle logs collapse/expand
toggleLogs.addEventListener('click', () => {
  logsWrapper.classList.toggle('collapsed')
  toggleLogs.textContent = logsWrapper.classList.contains('collapsed') ? 'expand_more' : 'expand_less'
})

// Collapse logs by default on mobile
function handleMobileView() {
  if (window.innerWidth <= 768) {
    logsWrapper.classList.add('collapsed')
    toggleLogs.textContent = 'expand_more'
  } else {
    logsWrapper.classList.remove('collapsed')
    toggleLogs.textContent = 'expand_less'
  }
}

// Listen for window resize
window.addEventListener('resize', handleMobileView)

// Initial check
handleMobileView()

// Handle preset button clicks
document.querySelectorAll('.preset-button').forEach((button) => {
  button.addEventListener('click', () => {
    const preset = CONFIG_PRESETS[button.dataset.preset]
    if (preset) {
      voiceSelect.value = preset.voice
      sampleRateInput.value = preset.sampleRate
      systemInstructionInput.value = preset.systemInstruction

      // Apply the configuration immediately
      updateConfiguration()

      // Visual feedback
      button.style.backgroundColor = 'var(--primary-color)'
      button.style.color = 'white'
      setTimeout(() => {
        button.style.backgroundColor = ''
        button.style.color = ''
      }, 200)
    }
  })
})

/**
 * Logs a message to the UI.
 * @param {string} message - The message to log.
 * @param {string} [type='system'] - The type of the message (system, user, ai).
 */
function logMessage(message, type = 'system') {
  const logEntry = document.createElement('div')
  logEntry.classList.add('log-entry', type)

  const timestamp = document.createElement('span')
  timestamp.classList.add('timestamp')
  timestamp.textContent = new Date().toLocaleTimeString()
  logEntry.appendChild(timestamp)

  const emoji = document.createElement('span')
  emoji.classList.add('emoji')
  switch (type) {
    case 'system':
      emoji.textContent = '⚙️'
      break
    case 'user':
      emoji.textContent = '🫵'
      break
    case 'ai':
      emoji.textContent = '🤖'
      break
  }
  logEntry.appendChild(emoji)

  const messageText = document.createElement('span')
  messageText.textContent = message
  logEntry.appendChild(messageText)

  logsContainer.appendChild(logEntry)
  logsContainer.scrollTop = logsContainer.scrollHeight
}

/**
 * Updates the microphone icon based on the recording state.
 */
function updateMicIcon() {
  micIcon.textContent = isRecording ? 'mic_off' : 'mic'
  micButton.style.backgroundColor = isRecording ? '#ea4335' : '#4285f4'
}

/**
 * Updates the audio visualizer based on the audio volume.
 * @param {number} volume - The audio volume (0.0 to 1.0).
 * @param {boolean} [isInput=false] - Whether the visualizer is for input audio.
 */
function updateAudioVisualizer(volume, isInput = false) {
  const visualizer = isInput ? inputAudioVisualizer : audioVisualizer
  const audioBar = visualizer.querySelector('.audio-bar') || document.createElement('div')

  if (!visualizer.contains(audioBar)) {
    audioBar.classList.add('audio-bar')
    visualizer.appendChild(audioBar)
  }

  audioBar.style.width = `${volume * 100}%`
  if (volume > 0) {
    audioBar.classList.add('active')
  } else {
    audioBar.classList.remove('active')
  }
}

/**
 * Initializes the audio context and streamer if not already initialized.
 * @returns {Promise<AudioStreamer>} The audio streamer instance.
 */
async function ensureAudioInitialized() {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (!audioStreamer) {
    audioStreamer = new AudioStreamer(audioCtx)
    audioStreamer.sampleRate = HELLO_OBJ.AUDIO.OUTPUT_SAMPLE_RATE
    await audioStreamer.initialize()
  }
  return audioStreamer
}

/**
 * Handles the microphone toggle. Starts or stops audio recording.
 * @returns {Promise<void>}
 */
async function handleMicToggle() {
  if (!isRecording) {
    try {
      await ensureAudioInitialized()
      audioRecorder = new AudioRecorder()

      const inputAnalyser = audioCtx.createAnalyser()
      inputAnalyser.fftSize = 256
      const inputDataArray = new Uint8Array(inputAnalyser.frequencyBinCount)

      await audioRecorder.start((base64Data) => {
        if (isUsingTool) {
          client.sendRealtimeInput([
            {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Data,
              interrupt: true // Model isn't interruptable when using tools, so we do it manually
            }
          ])
        } else {
          client.sendRealtimeInput([
            {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Data
            }
          ])
        }

        inputAnalyser.getByteFrequencyData(inputDataArray)
        const inputVolume = Math.max(...inputDataArray) / 255
        updateAudioVisualizer(inputVolume, true)
      })

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(inputAnalyser)

      await audioStreamer.resume()
      isRecording = true
      Logger.info('Microphone started')
      logMessage('Microphone started', 'system')
      updateMicIcon()
    } catch (error) {
      Logger.error('Microphone error:', error)
      logMessage(`Error: ${error.message}`, 'system')
      isRecording = false
      updateMicIcon()
    }
  } else {
    if (audioRecorder && isRecording) {
      audioRecorder.stop()
    }
    isRecording = false
    logMessage('Microphone stopped', 'system')
    updateMicIcon()
    updateAudioVisualizer(0, true)
  }
}

/**
 * Resumes the audio context if it's suspended.
 * @returns {Promise<void>}
 */
async function resumeAudioContext() {
  if (audioCtx && audioCtx.state === 'suspended') {
    await audioCtx.resume()
  }
}

/**
 * Connects to the WebSocket server.
 * @returns {Promise<void>}
 */
async function connectToWebsocket() {
  const config = {
    model: HELLO_OBJ.API.MODEL_NAME,
    generationConfig: {
      responseModalities: 'audio',
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: HELLO_OBJ.VOICE.NAME // You can change voice in the config.js file
          }
        }
      }
    },
    systemInstruction: {
      parts: [
        {
          text: HELLO_OBJ.SYSTEM_INSTRUCTION.TEXT // You can change system instruction in the config.js file
        }
      ]
    }
  }

  try {
    await client.connect(config)
    isConnected = true
    connectButton.textContent = 'Disconnect'
    connectButton.classList.add('connected')
    messageInput.disabled = false
    sendButton.disabled = false
    micButton.disabled = false
    cameraButton.disabled = false
    screenButton.disabled = false
    logMessage('Connected to Gemini 2.0 Flash Multimodal Live API', 'system')

    // Add click handler to initialize audio on first interaction
    const initAudioHandler = async () => {
      try {
        await ensureAudioInitialized()
        document.removeEventListener('click', initAudioHandler)
      } catch (error) {
        Logger.error('Audio initialization error:', error)
      }
    }
    document.addEventListener('click', initAudioHandler)
    logMessage('Audio initialized', 'system')
  } catch (error) {
    const errorMessage = error.message || 'Unknown error'
    Logger.error('Connection error:', error)
    logMessage(`Connection error: ${errorMessage}`, 'system')
    isConnected = false
    connectButton.textContent = 'Connect'
    connectButton.classList.remove('connected')
    messageInput.disabled = true
    sendButton.disabled = true
    micButton.disabled = true
    cameraButton.disabled = true
    screenButton.disabled = true
  }
}

/**
 * Disconnects from the WebSocket server.
 */
function disconnectFromWebsocket() {
  client.disconnect()
  isConnected = false
  if (audioStreamer) {
    audioStreamer.stop()
    if (audioRecorder) {
      audioRecorder.stop()
      audioRecorder = null
    }
    isRecording = false
    updateMicIcon()
  }
  connectButton.textContent = 'Connect'
  connectButton.classList.remove('connected')
  messageInput.disabled = true
  sendButton.disabled = true
  micButton.disabled = true
  cameraButton.disabled = true
  screenButton.disabled = true
  logMessage('Disconnected from server', 'system')

  if (videoManager) {
    stopVideo()
  }

  if (screenRecorder) {
    stopScreenSharing()
  }
}

/**
 * Handles sending a text message.
 */
function handleSendMessage() {
  const message = messageInput.value.trim()
  if (message) {
    logMessage(message, 'user')
    client.send({ text: message })
    messageInput.value = ''
  }
}

// Event Listeners
client.on('open', () => {
  logMessage('WebSocket connection opened', 'system')
})

client.on('log', (log) => {
  logMessage(`${log.type}: ${JSON.stringify(log.message)}`, 'system')
})

client.on('close', (event) => {
  logMessage(`WebSocket connection closed (code ${event.code})`, 'system')
})

client.on('audio', async (data) => {
  try {
    const streamer = await ensureAudioInitialized()
    streamer.addPCM16(new Uint8Array(data))
  } catch (error) {
    logMessage(`Error processing audio: ${error.message}`, 'system')
  }
})

client.on('content', (data) => {
  if (data.modelTurn) {
    if (data.modelTurn.parts.some((part) => part.functionCall)) {
      isUsingTool = true
      Logger.info('Model is using a tool')
    } else if (data.modelTurn.parts.some((part) => part.functionResponse)) {
      isUsingTool = false
      Logger.info('Tool usage completed')
    }

    const text = data.modelTurn.parts.map((part) => part.text).join('')
    if (text) {
      logMessage(text, 'ai')
    }
  }
})

client.on('interrupted', () => {
  audioStreamer?.stop()
  isUsingTool = false
  Logger.info('Model interrupted')
  logMessage('Model interrupted', 'system')
})

client.on('setupcomplete', () => {
  logMessage('Setup complete', 'system')
})

client.on('turncomplete', () => {
  isUsingTool = false
  logMessage('Turn complete', 'system')
})

client.on('error', (error) => {
  if (error instanceof ApplicationError) {
    Logger.error(`Application error: ${error.message}`, error)
  } else {
    Logger.error('Unexpected error', error)
  }
  logMessage(`Error: ${error.message}`, 'system')
})

client.on('message', (message) => {
  if (message.error) {
    Logger.error('Server error:', message.error)
    logMessage(`Server error: ${message.error}`, 'system')
  }
})

sendButton.addEventListener('click', handleSendMessage)
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    handleSendMessage()
  }
})

micButton.addEventListener('click', handleMicToggle)

connectButton.addEventListener('click', () => {
  if (isConnected) {
    disconnectFromWebsocket()
  } else {
    connectToWebsocket()
  }
})

messageInput.disabled = true
sendButton.disabled = true
micButton.disabled = true
connectButton.textContent = 'Connect'

/**
 * Handles the video toggle. Starts or stops video streaming.
 * @returns {Promise<void>}
 */
async function handleVideoToggle() {
  Logger.info('Video toggle clicked, current state:', { isVideoActive, isConnected })

  if (!isVideoActive) {
    try {
      Logger.info('Attempting to start video')
      if (!videoManager) {
        videoManager = new VideoManager()
      }

      await videoManager.start((frameData) => {
        if (isConnected) {
          client.sendRealtimeInput([frameData])
        }
      })

      isVideoActive = true
      cameraIcon.textContent = 'videocam_off'
      cameraButton.classList.add('active')
      Logger.info('Camera started successfully')
      logMessage('Camera started', 'system')
    } catch (error) {
      Logger.error('Camera error:', error)
      logMessage(`Error: ${error.message}`, 'system')
      isVideoActive = false
      videoManager = null
      cameraIcon.textContent = 'videocam'
      cameraButton.classList.remove('active')
    }
  } else {
    Logger.info('Stopping video')
    stopVideo()
  }
}

/**
 * Stops the video streaming.
 */
function stopVideo() {
  if (videoManager) {
    videoManager.stop()
    videoManager = null
  }
  isVideoActive = false
  cameraIcon.textContent = 'videocam'
  cameraButton.classList.remove('active')
  logMessage('Camera stopped', 'system')
}

cameraButton.addEventListener('click', handleVideoToggle)
stopVideoButton.addEventListener('click', stopVideo)

cameraButton.disabled = true

/**
 * Handles the screen share toggle. Starts or stops screen sharing.
 * @returns {Promise<void>}
 */
async function handleScreenShare() {
  if (!isScreenSharing) {
    try {
      screenContainer.style.display = 'block'

      screenRecorder = new ScreenRecorder()
      await screenRecorder.start(screenPreview, (frameData) => {
        if (isConnected) {
          client.sendRealtimeInput([
            {
              mimeType: 'image/jpeg',
              data: frameData
            }
          ])
        }
      })

      isScreenSharing = true
      screenIcon.textContent = 'stop_screen_share'
      screenButton.classList.add('active')
      Logger.info('Screen sharing started')
      logMessage('Screen sharing started', 'system')
    } catch (error) {
      Logger.error('Screen sharing error:', error)
      logMessage(`Error: ${error.message}`, 'system')
      isScreenSharing = false
      screenIcon.textContent = 'screen_share'
      screenButton.classList.remove('active')
      screenContainer.style.display = 'none'
    }
  } else {
    stopScreenSharing()
  }
}

/**
 * Stops the screen sharing.
 */
function stopScreenSharing() {
  if (screenRecorder) {
    screenRecorder.stop()
    screenRecorder = null
  }
  isScreenSharing = false
  screenIcon.textContent = 'screen_share'
  screenButton.classList.remove('active')
  screenContainer.style.display = 'none'
  logMessage('Screen sharing stopped', 'system')
}

screenButton.addEventListener('click', handleScreenShare)
screenButton.disabled = true
