import type { AspectRatio, VeoAspectRatio } from './types';

/**
 * Downloads an image from a data URL or blob URL.
 * @param url The URL of the image to download.
 * @param filename The desired filename for the downloaded image.
 */
export const downloadImage = (url: string, filename: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Converts a data URL string to a File object.
 * @param dataUrl The data URL to convert.
 * @param filename The desired filename for the new File object.
 * @returns A File object.
 */
export const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error("Invalid data URL: MIME type not found.");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

/**
 * Converts a File to a base64 encoded string (without the data URL prefix).
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as base64 string.'));
        }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Gets the MIME type from a data URL.
 * @param dataUrl The data URL.
 * @returns The MIME type string.
 */
export const getMimeTypeFromDataUrl = (dataUrl: string): string => {
    const mimeMatch = dataUrl.match(/data:(.*?);/);
    if (!mimeMatch) {
        throw new Error("Invalid data URL: MIME type not found.");
    }
    return mimeMatch[1];
};

/**
 * Creates a placeholder image with a solid color and specific aspect ratio.
 * @param aspectRatio The desired aspect ratio (e.g., '1:1', '16:9').
 * @param color The background color of the placeholder.
 * @returns A data URL string of the generated image.
 */
export const createPlaceholderImage = (aspectRatio: AspectRatio, color: string): string => {
    const [w, h] = aspectRatio.split(':').map(Number);
    // Use a small base size for efficiency
    const canvasWidth = w * 100;
    const canvasHeight = h * 100;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    return canvas.toDataURL('image/png');
};

/**
 * Gets the dimensions of an image from its data URL.
 * @param dataUrl The data URL of the image.
 * @returns A promise that resolves with the width and height of the image.
 */
export const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = (err) => {
            reject(err);
        };
        img.src = dataUrl;
    });
};

/**
 * Calculates the file size in bytes from a base64 string.
 * @param dataUrl The full data URL string.
 * @returns The size of the decoded data in bytes.
 */
export const getFileSizeFromBase64 = (dataUrl: string): number => {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return 0;
    const padding = (base64.match(/={1,2}$/) || []).length;
    return (base64.length * 3 / 4) - padding;
};

/**
 * Formats a size in bytes to a human-readable string (B, KB, MB).
 * @param bytes The size in bytes.
 * @returns A formatted string.
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
};

/**
 * Calculates the aspect ratio from width and height.
 * @param width The width.
 * @param height The height.
 * @returns A string representing the simplified aspect ratio (e.g., "16:9").
 */
export const getAspectRatio = (width: number, height: number): string => {
    if (height === 0) return `${width}:0`;
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
};

/**
 * Crops an image from a data URL to a specific aspect ratio, centered.
 * @param dataUrl The source image data URL.
 * @param aspectRatio The target aspect ratio string (e.g., '16:9').
 * @returns A promise that resolves with the cropped image as a data URL.
 */
export const cropImageToAspectRatio = (
    dataUrl: string,
    aspectRatio: AspectRatio | VeoAspectRatio
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const originalWidth = img.width;
            const originalHeight = img.height;
            const originalRatio = originalWidth / originalHeight;

            const [targetW, targetH] = aspectRatio.split(':').map(Number);
            const targetRatio = targetW / targetH;

            let cropWidth: number, cropHeight: number, cropX: number, cropY: number;

            if (originalRatio > targetRatio) {
                // Original image is wider than target, so crop the width
                cropHeight = originalHeight;
                cropWidth = originalHeight * targetRatio;
                cropX = (originalWidth - cropWidth) / 2;
                cropY = 0;
            } else {
                // Original image is taller than or equal to target, so crop the height
                cropWidth = originalWidth;
                cropHeight = originalWidth / targetRatio;
                cropX = 0;
                cropY = (originalHeight - cropHeight) / 2;
            }

            const canvas = document.createElement('canvas');
            canvas.width = cropWidth;
            canvas.height = cropHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Could not get canvas context for cropping.'));
            }

            ctx.drawImage(
                img,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => {
            const errorMessage = typeof err === 'string' ? err : (err instanceof Event ? 'Image load event error' : 'Unknown image load error');
            reject(new Error(`Failed to load image for cropping: ${errorMessage}`));
        };
        img.src = dataUrl;
    });
};


// --- VEO Utils ---

/**
 * Creates a composite image by placing two images side-by-side.
 * @param startImgSrc Source of the first image.
 * @param endImgSrc Source of the second image.
 * @returns A promise resolving to an object with the data URL and MIME type.
 */
export const createCompositeImage = (startImgSrc: string, endImgSrc: string): Promise<{ dataUrl: string; mimeType: 'image/png' }> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        const img1 = new Image();
        const img2 = new Image();
        img1.crossOrigin = 'anonymous';
        img2.crossOrigin = 'anonymous';

        let img1Loaded = false;
        let img2Loaded = false;

        const onBothLoaded = () => {
            const maxHeight = Math.max(img1.height, img2.height);
            const totalWidth = img1.width + img2.width;
            canvas.width = totalWidth;
            canvas.height = maxHeight;
            
            ctx.drawImage(img1, 0, 0);
            ctx.drawImage(img2, img1.width, 0);

            resolve({
                dataUrl: canvas.toDataURL('image/png'),
                mimeType: 'image/png'
            });
        };

        img1.onload = () => {
            img1Loaded = true;
            if (img2Loaded) onBothLoaded();
        };
        img2.onload = () => {
            img2Loaded = true;
            if (img1Loaded) onBothLoaded();
        };

        img1.onerror = reject;
        img2.onerror = reject;

        img1.src = startImgSrc;
        img2.src = endImgSrc;
    });
};

/**
 * Generates a thumbnail from a video URL by fetching it as a blob to avoid CORS issues.
 * @param videoUrl The URL of the video (requires API key).
 * @returns A promise that resolves to a base64 data URL of the thumbnail.
 */
export const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const video = document.createElement('video');
        video.muted = true;
        video.preload = 'metadata'; // We only need metadata and the first frame

        let objectUrl: string | null = null;
        
        const cleanup = () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            video.remove();
        };
        
        try {
            // Step 1: Fetch the video data as a blob
            const response = await fetch(videoUrl);
            if (!response.ok) {
                let errorBody = 'No details available.';
                try { errorBody = await response.text(); } catch {}
                throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}. Body: ${errorBody}`);
            }
            const videoBlob = await response.blob();

            // Step 2: Create an object URL from the blob
            objectUrl = URL.createObjectURL(videoBlob);
            video.src = objectUrl;

            video.onloadeddata = () => {
                // Seeking to 0 can sometimes be unreliable. A small offset is often safer.
                video.currentTime = 0.1;
            };

            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    cleanup();
                    return reject('Could not get canvas context');
                }
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                cleanup();
                resolve(dataUrl);
            };

            // Fix: Type-safely handle the `onerror` event, which can receive a string or an Event.
            video.onerror = (e) => {
                cleanup();
                const videoElement = (e instanceof Event) ? (e.target as HTMLVideoElement) : null;
                const errorMessage = videoElement?.error?.message || (typeof e === 'string' ? e : 'Unknown video error');
                reject(`Error loading video for thumbnail generation: ${errorMessage}`);
            };

            // Start loading the video data
            video.load();

        } catch (error) {
            cleanup();
            reject(error);
        }
    });
};

/**
 * Asynchronously downloads a video from a remote URL.
 * This is necessary to bypass CORS restrictions on direct downloads.
 * @param url The URL of the video to download.
 * @param filename The desired filename for the downloaded video.
 */
export const downloadVideoFromUrl = async (url: string, filename: string): Promise<void> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
};