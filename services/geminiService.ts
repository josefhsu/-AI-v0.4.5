import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import type { AspectRatio, GeneratedImage, UploadedImage, VeoAspectRatio, VeoHistoryItem, VeoParams, Toast } from "../types";
import { fileToBase64, generateVideoThumbnail, dataURLtoFile } from "../utils";
import { EDITING_EXAMPLES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GENERAL_MODEL = 'gemini-2.5-flash';
const IMAGE_GEN_MODEL = 'imagen-4.0-generate-001';
const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image-preview';
const VIDEO_GEN_MODEL = 'veo-2.0-generate-001';


export const generateImages = async (
    prompt: string,
    aspectRatio: AspectRatio,
    referenceImages: UploadedImage[],
    numberOfImages: number = 4
): Promise<GeneratedImage[]> => {
    
    if (referenceImages.length > 0) {
        const parts: Part[] = [];

        // The calling function in App.tsx ensures the placeholder is at referenceImages[0].
        // We make it the first part, followed by the prompt, then other reference images.
        // This structure gives the model a clear instruction on the canvas and content.
        const canvasImage = referenceImages[0];
        parts.push({
            inlineData: {
                data: await fileToBase64(canvasImage.file),
                mimeType: canvasImage.file.type,
            },
        });
        
        parts.push({ text: prompt });

        for (let i = 1; i < referenceImages.length; i++) {
            const img = referenceImages[i];
            parts.push({
                inlineData: {
                    data: await fileToBase64(img.file),
                    mimeType: img.file.type,
                },
            });
        }

        const response = await ai.models.generateContent({
            model: IMAGE_EDIT_MODEL,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const generated: GeneratedImage[] = [];
        const responseParts = response?.candidates?.[0]?.content?.parts;

        if (responseParts) {
            for (const part of responseParts) {
                if (part.inlineData) {
                     generated.push({
                        id: crypto.randomUUID(),
                        src: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                        alt: prompt,
                        prompt: prompt,
                    });
                }
            }
        }
        
        if (generated.length === 0) throw new Error("模型未返回圖像。請求可能因安全政策而被阻止。");
        return generated.slice(0, 1);

    } else {
        const response = await ai.models.generateImages({
            model: IMAGE_GEN_MODEL,
            prompt: prompt,
            config: {
                numberOfImages,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio as any,
            },
        });
    
        return response.generatedImages.map(img => ({
            id: crypto.randomUUID(),
            src: `data:image/png;base64,${img.image.imageBytes}`,
            alt: prompt,
            prompt: prompt,
        }));
    }
};

const getSingleSuggestion = async (file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;
    const editingGuideString = JSON.stringify(EDITING_EXAMPLES);

    try {
        const response = await ai.models.generateContent({
            model: GENERAL_MODEL,
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: `Analyze this image and the provided editing guide. Choose the single most fitting editing suggestion from the editing guide that would be a creative and interesting modification. Respond in Traditional Chinese. Return a JSON object with a single key: "suggestion". Editing Guide: ${editingGuideString}` },
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING, description: 'The editing suggestion chosen from the guide in Traditional Chinese.' }
                    },
                    propertyOrdering: ["suggestion"]
                }
            }
        });
        const json = JSON.parse(response.text.trim());
        return json.suggestion;
    } catch (e) {
        console.error("Failed to parse single suggestion:", e);
        return "更換背景為未來城市"; // Fallback suggestion
    }
};

export const getBatchSuggestions = async (files: File[]): Promise<string[]> => {
    const suggestionPromises = files.map(file => getSingleSuggestion(file));
    const suggestions = await Promise.all(suggestionPromises);
    return suggestions;
};

export const getEditingSuggestion = async (file: File): Promise<{ analysis_prompt: string, suggestion: string }> => {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;
    const editingGuideString = JSON.stringify(EDITING_EXAMPLES);

    const response = await ai.models.generateContent({
        model: GENERAL_MODEL,
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: `Analyze this image and the provided editing guide.
                1. First, create a detailed and descriptive base prompt in Traditional Chinese that could be used to generate this image. This is the "analysis prompt".
                2. Second, based on the image, choose the single most fitting editing suggestion from the editing guide that would be a creative and interesting modification.
                
                Editing Guide: ${editingGuideString}
                
                Return a JSON object with two keys: "analysis_prompt" (the descriptive base prompt you created) and "suggestion" (the exact editing prompt string chosen from the guide).` },
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analysis_prompt: { type: Type.STRING, description: '基於圖片分析生成的詳細中文提示詞' },
                    suggestion: { type: Type.STRING, description: '從指南中選擇的最推薦的改圖提示' }
                },
                propertyOrdering: ["analysis_prompt", "suggestion"]
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const json = JSON.parse(jsonText);
        if (json.analysis_prompt && json.suggestion) {
            return json;
        }
        throw new Error("Invalid JSON structure in suggestion response.");
    } catch (e) {
        console.error("Failed to parse suggestion JSON:", e, "Raw response:", response.text);
        throw new Error("Failed to get a valid editing suggestion from the AI.");
    }
};

