/**
 * AI-powered environment detection using Google Gemini Vision API
 * This service analyzes captured images to automatically detect environment types
 * and suggest appropriate artifacts to claim.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface EnvironmentDetection {
    environment: string;
    confidence: number;
    suggestedArtifacts: string[];
    description: string;
}

export interface DetectionResult {
    success: boolean;
    data?: EnvironmentDetection;
    error?: string;
}

// Environment types and their associated artifacts
const ENVIRONMENT_MAPPINGS: Record<string, string[]> = {
    'forest': ['Mushroom', 'Fossil'],
    'urban': ['Graffiti', 'Pixel Plant'],
    'park': ['Mushroom', 'Pixel Plant'],
    'street': ['Graffiti', 'Pixel Plant'],
    'nature': ['Mushroom', 'Fossil'],
    'building': ['Graffiti', 'Pixel Plant'],
    'garden': ['Mushroom', 'Pixel Plant'],
    'outdoor': ['Fossil', 'Pixel Plant'],
    'indoor': ['Graffiti', 'Pixel Plant'],
    'grass': ['Mushroom', 'Pixel Plant'],
    'trees': ['Mushroom', 'Fossil'],
    'concrete': ['Graffiti', 'Pixel Plant'],
    'pavement': ['Graffiti', 'Pixel Plant'],
    'plants': ['Mushroom', 'Pixel Plant'],
    'flowers': ['Mushroom', 'Pixel Plant'],
    'rocks': ['Fossil', 'Pixel Plant'],
    'dirt': ['Mushroom', 'Fossil'],
    'water': ['Fossil', 'Pixel Plant'],
    'sky': ['Pixel Plant', 'Fossil']
};

/**
 * Convert base64 data URL to just the base64 string
 */
function extractBase64FromDataUrl(dataUrl: string): string {
    return dataUrl.split(',')[1];
}

/**
 * Analyze image using Google Gemini Vision API
 */
export async function analyzeEnvironmentWithGemini(
    imageData: string,
    apiKey?: string
): Promise<DetectionResult> {
    try {
        // Use environment variable if no API key provided
        const geminiApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!geminiApiKey) {
            console.warn('No Gemini API key provided, falling back to mock analysis');
            return analyzeEnvironmentMock(imageData);
        }

        console.log('🤖 Starting Gemini AI analysis...');

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Extract base64 from data URL
        const base64Image = extractBase64FromDataUrl(imageData);

        const prompt = `Analyze this image and identify the environment type for a location-based game. 

Look for these key elements:
- Natural environments: forests, parks, gardens, trees, grass, flowers, dirt, rocks
- Urban environments: buildings, streets, pavement, concrete, graffiti, city infrastructure
- Indoor vs outdoor settings
- Specific features that would indicate what type of collectible artifacts might be found here

Respond with a JSON object in this exact format:
{
  "environment": "single_word_environment_type",
  "confidence": 0.85,
  "description": "brief description of what you see in the image",
  "keyFeatures": ["list", "of", "key", "visual", "elements"]
}

Choose environment from: forest, urban, park, street, nature, building, garden, outdoor, indoor, grass, trees, concrete, pavement, plants, flowers, rocks, dirt, water, sky

Be specific and confident in your analysis.`;

        const contents = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image,
                },
            },
            { text: prompt },
        ];

        const response = await model.generateContent(contents);
        const responseText = response.response.text();

        console.log('🤖 Gemini raw response:', responseText);

        // Parse the JSON response
        let analysis;
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', parseError);
            console.log('Raw response:', responseText);
            // Fall back to mock analysis
            return analyzeEnvironmentMock(imageData);
        }

        // Validate and format the response
        const environment = analysis.environment?.toLowerCase() || 'outdoor';
        const confidence = Math.min(Math.max(analysis.confidence || 0.7, 0.1), 1.0);
        const description = analysis.description || 'Environment analysis complete';

        const result: EnvironmentDetection = {
            environment,
            confidence,
            suggestedArtifacts: ENVIRONMENT_MAPPINGS[environment] || ['Pixel Plant', 'Fossil'],
            description
        };

        console.log('✅ Gemini AI analysis complete:', result);

        return {
            success: true,
            data: result
        };

    } catch (error: unknown) {
        const err = error as Error;
        console.error('❌ Gemini AI analysis failed:', err);

        // Fall back to mock analysis if Gemini fails
        console.log('🔄 Falling back to mock analysis...');
        return analyzeEnvironmentMock(imageData);
    }
}

/**
 * Alternative analysis using mock data (as fallback)
 */
async function analyzeEnvironmentMock(imageData: string): Promise<DetectionResult> {
    console.log('🎭 Using mock AI analysis...');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple mock logic with reasonable variety
    const environments = [
        { env: 'forest', weight: 3 },
        { env: 'urban', weight: 3 },
        { env: 'park', weight: 2 },
        { env: 'nature', weight: 2 },
        { env: 'garden', weight: 2 },
        { env: 'street', weight: 2 },
        { env: 'building', weight: 1 }
    ];

    // Weighted random selection
    const totalWeight = environments.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedEnv = 'outdoor';

    for (const item of environments) {
        random -= item.weight;
        if (random <= 0) {
            selectedEnv = item.env;
            break;
        }
    }

    const descriptions: Record<string, string> = {
        'forest': 'Dense forest area with trees and natural vegetation',
        'urban': 'Urban environment with buildings and city infrastructure',
        'park': 'Public park area with maintained greenery and pathways',
        'street': 'Street environment with pavement and urban features',
        'nature': 'Natural outdoor environment with organic elements',
        'building': 'Architectural structure in urban setting',
        'garden': 'Cultivated garden area with plants and landscaping'
    };

    const result: EnvironmentDetection = {
        environment: selectedEnv,
        confidence: 0.6 + Math.random() * 0.3, // 60-90% confidence for mock
        suggestedArtifacts: ENVIRONMENT_MAPPINGS[selectedEnv] || ['Pixel Plant'],
        description: descriptions[selectedEnv] || 'Outdoor environment detected'
    };

    return {
        success: true,
        data: result
    };
}

/**
 * Main analysis function that tries Gemini first, falls back to mock
 */
export async function analyzeEnvironmentWithAlternative(
    imageData: string
): Promise<DetectionResult> {
    // Try Gemini first
    const geminiResult = await analyzeEnvironmentWithGemini(imageData);

    // If Gemini fails completely (not just falling back to mock), try other methods
    if (!geminiResult.success) {
        console.log('🔄 Gemini failed, trying alternative analysis...');
        return analyzeEnvironmentMock(imageData);
    }

    return geminiResult;
}

/**
 * Convert artifact name to artifact type enum
 */
export function getArtifactTypeFromName(artifactName: string): number {
    const mapping = {
        'Mushroom': 0,
        'Fossil': 1,
        'Graffiti': 2,
        'Pixel Plant': 3
    };
    return mapping[artifactName as keyof typeof mapping] ?? 0;
}

/**
 * Get confidence-based styling for UI
 */
export function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-gray-400';
}

/**
 * Format confidence percentage for display
 */
export function formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
}
