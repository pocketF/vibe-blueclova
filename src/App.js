import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VideoUploader from './components/VideoUploader';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/video_upload" element={<VideoUploader />} />
          <Route path="/" element={<Navigate to="/video_upload" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
