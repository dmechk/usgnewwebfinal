import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, Video as VideoIcon, X, Check, Play, AlertCircle } from 'lucide-react';

interface VideoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helpText?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  value,
  onChange,
  label = 'Client Attraction Video',
  helpText = 'Upload an MP4/WebM video file (up to 30MB) or paste a direct video URL or YouTube embed link.',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputUrl, setInputUrl] = useState(value);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept any video file format (MP4, WebM, MOV, AVI, MKV, 3GP, OGG, FLV, WMV, etc.)
    const isVideo = file.type.startsWith('video/') || 
      /\.(mp4|webm|mkv|mov|avi|wmv|flv|3gp|m4v|ogv|ts)$/i.test(file.name);

    if (!isVideo) {
      setErrorMsg('Please select a video file (MP4, WebM, MOV, AVI, MKV, 3GP, etc.)');
      return;
    }

    // Limit to 60MB for local browser base64 storage
    if (file.size > 60 * 1024 * 1024) {
      setErrorMsg('Direct video file size should be under 60MB. For larger videos, please paste a YouTube, Vimeo, or hosted video link.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
        setInputUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (inputUrl && inputUrl.trim()) {
      onChange(inputUrl.trim());
      setIsUrlMode(false);
      setErrorMsg(null);
    }
  };

  const isEmbed = value.includes('youtube.com') || value.includes('youtu.be') || value.includes('vimeo.com');

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
        >
          {isUrlMode ? (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Switch to File Upload</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste Video URL / YouTube</span>
            </>
          )}
        </button>
      </div>

      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isUrlMode ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://... (mp4 link, youtube.com/watch?v=...)"
            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*,.mp4,.webm,.mkv,.mov,.avi,.wmv,.flv,.3gp,.m4v,.ts"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Choose Video File from Device</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setInputUrl('');
              }}
              className="px-3 py-2 text-slate-500 hover:text-rose-600 text-xs font-semibold cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove Video</span>
            </button>
          )}
        </div>
      )}

      {/* Video Preview */}
      {value && (
        <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 aspect-video shadow-md">
          {isEmbed ? (
            <iframe
              src={getEmbedUrl(value)}
              title="Video Preview"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={value}
              controls
              className="w-full h-full object-contain"
            />
          )}
        </div>
      )}
    </div>
  );
};
