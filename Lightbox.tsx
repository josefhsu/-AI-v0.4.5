// Fix: Restored file content to resolve parsing errors caused by file corruption.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GeneratedImage, LightboxConfig } from './types';
import { XIcon, ArrowLeftIcon, ArrowRightIcon, DownloadIcon, ExpandIcon, ZoomOutIcon, PaperClipIcon, EraseIcon, PaintBrushIcon, SendToStartFrameIcon, SendToEndFrameIcon } from './components/Icon';
import { downloadImage } from './utils';

interface LightboxProps {
  config: LightboxConfig;
  onClose: () => void;
  onUpscale: (src: string) => void;
  onZoomOut: (item: GeneratedImage) => void;
  onUseImage: (image: GeneratedImage, action: 'reference' | 'remove_bg' | 'draw_bg') => void;
  onSendImageToVeo: (image: GeneratedImage, frame: 'start' | 'end') => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ config, onClose, onUpscale, onZoomOut, onUseImage, onSendImageToVeo }) => {
    if (!config) return null;

    const { images, startIndex } = config;
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigatorRef = useRef<HTMLDivElement>(null);

    const currentImage = images[currentIndex];

    const resetZoomAndPan = useCallback(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, []);
    
    useEffect(() => {
        resetZoomAndPan();
    }, [currentIndex, resetZoomAndPan]);

    const handleClose = useCallback(() => onClose(), [onClose]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);
    
    const handleDownload = useCallback(() => {
        if (currentImage) {
            const safeFilename = (currentImage.prompt || currentImage.alt).replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_').toLowerCase();
            downloadImage(currentImage.src, `${safeFilename.slice(0, 30)}.png`);
        }
    }, [currentImage]);

    const clampPosition = useCallback((pos: { x: number; y: number }, currentZoom: number) => {
        if (!containerRef.current || !imageRef.current) return { x: 0, y: 0 };
        const containerRect = containerRef.current.getBoundingClientRect();
        const { offsetWidth: imgLayoutWidth, offsetHeight: imgLayoutHeight } = imageRef.current;
        const imgDisplayWidth = imgLayoutWidth * currentZoom;
        const imgDisplayHeight = imgLayoutHeight * currentZoom;
        const overhangX = Math.max(0, (imgDisplayWidth - containerRect.width) / 2);
        const overhangY = Math.max(0, (imgDisplayHeight - containerRect.height) / 2);
        return {
            x: Math.max(-overhangX, Math.min(overhangX, pos.x)),
            y: Math.max(-overhangY, Math.min(overhangY, pos.y)),
        };
    }, []);
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newZoom = Math.max(1, Math.min(4, zoom - e.deltaY * 0.01));
        const newPosition = clampPosition(position, newZoom);
        setZoom(newZoom);
        setPosition(newPosition);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || zoom <= 1) return;
        e.preventDefault();
        const newPos = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
        setPosition(clampPosition(newPos, zoom));
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleNavAction = (e: React.MouseEvent | MouseEvent) => {
        if (!containerRef.current || !imageRef.current || !navigatorRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const { offsetWidth: imgLayoutWidth, offsetHeight: imgLayoutHeight } = imageRef.current;
        const navRect = navigatorRef.current.getBoundingClientRect();
        const newNavX = e.clientX - navRect.left;
        const newNavY = e.clientY - navRect.top;
        const xRatio = newNavX / navRect.width;
        const yRatio = newNavY / navRect.height;
        const overhangX = Math.max(0, (imgLayoutWidth * zoom - containerRect.width) / 2);
        const overhangY = Math.max(0, (imgLayoutHeight * zoom - containerRect.height) / 2);
        const newPosX = (0.5 - xRatio) * 2 * overhangX;
        const newPosY = (0.5 - yRatio) * 2 * overhangY;
        setPosition(clampPosition({ x: newPosX, y: newPosY }, zoom));
    }

    const handleNavMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleNavAction(e);
        const moveHandler = (moveEvent: MouseEvent) => handleNavAction(moveEvent);
        const upHandler = () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
        };
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, handleNext, handlePrev]);

    if (!currentImage) return null;

    return (
        <div
            className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center select-none"
            onWheel={handleWheel}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-20 bg-gradient-to-b from-black/50 to-transparent">
                 <p className="text-sm text-slate-300 truncate pr-4">{currentImage.prompt || currentImage.alt}</p>
                 <div className="flex items-center gap-2 shrink-0">
                     <span className="font-semibold">{`${currentIndex + 1} / ${images.length}`}</span>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/20">
                        <XIcon className="w-6 h-6" />
                    </button>
                 </div>
            </div>

            <div 
                ref={containerRef}
                className="relative flex-1 w-full flex items-center justify-center p-4 md:p-12 overflow-hidden"
                onMouseMove={handleMouseMove}
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        ref={imageRef}
                        src={currentImage.src}
                        alt={currentImage.alt}
                        className="max-w-full max-h-full object-contain transition-transform duration-100"
                        style={{
                            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                        }}
                        onMouseDown={handleMouseDown}
                        draggable="false"
                    />
                </div>
            </div>
            
            <div className="relative w-full max-w-4xl p-4 text-center text-slate-300 text-sm z-20 bg-gradient-to-t from-black/50 to-transparent">
                <div className="flex justify-center items-center flex-wrap gap-3">
                    <button onClick={() => onUseImage(currentImage, 'reference')} title="作為參考圖" className="p-2 text-white cyber-button-secondary rounded-full"> <PaperClipIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onUseImage(currentImage, 'remove_bg')} title="移除背景" className="p-2 text-white cyber-button-secondary rounded-full"> <EraseIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onUseImage(currentImage, 'draw_bg')} title="設為畫布背景" className="p-2 text-white cyber-button-secondary rounded-full"> <PaintBrushIcon className="w-5 h-5" /> </button>
                    <button onClick={handleDownload} title="下載圖片" className="p-2 text-white cyber-button-secondary rounded-full"> <DownloadIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onUpscale(currentImage.src)} title="提升畫質" className="p-2 text-white cyber-button-secondary rounded-full"> <ExpandIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onZoomOut(currentImage)} title="Zoom out 2x" className="p-2 text-white cyber-button-secondary rounded-full"> <ZoomOutIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onSendImageToVeo(currentImage, 'start')} title="用於首幀" className="p-2 text-white cyber-button-secondary rounded-full"> <SendToStartFrameIcon className="w-5 h-5" /> </button>
                    <button onClick={() => onSendImageToVeo(currentImage, 'end')} title="用於尾幀" className="p-2 text-white cyber-button-secondary rounded-full"> <SendToEndFrameIcon className="w-5 h-5" /> </button>
                    <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded">{(zoom * 100).toFixed(0)}%</span>
                </div>
            </div>
            
            {zoom > 1 && imageRef.current && containerRef.current && (
                (() => {
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const { offsetWidth: imgLayoutWidth, offsetHeight: imgLayoutHeight } = imageRef.current;
                    const imgDisplayWidth = imgLayoutWidth * zoom;
                    const imgDisplayHeight = imgLayoutHeight * zoom;
                    const navWidth = 150;
                    const navHeight = navWidth * (imgLayoutHeight / imgLayoutWidth);
                    const boxWidth = (containerRect.width / imgDisplayWidth) * navWidth;
                    const boxHeight = (containerRect.height / imgDisplayHeight) * navHeight;
                    const overhangX = (imgDisplayWidth - containerRect.width) / 2;
                    const overhangY = (imgDisplayHeight - containerRect.height) / 2;
                    const viewOffsetX = overhangX - position.x;
                    const viewOffsetY = overhangY - position.y;
                    const boxLeft = (viewOffsetX / imgDisplayWidth) * navWidth;
                    const boxTop = (viewOffsetY / imgDisplayHeight) * navHeight;
                    return (
                        <div
                            ref={navigatorRef}
                            className="absolute bottom-4 right-4 bg-black/50 border-2 border-fuchsia-500/50 rounded-md overflow-hidden cursor-pointer"
                            style={{ width: navWidth, height: navHeight }}
                            onMouseDown={handleNavMouseDown}
                        >
                            <img src={currentImage.src} className="w-full h-full object-cover opacity-50" draggable="false" />
                            <div
                                className="absolute border-2 border-cyan-400 cursor-move"
                                style={{
                                    width: boxWidth,
                                    height: boxHeight,
                                    top: boxTop,
                                    left: boxLeft,
                                }}
                            />
                        </div>
                    );
                })()
            )}
            
            {images.length > 1 && (
                <>
                    <button onClick={handlePrev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 text-white bg-black/40 rounded-full hover:bg-white/20 z-10"> <ArrowLeftIcon className="w-6 h-6" /> </button>
                    <button onClick={handleNext} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 text-white bg-black/40 rounded-full hover:bg-white/20 z-10"> <ArrowRightIcon className="w-6 h-6" /> </button>
                </>
            )}
        </div>
    );
};
