import React, { useState, useEffect } from 'react';
import type { VeoHistoryItem, Toast } from '../types';
import { DownloadIcon, TrashIcon, VideoCameraIcon, RegenerateIcon, TextIcon, RestoreIcon } from './Icon';
import { downloadVideoFromUrl } from '../utils';

type ActionButtonProps = {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    disabled?: boolean;
    small?: boolean;
};

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon: Icon, label, disabled, small }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={`flex items-center justify-center gap-2 rounded-md transition-colors themed-button-secondary ${
            small 
                ? 'p-2'
                : 'flex-1 py-2 px-3'
        }`}
    >
        <Icon className={small ? "w-4 h-4" : "w-5 h-5"} />
        {!small && <span className="text-sm">{label}</span>}
    </button>
);


const VeoHistory: React.FC<{
    history: VeoHistoryItem[];
    onDelete: (id: string) => void;
    onPlay: (item: VeoHistoryItem) => void;
    onRegenerate: () => void;
    onUseText: () => void;
    onRestore: () => void;
    onDownload: (item: VeoHistoryItem) => void;
}> = ({ history, onDelete, onPlay, onRegenerate, onUseText, onRestore, onDownload }) => {
    return (
        <div className="pt-4 pr-2">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3 themed-text-glow">歷史紀錄</h3>
            {history.length === 0 ? (
                 <p className="text-sm text-slate-500 text-center py-4">這裡還沒有任何紀錄。</p>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-2 gap-3 space-y-3">
                    {history.map((item) => (
                        <div key={item.id} className="relative group rounded-lg overflow-hidden cursor-pointer break-inside-avoid" onClick={() => onPlay(item)}>
                            <img src={item.thumbnailUrl} alt={item.prompt} className="w-full h-auto object-cover" />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <p className="text-xs text-slate-200 max-h-16 overflow-hidden">{item.prompt}</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <ActionButton onClick={(e) => { e.stopPropagation(); onDownload(item); }} icon={DownloadIcon} label="下載" small />
                                    <ActionButton onClick={(e) => { e.stopPropagation(); onRegenerate(); }} icon={RegenerateIcon} label="再生成" small />
                                    <ActionButton onClick={(e) => { e.stopPropagation(); onUseText(); }} icon={TextIcon} label="使用文字" small />
                                    <ActionButton onClick={(e) => { e.stopPropagation(); onRestore(); }} icon={RestoreIcon} label="還原設定" small />
                                    <ActionButton onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} icon={TrashIcon} label="刪除" small />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-4">
        <VideoCameraIcon className="w-24 h-24 mb-4" />
        <h2 className="text-xl font-bold text-cyan-400 themed-text-glow">VEO 影片生成</h2>
        <p className="max-w-xs mt-2 text-sm">您生成的影片將會顯示在這裡。請在左側面板設定您的提示詞與選項，然後點擊「生成影片」。</p>
    </div>
);

type VeoPanelProps = {
    history: VeoHistoryItem[];
    onDelete: (id: string) => void;
    isLoading: boolean;
    currentVideo: VeoHistoryItem | null;
    onPlay: (item: VeoHistoryItem) => void;
    onRegenerate: () => void;
    onUseText: () => void;
    onRestore: () => void;
    addToast: (message: string, type?: Toast['type']) => void;
};

export const VeoPanel: React.FC<VeoPanelProps> = ({ history, onDelete, isLoading, currentVideo, onPlay, onRegenerate, onUseText, onRestore, addToast }) => {
    const [effectiveVideo, setEffectiveVideo] = useState<VeoHistoryItem | null>(null);
    const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
    const [isFetchingVideo, setIsFetchingVideo] = useState(false);

    useEffect(() => {
        if (currentVideo) {
            setEffectiveVideo(currentVideo);
        } else if (!currentVideo && history.length > 0) {
            setEffectiveVideo(history[0]);
        } else {
            setEffectiveVideo(null);
        }
    }, [currentVideo, history]);
    
    useEffect(() => {
        let objectUrlToRevoke: string | null = null;

        const fetchAndSetVideoUrl = async () => {
            if (!effectiveVideo) {
                setVideoObjectUrl(null);
                return;
            }

            setIsFetchingVideo(true);
            setVideoObjectUrl(null);

            try {
                const response = await fetch(effectiveVideo.videoUrl);
                if (!response.ok) {
                    throw new Error(`影片載入失敗: ${response.status} ${response.statusText}`);
                }
                const videoBlob = await response.blob();
                const objectUrl = URL.createObjectURL(videoBlob);
                objectUrlToRevoke = objectUrl;
                setVideoObjectUrl(objectUrl);
            } catch (error) {
                console.error('Failed to fetch video for playback:', error);
                addToast(error instanceof Error ? error.message : '未知的影片載入錯誤', 'error');
                setVideoObjectUrl(null);
            } finally {
                setIsFetchingVideo(false);
            }
        };

        fetchAndSetVideoUrl();

        return () => {
            if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
            }
        };
    }, [effectiveVideo, addToast]);
    
    const handleDownload = async (itemToDownload: VeoHistoryItem) => {
        addToast('正在準備下載...', 'info');
        try {
            const filename = `veo-video-${itemToDownload.id.slice(0, 8)}.mp4`;
            await downloadVideoFromUrl(itemToDownload.videoUrl, filename);
            addToast('下載已開始！', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            addToast(`下載失敗: ${error instanceof Error ? error.message : '未知錯誤'}`, 'error');
        }
    };

    return (
        <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-transparent min-w-0">
            {/* Main Content: Player */}
            <div className="flex-1 flex flex-col p-4">
                <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg relative overflow-hidden themed-panel">
                    {isLoading && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-fuchsia-500 mb-4"></div>
                            <p className="text-lg font-semibold text-white">影片生成中，請稍候...</p>
                            <p className="text-sm text-slate-400 mt-2">這可能需要數分鐘時間</p>
                         </div>
                    )}
                     {isFetchingVideo && !isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                            <div className="w-12 h-12 border-2 border-dashed rounded-full animate-spin border-cyan-400"></div>
                            <p className="mt-3 text-slate-300">正在載入影片...</p>
                        </div>
                    )}
                    {videoObjectUrl ? (
                        <video key={effectiveVideo?.id} src={videoObjectUrl} controls autoPlay loop className="w-full h-full object-contain" />
                    ) : !isLoading && !isFetchingVideo && (
                        <EmptyState />
                    )}
                </div>
                {effectiveVideo && !isLoading && (
                    <div className="flex-shrink-0 pt-4">
                        <div className="flex items-center gap-3">
                            <ActionButton onClick={() => handleDownload(effectiveVideo)} icon={DownloadIcon} label="下載" />
                            <ActionButton onClick={onRegenerate} icon={RegenerateIcon} label="再生成" />
                            <ActionButton onClick={onUseText} icon={TextIcon} label="使用文字" />
                            <ActionButton onClick={onRestore} icon={RestoreIcon} label="還原設定" />
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: History */}
            <aside className="w-full md:w-80 flex-shrink-0 bg-black/20 overflow-y-auto p-2">
                 <VeoHistory 
                    history={history} 
                    onDelete={onDelete} 
                    onPlay={onPlay} 
                    onRegenerate={onRegenerate}
                    onUseText={onUseText}
                    onRestore={onRestore}
                    onDownload={handleDownload}
                />
            </aside>
        </main>
    );
};