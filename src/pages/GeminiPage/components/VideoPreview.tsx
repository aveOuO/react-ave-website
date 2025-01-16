import React from 'react'

const VideoPreview: React.FC = () => {
  return (
    <>
      <div id='video-container' style={{ display: 'none' }}>
        <video id='preview' playsInline autoPlay muted></video>
        <div className='video-controls'>
          <button id='stop-video'>Stop Video</button>
        </div>
      </div>
      <div id='screen-container' style={{ display: 'none' }}>
        <video id='screen-preview' playsInline autoPlay muted></video>
        <button className='close-button material-symbols-outlined'>
          close
        </button>
      </div>
    </>
  )
}

export default VideoPreview 