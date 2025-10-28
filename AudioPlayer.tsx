import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  subject: string;
  background?: 'none' | 'rain' | 'white_noise' | 'delta_waves';
  autoPlay?: boolean;
}

export function AudioPlayer({ audioUrl, title, subject, background = 'none', autoPlay = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgGainRef = useRef<GainNode | null>(null);
  const bgSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const lfoOscRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const bgFilterRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.pause();
    audio.currentTime = 0;
    audio.load();

    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
    setIsPlaying(!audio.paused);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Auto-play when requested and URL changes
  useEffect(() => {
    if (!autoPlay) return;
    const el = audioRef.current;
    if (!el) return;
    const tryPlay = async () => {
      try {
        await el.play();
        setIsPlaying(!el.paused);
      } catch (e) {
        console.warn('Autoplay blocked', e);
      }
    };
    tryPlay();
  }, [audioUrl, autoPlay]);

  // Lightweight background audio via Web Audio API
  useEffect(() => {
    const startBg = async () => {
      if (background === 'none' || !isPlaying) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;
        const gain = ctx.createGain();
        gain.gain.value = background === 'white_noise' ? 0.06 : 0.04;
        bgGainRef.current = gain;
        let source: AudioBufferSourceNode | null = null;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4; // gentle noise
        source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        let filter: BiquadFilterNode | null = null;
        if (background === 'rain') {
          filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 1000;
        } else if (background === 'delta_waves') {
          filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 500;
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.8;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.03;
          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);
          lfo.start();
          lfoOscRef.current = lfo;
          lfoGainRef.current = lfoGain;
        }

        if (filter) {
          source.connect(filter);
          filter.connect(gain);
        } else {
          source.connect(gain);
        }
        gain.connect(ctx.destination);
        source.start(0);
        bgSourceRef.current = source;
        bgFilterRef.current = filter;
      } catch (e) {
        console.warn('Background audio init failed', e);
      }
    };

    const stopBg = () => {
      try {
        bgSourceRef.current?.stop();
      } catch {}
      bgSourceRef.current?.disconnect();
      bgFilterRef.current?.disconnect();
      lfoOscRef.current?.stop();
      lfoOscRef.current?.disconnect();
      lfoGainRef.current?.disconnect();
      bgGainRef.current?.disconnect();
      bgSourceRef.current = null;
      bgFilterRef.current = null;
      lfoOscRef.current = null;
      lfoGainRef.current = null;
      bgGainRef.current = null;
    };

    if (isPlaying) {
      startBg();
    } else {
      stopBg();
    }

    return () => stopBg();
  }, [isPlaying, background]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused || audio.ended) {
        if (audio.ended) {
          audio.currentTime = 0;
        }
        await audio.play();
        if (!audio.paused) {
          setIsPlaying(true);
        }
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error('Unable to start playback', error);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subject}</p>
        </div>

        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="rounded-full shadow-glow"
            type="button"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
          </Button>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
