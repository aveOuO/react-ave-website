import React from 'react'

const ConfigPanel: React.FC = () => {
  return (
    <div id='config-container' className='hidden-mobile'>
      <div className='config-wrapper'>
        <div className='preset-sets'>
          <h3>Example Sets</h3>
          <div className='preset-buttons'>
            <button className='preset-button' data-preset='friendly'>
              <span className='preset-name'>Friendly Assistant</span>
              <span className='preset-desc'>Warm and helpful tone with Aoede's high pitch voice</span>
            </button>
            <button className='preset-button' data-preset='professional'>
              <span className='preset-name'>Professional Expert</span>
              <span className='preset-desc'>Formal and precise with Charon's voice</span>
            </button>
            <button className='preset-button' data-preset='tired'>
              <span className='preset-name'>Tired Assistant</span>
              <span className='preset-desc'>Tired and sleepy with Aoede's low pitch voice</span>
            </button>
          </div>
        </div>

        <select id='voice-select'>
          <option value='Puck'>Puck (Male)</option>
          <option value='Charon'>Charon (Male)</option>
          <option value='Kore'>Kore (Female)</option>
          <option value='Fenrir'>Fenrir (Male)</option>
          <option value='Aoede'>Aoede (Female)</option>
        </select>
        <div className='sample-rate-container'>
          <input
            type='number'
            id='sample-rate-input'
            placeholder='Sample Rate (Hz)'
            min='8000'
            max='48000'
            step='1000'
          />
          <span className='sample-rate-help'>up for high pitch, down for low</span>
        </div>
        <textarea id='system-instruction' placeholder='Enter custom system instructions...' rows={3}></textarea>
        <button id='apply-config'>Apply Settings</button>
      </div>
    </div>
  )
}

export default ConfigPanel 