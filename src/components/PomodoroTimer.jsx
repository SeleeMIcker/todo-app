import React, { useState, useRef } from 'react';

// Royalty-free sound (short beep)
const BEEP_URL = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3';
// Royalty-free background music
const MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/10/16/audio_12b5b7b6b7.mp3';

const DEFAULTS = {
  work: 25 * 60, // 25 min
  shortBreak: 5 * 60, // 5 min
  longBreak: 15 * 60, // 15 min
};

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const PomodoroTimer = () => {
  const [mode, setMode] = useState('work');
  const [durations, setDurations] = useState({ ...DEFAULTS });
  const [timeLeft, setTimeLeft] = useState(DEFAULTS.work);
  const [running, setRunning] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const intervalRef = useRef(null);
  const beepRef = useRef(null);
  const musicRef = useRef(null);

  // Timer logic
  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            beepRef.current?.play();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Music control
  React.useEffect(() => {
    if (musicOn) {
      musicRef.current.play();
    } else {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, [musicOn]);

  // When mode changes, reset timer
  React.useEffect(() => {
    setTimeLeft(durations[mode]);
  }, [mode, durations]);

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setTimeLeft(durations[mode]);
  };
  const handleModeChange = m => {
    setMode(m);
    setRunning(false);
  };
  const handleCustomize = e => {
    e.preventDefault();
    setDurations({
      work: Number(e.target.work.value) * 60,
      shortBreak: Number(e.target.shortBreak.value) * 60,
      longBreak: Number(e.target.longBreak.value) * 60,
    });
    setCustomizing(false);
  };

  return (
    <div className="pomodoro-timer" style={{textAlign: 'center', maxWidth: 340, margin: '0 auto'}}>
      <audio ref={beepRef} src={BEEP_URL} preload="auto" />
      <audio ref={musicRef} src={MUSIC_URL} loop preload="auto" />
      <div style={{marginBottom: 16}}>
        <button onClick={() => handleModeChange('work')} className={mode==='work' ? 'active' : ''}>Work</button>
        <button onClick={() => handleModeChange('shortBreak')} className={mode==='shortBreak' ? 'active' : ''}>Short Break</button>
        <button onClick={() => handleModeChange('longBreak')} className={mode==='longBreak' ? 'active' : ''}>Long Break</button>
      </div>
      <div style={{fontSize: 48, fontWeight: 700, marginBottom: 16}}>{formatTime(timeLeft)}</div>
      <div style={{marginBottom: 16}}>
        {!running ? (
          <button onClick={handleStart}>Start</button>
        ) : (
          <button onClick={handlePause}>Pause</button>
        )}
        <button onClick={handleReset} style={{marginLeft: 8}}>Reset</button>
        <button onClick={() => setCustomizing(c => !c)} style={{marginLeft: 8}}>
          {customizing ? 'Cancel' : 'Customize'}
        </button>
      </div>
      {customizing && (
        <form onSubmit={handleCustomize} style={{marginBottom: 16}}>
          <div>
            <label>Work: <input name="work" type="number" min="1" max="120" defaultValue={durations.work/60} /> min</label>
          </div>
          <div>
            <label>Short Break: <input name="shortBreak" type="number" min="1" max="30" defaultValue={durations.shortBreak/60} /> min</label>
          </div>
          <div>
            <label>Long Break: <input name="longBreak" type="number" min="1" max="60" defaultValue={durations.longBreak/60} /> min</label>
          </div>
          <button type="submit" style={{marginTop: 8}}>Save</button>
        </form>
      )}
      <div style={{marginTop: 16}}>
        <button onClick={() => setMusicOn(m => !m)}>{musicOn ? 'Stop Music' : 'Play Music'}</button>
      </div>
    </div>
  );
};

export default PomodoroTimer; 