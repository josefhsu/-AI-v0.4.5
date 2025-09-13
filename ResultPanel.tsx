// Fix: Restored file content to resolve parsing errors caused by file corruption.
import React from 'react';
import type { GeneratedImage } from './types';
import { EyeIcon, DownloadIcon, ExpandIcon, ZoomOutIcon, PaperClipIcon, EraseIcon, PaintBrushIcon, SendToStartFrameIcon, SendToEndFrameIcon } from './components/Icon';
import { downloadImage, formatFileSize } from './utils';
import { EXAMPLE_PROMPTS } from './constants';

interface ResultPanelProps {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  onPromptSelect: (prompt: string) => void;
  onUpscale: (src: string) => void;
  onZoomOut: (item: GeneratedImage) => void;
  onSetLightboxConfig: (images: GeneratedImage[], startIndex: number) => void;
  onUseImage: (image: GeneratedImage, action: 'reference' | 'remove_bg' | 'draw_bg') => void;
  onSendImageToVeo: (image: GeneratedImage, frame: 'start' | 'end') => void;
}

const ImageCard: React.FC<{
    image: GeneratedImage;
    index: number;
    images: GeneratedImage[];
    onUpscale: (src: string) => void;
    onZoomOut: (item: GeneratedImage) => void;
    onSetLightboxConfig: (images: GeneratedImage[], startIndex: number) => void;
    onUseImage: (image: GeneratedImage, action: 'reference' | 'remove_bg' | 'draw_bg') => void;
    onSendImageToVeo: (image: GeneratedImage, frame: 'start' | 'end') => void;
}> = ({ image, index, images, onUpscale, onZoomOut, onSetLightboxConfig, onUseImage, onSendImageToVeo }) => {
    
    const handleDownload = () => {
        const safeFilename = (image.prompt || image.alt).replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_').toLowerCase();
        downloadImage(image.src, `${safeFilename.slice(0, 30)}.png`);
    };

    return (
        <div className="relative group aspect-square bg-black rounded-lg overflow-hidden cyber-panel">
            <img src={image.src} alt={image.alt} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                <p className="text-xs text-center text-slate-300 mb-3 max-h-12 overflow-hidden">{image.alt}</p>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => onUseImage(image, 'reference')} title="作為參考圖" className="p-2 text-white cyber-button-secondary rounded-full"> <PaperClipIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onUseImage(image, 'remove_bg')} title="移除背景" className="p-2 text-white cyber-button-secondary rounded-full"> <EraseIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onUseImage(image, 'draw_bg')} title="設為畫布背景" className="p-2 text-white cyber-button-secondary rounded-full"> <PaintBrushIcon className="w-5 h-5" /> </button>
                    <button onClick={handleDownload} title="下載圖片" className="p-2 text-white cyber-button-secondary rounded-full"> <DownloadIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onSetLightboxConfig(images, index)} title="放大檢視" className="p-2 text-white cyber-button-secondary rounded-full"> <EyeIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onUpscale(image.src)} title="提升畫質" className="p-2 text-white cyber-button-secondary rounded-full"> <ExpandIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onZoomOut(image)} title="Zoom out 2x" className="p-2 text-white cyber-button-secondary rounded-full"> <ZoomOutIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onSendImageToVeo(image, 'start')} title="用於首幀" className="p-2 text-white cyber-button-secondary rounded-full"> <SendToStartFrameIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onSendImageToVeo(image, 'end')} title="用於尾幀" className="p-2 text-white cyber-button-secondary rounded-full"> <SendToEndFrameIcon className="w-5 h-5" /> </button>
                </div>
            </div>
            {image.width && image.height && image.size && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                    {image.width}x{image.height} | {formatFileSize(image.size)}
                </div>
            )}
        </div>
    );
};


export const ResultPanel: React.FC<ResultPanelProps> = ({ images, isLoading, error, onPromptSelect, onUpscale, onZoomOut, onSetLightboxConfig, onUseImage, onSendImageToVeo }) => {

  const hasContent = images.length > 0 || isLoading || error;

  return (
    <main className="flex-1 flex flex-col p-2 md:p-4 bg-transparent min-w-0 overflow-y-auto">
      {hasContent ? (
        <div className="flex-1">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
              <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-fuchsia-500 mb-4"></div>
              <p className="text-lg font-semibold text-white">圖片生成中...</p>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="cyber-panel border-red-500 text-red-300 p-4 rounded-lg text-center">
                <h3 className="font-bold mb-2">發生錯誤</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <ImageCard 
                    key={image.id} 
                    image={image}
                    index={index}
                    images={images}
                    onUpscale={onUpscale} 
                    onZoomOut={onZoomOut} 
                    onSetLightboxConfig={onSetLightboxConfig}
                    onUseImage={onUseImage}
                    onSendImageToVeo={onSendImageToVeo}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 p-4">
            <img 
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48ZmlsdGVyIGlkPSJnbG93Ij48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI0IiByZXN1bHQ9ImJsdXIiLz48ZmVGbG9vZCBmbG9vZC1jb2xvcj0iI2YwZiIvPjxmZUNvbXBvc2l0ZSBpbjI9ImJsdXIiIG9wZXJhdG9yPSJpbiIvPjxmZUNvbXBvc2l0ZSBpbjI9IlNvdXJjZUdyYXBoaWMiIG9wZXJhdG9yPSJvdmVyIi8+PC9maWx0ZXI+PC9kZWZzPjxwYXRoIGQ9Ik0yNSw3NSBDIzAsNTIgNDAsMjAgNjAsMjUgQzgwLDMwIDc1LDcwIDcwLDgwIEM2MCw5NSA0MCw5MCAyNSw3NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmMCIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbHRlcj0idXJsKCNnbG93KSIvPjxwYXRoIGQ9Ik0yNSw3NSBDMzAsNTIgNDAsMjAgNjAsMjUgQzgwLDMwIDc1LDcwIDcwLDgwIEM2MCw5NSA0MCw5MCAyNSw3NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmNmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=="
                alt="鳥巢AI包娜娜 Logo" 
                className="w-64 h-64 mb-6" 
            />
          <h2 className="text-2xl font-bold mb-2 text-white cyber-text-glow">鳥巢AI包娜娜，包生的啦！</h2>
          <p className="max-w-md mb-6 text-slate-500">沒問題咱們懶惰，通通讓AI來做！</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptSelect(prompt)}
                className="px-4 py-2 text-sm rounded-full transition-colors cyber-button-secondary"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};
