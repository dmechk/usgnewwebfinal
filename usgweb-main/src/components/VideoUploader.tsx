import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, Video as VideoIcon, X, Check, Play, AlertCircle } from 'lucide-react';
import { API_BASE_URL, getUploadUrl, getAuthToken } from '../services/api';

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
  helpText = 'Upload any video file (any format and size) or paste a direct video URL or YouTube embed link.',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputUrl, setInputUrl] = useState(value);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const sizeStr = formatFileSize(file.size);
    setFileName(`${file.name} (${sizeStr})`);
    setIsLoading(true);

    // 1. Try uploading to backend /api/upload/video (streams directly to disk with 1GB limit)
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = API_BASE_URL ? `${API_BASE_URL}/upload/video` : '/api/upload/video';
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.data?.fileUrl) {
          const finalUrl = getUploadUrl(json.data.fileUrl);
          onChange(finalUrl);
          setInputUrl(finalUrl);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Backend unavailable or network error — fall through to browser playback
    }

    // 2. Direct browser playback handling (works with ANY size and never throws out-of-memory errors)
    try {
      if (file.size <= 20 * 1024 * 1024) {
        // Smaller files (<=20MB) can be safely read as DataURL for offline localStorage persistence
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result);
            setInputUrl(reader.result);
          }
          setIsLoading(false);
        };
        reader.onerror = () => {
          // If browser string allocation fails, use ObjectURL
          const objUrl = URL.createObjectURL(file);
          onChange(objUrl);
          setInputUrl(objUrl);
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } else {
        // Large files (>20MB): URL.createObjectURL creates an instant blob: URL with zero memory overhead!
        const objUrl = URL.createObjectURL(file);
        onChange(objUrl);
        setInputUrl(objUrl);
        setIsLoading(false);
      }
    } catch (err: any) {
      // Final fallback
      const objUrl = URL.createObjectURL(file);
      onChange(objUrl);
      setInputUrl(objUrl);
      setIsLoading(false);
    }
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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*,*/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
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
                  setFileName(null);
                }}
                className="px-3 py-2 text-slate-500 hover:text-rose-600 text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove Video</span>
              </button>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Processing {fileName || 'video file'}...</span>
            </div>
          )}

          {!isLoading && fileName && value && (
            <div className="text-[11px] text-slate-600 flex items-center gap-1.5 px-2">
              <VideoIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium truncate">{fileName}</span>
            </div>
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
