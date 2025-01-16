import React from 'react'

const AudioVisualizers: React.FC = () => {
  return (
    <div className='audio-visualizers'>
      <div className='visualizer-container'>
        <label>Input Audio</label>
        <div id='input-audio-visualizer'></div>
      </div>
      <div className='visualizer-container'>
        <label>Output Audio</label>
        <div id='audio-visualizer'></div>
      </div>
    </div>
  )
}

export default AudioVisualizers 