export const getNCLCharacterDescription = async (file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;
    
    const response = await ai.models.generateContent({
        model: GENERAL_MODEL,
        contents: {
            parts: [
                 { inlineData: { data: base64Data, mimeType } },
                 { text: "Analyze this image of a person. Create a detailed, third-person character description suitable for a Cyberpunk universe text-to-image prompt. Describe their appearance, clothing, cyberware, and implied attitude. The response should be in Traditional Chinese and only contain the description itself." },
            ]
        }
    });

    return response.text.trim();
};


export const removeBackground = async (file: File, addGreenScreen: boolean): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;
    
    const prompt = `Remove the background, leaving only the main subject. The new background should be ${addGreenScreen ? 'a solid green screen color (#00b140)' : 'transparent'}.`;

    const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const responseParts = response?.candidates?.[0]?.content?.parts;
    if (responseParts) {
        for (const part of responseParts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    
    throw new Error('移除背景服務未返回圖像。請求可能因安全政策而被阻止。');
};

export const optimizePrompt = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: GENERAL_MODEL,
        contents: `Optimize this image generation prompt to be more vivid, detailed, and effective for a text-to-image AI. Return only the optimized prompt in Traditional Chinese, without any introductory text. Original prompt: "${prompt}"`,
    });
    return response.text.trim();
};

export const inspirePrompt = async (): Promise<string> => {
    const response = await ai.models.generateContent({
        model: GENERAL_MODEL,
        contents: '為 AI 圖像生成器創建一個隨機、有創意且視覺上有趣的繁體中文提示詞。提示詞應該是一個單一句子或一個簡短的段落。不要使用 markdown 或引號。',
    });
    return response.text.trim();
};

export const analyzeImage = async (file: File): Promise<{ score: string; analysis: string }> => {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await ai.models.generateContent({
        model: GENERAL_MODEL,
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType: mimeType } },
                { text: '對這張圖片進行美感分析。提供一個滿分100分的分數，並對其構圖、光影、色彩和主題進行簡潔且具建設性的分析。請用繁體中文回答。' },
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.STRING, description: '美感分數（0-100）' },
                    analysis: { type: Type.STRING, description: '繁體中文的美感分析文字' }
                }
            }
        }
    });

    try {
        const json = JSON.parse(response.text.trim());
        return { score: json.score, analysis: json.analysis };
    } catch (e) {
        console.error("Failed to parse analysis JSON:", e, "Raw response:", response.text);
        throw new Error("Failed to get a valid analysis from the AI.");
    }
};

export const enhanceWebcamImage = async (file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType: mimeType } },
                { text: 'Isolate the person in this image. Focus exclusively on their face. Enhance the lighting, clarity, and skin tones of the face to achieve a professional, studio-portrait quality. Ignore everything else in the image.' },
            ],
        },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    const responseParts = response?.candidates?.[0]?.content?.parts;
    if (responseParts) {
        for (const part of responseParts) {
            if (part.inlineData) return part.inlineData.data;
        }
    }
    throw new Error('Image enhancement failed to return an image.');
};

export const upscaleImage = async (file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                { text: 'Upscale this image, increasing its resolution and enhancing details without altering the content. Make it sharper and clearer.' },
            ],
        },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    const responseParts = response?.candidates?.[0]?.content?.parts;
    if (responseParts) {
        for (const part of responseParts) {
            if (part.inlineData) return part.inlineData.data;
        }
    }
    throw new Error('Upscaling failed to return an image.');
};

export const zoomOutImage = async (file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                { text: 'Zoom out from this image by 2x, intelligently filling in the new surrounding areas to create a wider scene. Maintain the original style and content.' },
            ],
        },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    
    const responseParts = response?.candidates?.[0]?.content?.parts;
    if (responseParts) {
        for (const part of responseParts) {
            if (part.inlineData) return part.inlineData.data;
        }
    }
    throw new Error('Zoom out failed to return an image.');
};

