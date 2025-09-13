import React from 'react';
import type { HistoryItem, GeneratedImage, AppMode, Toast } from '../types';
import { TrashIcon, HistoryIcon, EyeIcon, SparklesIcon } from './Icon';
import { AnalysisPanel } from './AnalysisPanel';

interface HistoryPanelProps {
  history: HistoryItem[];
  selectedItem: HistoryItem | null;
  onSelectItem: (item: HistoryItem) => void;
  isAnalyzing: boolean;
  analysisError: string | null;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onSetLightboxConfig: (images: GeneratedImage[], startIndex: number) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  onUseImage: (item: HistoryItem, targetMode: AppMode) => void;
  onUpscale: (src: string) => void;
  onZoomOut: (item: HistoryItem) => void;
  onSendImageToVeo: (image: GeneratedImage, frame: 'start' | 'end') => void;
  onUe5Upgrade: (image: GeneratedImage) => void;
}

const HistoryGallery: React.FC<{
    history: HistoryItem[];
    onSelectItem: (item: HistoryItem) => void;
    onSetLightboxConfig: (images: GeneratedImage[], startIndex: number) => void;
    selectedItem: HistoryItem | null;
}> = ({ history, onSelectItem, onSetLightboxConfig, selectedItem }) => {
    return (
        <div className="space-y-2">
            {history.map((item, index) => (
                <div 
                    key={item.id} 
                    className={`relative group rounded-lg cursor-pointer transition-all duration-300 cyber-glow-corners ${selectedItem?.id === item.id ? 'themed-item-selected' : 'border-2 border-transparent'}`}
                    onClick={() => onSelectItem(item)}
                >
                    <img src={item.src} alt={item.alt} className="w-full h-auto object-cover block rounded-lg" />
                     <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-start p-2">
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetLightboxConfig(history, index);
                            }}
                            title="放大檢視"
                            className="p-2 text-white themed-button-secondary rounded-full"
                        >
                            <EyeIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {item.width && item.height && (
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                            {item.aspectRatio && `${item.aspectRatio} | `}{item.width}x{item.height}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const EmptyAnalysisPanel: React.FC = () => (
    <div className="flex flex-col h-full items-center justify-center text-center text-slate-500 p-4">
        <EyeIcon className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold text-white-400 themed-text-glow">選擇一張圖片</h3>
        <p className="text-sm mt-2">點擊右側的歷史紀錄圖片，以查看詳細資訊和 AI 美感分析。</p>
    </div>
);


export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  selectedItem,
  onSelectItem,
  isAnalyzing,
  analysisError,
  onDeleteHistoryItem,
  onClearHistory,
  onSetLightboxConfig,
  addToast,
  onSendImageToVeo,
  onZoomOut,
  onUe5Upgrade,
  ...analysisPanelProps
}) => {
  return (
    <main className="flex-1 flex h-full overflow-hidden bg-transparent min-w-0">
        {/* Left Panel: Analysis */}
        <div className="w-full md:w-96 flex-shrink-0 bg-black/20 overflow-y-auto">
            {selectedItem ? (
                 <AnalysisPanel 
                    key={selectedItem.id} // Re-mount when item changes
                    image={selectedItem}
                    isAnalyzing={isAnalyzing}
                    analysisError={analysisError}
                    onDeleteHistoryItem={onDeleteHistoryItem}
                    addToast={addToast}
                    onSendImageToVeo={onSendImageToVeo}
                    onZoomOut={() => onZoomOut(selectedItem)}
                    onUe5Upgrade={onUe5Upgrade}
                    {...analysisPanelProps}
                 />
            ) : (
                <EmptyAnalysisPanel />
            )}
        </div>

        {/* Right Panel: Gallery */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto cyber-glow-corners">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white-400 themed-text-glow">歷史紀錄</h2>
                {history.length > 0 && (
                    <button
                        onClick={onClearHistory}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md themed-button-secondary"
                    >
                        <TrashIcon className="w-4 h-4" /> 清除所有紀錄
                    </button>
                )}
            </div>
            {history.length > 0 ? (
                <HistoryGallery 
                    history={history} 
                    onSelectItem={onSelectItem}
                    onSetLightboxConfig={onSetLightboxConfig}
                    selectedItem={selectedItem}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <HistoryIcon className="w-16 h-16 mb-4" />
                    <p className="text-lg">尚無歷史紀錄</p>
                    <p className="text-sm">您生成的圖片將會顯示在這裡。</p>
                </div>
            )}
        </div>
    </main>
  );
};
