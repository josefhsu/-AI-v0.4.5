import React, { useRef, useEffect, useImperativeHandle, useState, forwardRef, useCallback } from 'react';
import type { DrawTool, AspectRatio, DrawingCanvasRef } from '../types';

interface DrawingCanvasProps {
    tool: DrawTool;
    brushSize: number;
    fillColor: string;
    strokeColor: string;
    backgroundColor: string;
    aspectRatio: AspectRatio | null; // Can be null initially
    backgroundImage: string | null;
}

// A simple in-memory history stack for undo functionality
const MAX_HISTORY = 20;

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
    ({ tool, brushSize, fillColor, strokeColor, backgroundColor, aspectRatio, backgroundImage }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const contextRef = useRef<CanvasRenderingContext2D | null>(null);
        const [isDrawing, setIsDrawing] = useState(false);
        const [history, setHistory] = useState<ImageData[]>([]);
        const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
        const lastSnapshot = useRef<ImageData | null>(null);
        
        const [isHovered, setIsHovered] = useState(false);
        const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
        const [centeredPreviewSize, setCenteredPreviewSize] = useState<number | null>(null);
        const previewTimeoutRef = useRef<number | null>(null);

        // Effect for centered preview on brush size change
        useEffect(() => {
            setCenteredPreviewSize(brushSize);

            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }

            previewTimeoutRef.current = window.setTimeout(() => {
                setCenteredPreviewSize(null);
            }, 2000); // Disappear after 2 seconds

            return () => {
                if (previewTimeoutRef.current) {
                    clearTimeout(previewTimeoutRef.current);
                }
            };
        }, [brushSize]);

        const getCanvasAndContext = useCallback(() => {
            const canvas = canvasRef.current;
            if (!canvas) return { canvas: null, ctx: null };
            const ctx = contextRef.current;
            return { canvas, ctx };
        }, []);

        const saveState = useCallback(() => {
            const { canvas, ctx } = getCanvasAndContext();
            if (!canvas || !ctx) return;
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory(prev => [...prev.slice(prev.length > MAX_HISTORY ? 1 : 0), data]);
        }, [getCanvasAndContext]);
        
        const redrawCanvas = useCallback(() => {
            const { canvas, ctx } = getCanvasAndContext();
            if (!canvas || !ctx) return;
            
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (backgroundImage) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = backgroundImage;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    saveState();
                };
            } else {
                 saveState();
            }
        }, [getCanvasAndContext, backgroundColor, backgroundImage, saveState]);

        useEffect(() => {
            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d');
            
            if (!canvas || !context) return;
        
            // FIX: Handle null aspectRatio to prevent crashes.
            if (!aspectRatio) {
                // Clear the canvas and show a placeholder message if no aspect ratio is selected.
                context.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = canvas.parentElement?.clientWidth || 300;
                canvas.height = canvas.parentElement?.clientHeight || 300;
                context.fillStyle = '#333';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = '#888';
                context.textAlign = 'center';
                context.font = '16px sans-serif';
                context.fillText('請先在左側選擇畫布比例', canvas.width / 2, canvas.height / 2);
                contextRef.current = null; // Invalidate context to prevent drawing
                return;
            }

            const [w, h] = aspectRatio.split(':').map(Number);
            const parent = canvas.parentElement;
            if (!parent) return;

            const parentWidth = parent.clientWidth;
            const parentHeight = parent.clientHeight;
            
            const parentRatio = parentWidth / parentHeight;
            const canvasRatio = w / h;

            if (parentRatio > canvasRatio) {
                canvas.height = parentHeight;
                canvas.width = parentHeight * canvasRatio;
            } else {
                canvas.width = parentWidth;
                canvas.height = parentWidth / canvasRatio;
            }
            
            context.lineCap = 'round';
            context.lineJoin = 'round';
            contextRef.current = context;
            
            setHistory([]);
            redrawCanvas();
            
        }, [aspectRatio, redrawCanvas]);
        
        useEffect(() => {
            redrawCanvas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [backgroundColor, backgroundImage]);
        
        const getMousePosOnCanvas = (e: React.MouseEvent): { x: number, y: number } => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        
        const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            const container = e.currentTarget;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        };

        const startDrawing = (e: React.MouseEvent) => {
            const { ctx } = getCanvasAndContext();
            if (!ctx) return; // Don't draw if context is not ready (no aspect ratio)
            const { x, y } = getMousePosOnCanvas(e);
            
            saveState();
            setIsDrawing(true);
            
            if (tool === 'brush') {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                const { canvas } = getCanvasAndContext();
                if (!canvas) return;
                lastSnapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setStartPoint({ x, y });
            }
        };

        const draw = (e: React.MouseEvent) => {
            if (!isDrawing) return;
            const { ctx } = getCanvasAndContext();
            if (!ctx) return;
            const { x, y } = getMousePosOnCanvas(e);

            ctx.lineWidth = brushSize;
            ctx.strokeStyle = strokeColor;
            ctx.fillStyle = fillColor;

            if (tool === 'brush') {
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (startPoint) {
                 if (lastSnapshot.current) {
                    ctx.putImageData(lastSnapshot.current, 0, 0);
                }
                ctx.beginPath();
                const dx = x - startPoint.x;
                const dy = y - startPoint.y;

                switch (tool) {
                    case 'rectangle':
                        ctx.rect(startPoint.x, startPoint.y, dx, dy);
                        break;
                    case 'circle':
                        const radius = Math.sqrt(dx * dx + dy * dy);
                        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
                        break;
                    case 'arrow':
                        const headlen = Math.max(10, brushSize * 2);
                        const angle = Math.atan2(dy, dx);
                        ctx.moveTo(startPoint.x, startPoint.y);
                        ctx.lineTo(x, y);
                        ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
                        ctx.moveTo(x, y);
                        ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
                        break;
                }
                if (fillColor !== 'transparent') ctx.fill();
                if (brushSize > 0) ctx.stroke();
            }
        };

        const stopDrawing = () => {
            if (!isDrawing) return;
            setIsDrawing(false);
            setStartPoint(null);
            lastSnapshot.current = null;
        };

        const clearCanvas = () => {
             const { canvas, ctx } = getCanvasAndContext();
             if (!canvas || !ctx || !aspectRatio) return;
             ctx.clearRect(0, 0, canvas.width, canvas.height);
             setHistory([]);
             redrawCanvas();
        };

        const undo = () => {
            if (!aspectRatio) return;
            if (history.length <= 1) { 
                clearCanvas();
                return;
            }
            const { canvas, ctx } = getCanvasAndContext();
            if (!canvas || !ctx) return;
            const lastState = history[history.length - 2];
            ctx.putImageData(lastState, 0, 0);
            setHistory(prev => prev.slice(0, prev.length - 1));
        };
        
        useImperativeHandle(ref, () => ({
            exportImage: () => {
                const canvas = canvasRef.current;
                return canvas && aspectRatio ? canvas.toDataURL('image/png') : '';
            },
            clear: clearCanvas,
            undo,
        }));

        return (
            <div 
                className="w-full h-full flex items-center justify-center relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleContainerMouseMove}
            >
                 <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="rounded-lg shadow-lg"
                 />
                 
                 {centeredPreviewSize !== null && aspectRatio && (
                     <div 
                        className="absolute bg-transparent rounded-full pointer-events-none border border-dashed border-cyan-400"
                        style={{
                            width: centeredPreviewSize,
                            height: centeredPreviewSize,
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%)`,
                        }}
                     />
                 )}
                 
                 {isHovered && tool === 'brush' && aspectRatio && (
                     <div 
                        className="absolute bg-transparent rounded-full pointer-events-none border border-dashed border-white/50"
                        style={{ 
                            width: brushSize, 
                            height: brushSize, 
                            left: mousePosition.x,
                            top: mousePosition.y,
                            transform: `translate(-50%, -50%)`,
                        }}
                     />
                 )}
            </div>
        );
    }
);