// --- VEO Services ---

export const describeImageForVideo = async (file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);
    const response = await ai.models.generateContent({
        model: GENERAL_MODEL,
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                { text: `為 Veo 2 AI 影片模型分析這張圖片，並為其設計一個開場腳本的專業級提示詞。你的回答必須只包含該提示詞，禁止加入任何如「好的，作為一位專業電影導演...」之類的前導文字或引號。腳本應包含：[主體描述]，在[場景背景]中，[動作與姿態]，[表情情緒]，穿著[服飾與配件]，周圍環繞著[環境細節與物件]，使用[藝術風格]，[光影效果]，[構圖與視角]，整體呈現[色調與質感]、[角色動作運動]、[鏡頭運動]。` }
            ]
        }
    });
    return response.text.trim().replace(/^"|"$/g, '');
};

export const createDirectorScript = async (startFile: File, endFile: File): Promise<string> => {
    const startBase64 = await fileToBase64(startFile);
    const endBase64 = await fileToBase64(endFile);
    
    const response = await ai.models.generateContent({
        model: GENERAL_MODEL,
        contents: {
            parts: [
                { text: "根據「開頭場景」和「結尾場景」這兩張參考圖，構思一個從開頭自然蛻變到結尾的連續鏡頭故事腳本。影片的最後一幀畫面必須完全變成『結尾場景』的樣子。你的回答必須只包含該專業的導演級腳本，禁止加入任何前導文字或引號。腳本應描述這個過程，包含鏡頭運動和角色動態。" },
                { text: "開頭場景：" },
                { inlineData: { data: startBase64, mimeType: startFile.type } },
                { text: "結尾場景：" },
                { inlineData: { data: endBase64, mimeType: endFile.type } }
            ]
        }
    });
    return response.text.trim().replace(/^"|"$/g, '');
};

export const generateVeoVideo = async (params: VeoParams, addToast: (message: string, type?: Toast['type']) => void): Promise<VeoHistoryItem> => {
    addToast('開始生成影片，這可能需要幾分鐘...', 'info');
    
    // The composite image approach by stitching start and end frames might confuse the VEO model.
    // A more reliable method is to provide only the start frame (if available) and use a detailed prompt
    // to describe the transition to the end frame. The AI Director already generates such a prompt.
    
    let aspectRatioInstruction = '';
    switch (params.aspectRatio) {
        case '16:9':
            aspectRatioInstruction = '影片長寬比必須為 16:9。';
            break;
        case '9:16':
            aspectRatioInstruction = '影片長寬比必須為 9:16。';
            break;
        case '1:1':
            aspectRatioInstruction = '影片長寬比必須為 1:1。';
            break;
    }

    const endFrameInstruction = params.endFrame ? `\n\n重點：影片的最後一幀畫面，必須完全符合『結尾場景』。` : '';
    
    const finalPrompt = `${aspectRatioInstruction} ${params.prompt}${endFrameInstruction}`;

    // The VEO API accepts a single image. We prioritize the start frame,
    // as the prompt is designed to guide the generation from that starting point.
    const imageForApi = params.startFrame || params.endFrame;

    let operation = await ai.models.generateVideos({
        model: VIDEO_GEN_MODEL,
        prompt: finalPrompt,
        image: imageForApi ? {
            imageBytes: await fileToBase64(imageForApi.file),
            mimeType: imageForApi.file.type,
        } : undefined,
        config: {
            numberOfVideos: 1,
        }
    });
    
    addToast('影片請求已提交，正在處理中...', 'info');

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
        // The progressPercentage can be of type 'unknown' from the SDK. Cast it to a number before use.
        const progress = Number((operation.metadata as any)?.progressPercentage) || 0;
        addToast(`影片生成進度: ${Math.round(progress)}%`, 'info');
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was provided.");
    }
    
    addToast('影片生成完畢，正在獲取縮圖...', 'success');
    
    const videoUrlWithKey = `${downloadLink}&key=${process.env.API_KEY}`;
    const thumbnailUrl = await generateVideoThumbnail(videoUrlWithKey);

    return {
        ...params,
        id: crypto.randomUUID(),
        videoUrl: videoUrlWithKey,
        thumbnailUrl,
        timestamp: Date.now(),
    };
};