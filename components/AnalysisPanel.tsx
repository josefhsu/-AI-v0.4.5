import React from 'react';
import type { HistoryItem, AppMode, Toast, GeneratedImage } from '../types';
import { downloadImage, formatFileSize, getAspectRatio } from '../utils';
import { TrashIcon, PaperClipIcon, DownloadIcon, ExpandIcon, ZoomOutIcon, EraseIcon, PaintBrushIcon, SendToStartFrameIcon, SendToEndFrameIcon } from './Icon';

interface AnalysisPanelProps {
  image: HistoryItem;
  isAnalyzing: boolean;
  analysisError: string | null;
  onDeleteHistoryItem: (id: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  onUseImage: (item: HistoryItem, targetMode: AppMode) => void;
  onUpscale: (src: string) => void;
  onZoomOut: () => void;
  onSendImageToVeo: (image: GeneratedImage, frame: 'start' | 'end') => void;
  onUe5Upgrade: (image: GeneratedImage) => void;
}

const ActionButton: React.FC<{ onClick: () => void; icon: React.FC<any>; label: string; disabled?: boolean }> = 
({ onClick, icon: Icon, label, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-left w-full rounded-md themed-button-secondary"
    >
        <Icon className="w-4 h-4" />
        <span className="truncate">{label}</span>
    </button>
);

const CopyableText: React.FC<{ text: string, label: string, addToast: AnalysisPanelProps['addToast'] }> = 
({ text, label, addToast }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            addToast(`${label}已複製到剪貼簿`, 'success');
        }).catch(err => {
            console.error('Copy failed', err);
            addToast('複製失敗', 'error');
        });
    };

    return (
        <p 
            className="text-sm text-slate-300 cursor-pointer hover:bg-slate-800/50 p-2 rounded-md transition-colors"
            onClick={handleCopy}
            title="點擊以複製"
        >
            {text}
        </p>
    );
};


export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
    image,
    isAnalyzing,
    analysisError,
    onDeleteHistoryItem,
    addToast,
    onUseImage,
    onUpscale,
    onZoomOut,
    onSendImageToVeo,
    onUe5Upgrade,
}) => {
  const handleDownload = () => {
    const safeFilename = image.alt.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_').toLowerCase();
    downloadImage(image.src, `${safeFilename.slice(0, 30)}.png`);
  };
  
  return (
    <div className="flex flex-col h-full p-2 space-y-4">
      <img src={image.src} alt={image.alt} className="w-full object-contain rounded-lg" />
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-1">提示詞</h3>
            <CopyableText text={image.alt} label="提示詞" addToast={addToast} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">圖片資訊</h3>
            <div className="text-xs text-slate-400 space-y-1 bg-black/20 p-2 rounded-md">
                <p>尺寸: {image.width && image.height ? `${image.width} x ${image.height} px` : 'N/A'}</p>
                <p>長寬比: {image.width && image.height ? getAspectRatio(image.width, image.height) : 'N/A'}</p>
                <p>檔案大小: {image.size ? formatFileSize(image.size) : 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">操作</h3>
            <div className="grid grid-cols-2 gap-2">
                <ActionButton onClick={() => onUseImage(image, 'GENERATE')} icon={PaperClipIcon} label="作為參考圖" />
                <ActionButton onClick={handleDownload} icon={DownloadIcon} label="下載圖片" />
                <ActionButton onClick={() => onUseImage(image, 'REMOVE_BG')} icon={EraseIcon} label="移除背景" />
                <ActionButton onClick={() => onUseImage(image, 'DRAW')} icon={PaintBrushIcon} label="設為畫布背景" />
                <ActionButton onClick={() => onUpscale(image.src)} icon={ExpandIcon} label="提升畫質" />
                <ActionButton onClick={onZoomOut} icon={ZoomOutIcon} label="Zoom Out" />
                <ActionButton onClick={() => onSendImageToVeo(image, 'start')} icon={SendToStartFrameIcon} label="用於首幀" />
                <ActionButton onClick={() => onSendImageToVeo(image, 'end')} icon={SendToEndFrameIcon} label="用於尾幀" />
                <ActionButton onClick={() => onUe5Upgrade(image)} icon={() => <span className="font-bold text-xs w-4 h-4 flex items-center justify-center">UE5</span>} label="升級為 UE5 真實感" />
            </div>
            <div className="mt-2">
                <ActionButton onClick={() => onDeleteHistoryItem(image.id)} icon={TrashIcon} label="刪除此紀錄" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">AI 美感分析</h3>
            {isAnalyzing && (
                <div className="flex items-center justify-center gap-2 text-slate-300">
                    <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-fuchsia-400"></div>
                    <span>分析中...</span>
                </div>
            )}
            {analysisError && <p className="text-red-400 text-sm">{analysisError}</p>}
            {image.analysis && (
                <div className="space-y-2">
                    <p className="font-bold text-2xl text-fuchsia-400" style={{textShadow: '0 0 5px #f0f'}}>{image.analysis.score}</p>
                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed cursor-pointer hover:bg-slate-800/50 p-2 rounded-md transition-colors"
                        onClick={() => addToast && image.analysis && navigator.clipboard.writeText(image.analysis.analysis).then(() => addToast('美感分析已複製', 'success'))}
                        title="點擊以複製"
                    >
                        {image.analysis.analysis}
                    </div>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};
