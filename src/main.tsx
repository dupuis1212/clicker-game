import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './ui/styles/index.css';
import { startLoop } from './engine/loop';
import { startAutosave } from './engine/persistence/autosave';
import { installAudioUnlock } from './engine/audio';

startLoop();
startAutosave();
installAudioUnlock();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
