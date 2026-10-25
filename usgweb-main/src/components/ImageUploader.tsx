import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, RefreshCw, Eye } from 'lucide-react';

interface ImagePreset {
  label: string;
  url: string;
}

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  presets?: ImagePreset[];
  helpText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Picture / Image',
  aspectRatio = 'square',
  presets = [],
  helpText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputUrl, setInputUrl] = useState(value);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compress image via HTML5 Canvas to prevent browser localStorage quota exceeded errors
  const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // Limit to 10MB input file
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 10MB');
      return;
    }

    setErrorMsg(null);
    try {
      // Compress to lightweight web-optimized JPEG so it permanently saves in localStorage without disappearing
      const compressed = await compressImage(file, 1200, 1200, 0.8);
      onChange(compressed);
      setInputUrl(compressed);
    } catch {
      // Fallback to uncompressed if canvas compression is unavailable
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
          setInputUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (inputUrl && inputUrl.trim()) {
      onChange(inputUrl.trim());
      setIsUrlMode(false);
      setErrorMsg(null);
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : 'aspect-auto max-h-48';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[11px] text-slate-400">Upload or URL</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 border border-slate-200 rounded-2xl p-3">
        {/* Preview Container */}
        <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shrink-0 shadow-inner group flex items-center justify-center`}>
          {value ? (
            <>
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
                onError={() => setErrorMsg('Image failed to load. Check URL or upload a file.')}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                Current
              </div>
            </>
          ) : (
            <div className="text-center p-2 text-slate-400 text-xs flex flex-col items-center">
              <ImageIcon className="w-6 h-6 mb-1 text-slate-500" />
              <span>No image</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2.5 w-full">
          {/* Main Upload and URL buttons */}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload from Device</span>
            </button>

            <button
              type="button"
              onClick={() => setIsUrlMode(!isUrlMode)}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{isUrlMode ? 'Hide URL Input' : 'Enter Image URL'}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setInputUrl('');
                }}
                className="px-2 py-1.5 text-slate-400 hover:text-red-600 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear current image"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* URL Mode Input */}
          {isUrlMode && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://... or /src/assets/..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <p className="text-[11px] text-red-600 font-medium">{errorMsg}</p>
          )}

          {/* Presets */}
          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Quick Presets:</span>
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setInputUrl(preset.url);
                    setErrorMsg(null);
                  }}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {helpText && (
            <p className="text-[10px] text-slate-400 leading-tight">{helpText}</p>
          )}
        </div>
      </div>
    </div>
  );
};
