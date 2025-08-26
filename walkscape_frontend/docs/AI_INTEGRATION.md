# AI Environment Detection Integration

This document explains the AI-powered environment detection feature integrated into the WalkScape application.

## Overview

The AI Environment Detection system uses Google's Gemini Vision API to automatically analyze captured images and:
- Identify the environment type (forest, urban, park, etc.)
- Suggest appropriate artifacts to claim based on the detected environment
- Auto-select the most suitable artifact type
- Provide confidence scores and detailed descriptions

## Features

### 🤖 Automatic Environment Recognition
- **Forest/Nature**: Suggests Mushrooms and Fossils
- **Urban/City**: Suggests Graffiti and Pixel Plants  
- **Parks/Gardens**: Suggests Mushrooms and Pixel Plants
- **Buildings/Indoor**: Suggests Graffiti and Pixel Plants

### 🎯 Smart Artifact Suggestions
- AI analyzes the captured image
- Suggests 1-2 most appropriate artifact types
- Auto-selects the primary suggested artifact
- Displays confidence percentage

### 🔄 Fallback System
- Tries Gemini API first (if API key provided)
- Falls back to intelligent mock analysis if API unavailable
- Graceful error handling with retry options

## Setup

### 1. Get a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key (free tier available)
3. Copy the API key

### 2. Configure Environment Variables
Add your API key to `.env.local`:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies
The required packages are already installed:
```bash
npm install @google/generative-ai
```

## Usage

### For Users
1. **Capture Photo**: Use the camera to take a photo of your surroundings
2. **AI Analysis**: The system automatically analyzes the environment
3. **Review Suggestions**: See the detected environment type and confidence
4. **Select Artifact**: Choose from AI-suggested artifacts or manually select
5. **Claim**: Proceed with claiming the artifact

### For Developers

#### Basic Usage
```typescript
import { analyzeEnvironmentWithGemini } from '@/lib/aiDetection';

const result = await analyzeEnvironmentWithGemini(imageDataUrl);
if (result.success) {
  console.log('Environment:', result.data.environment);
  console.log('Confidence:', result.data.confidence);
  console.log('Suggested artifacts:', result.data.suggestedArtifacts);
}
```

#### Custom Analysis
```typescript
import { analyzeEnvironmentWithAlternative } from '@/lib/aiDetection';

// Uses fallback analysis (works without API key)
const result = await analyzeEnvironmentWithAlternative(imageDataUrl);
```

## API Reference

### Functions

#### `analyzeEnvironmentWithGemini(imageData, apiKey?)`
Uses Google Gemini Vision API for analysis.
- **imageData**: Base64 data URL of the image
- **apiKey**: Optional API key (uses environment variable if not provided)
- **Returns**: `Promise<DetectionResult>`

#### `analyzeEnvironmentWithAlternative(imageData)`
Fallback analysis function that tries Gemini first, then mock analysis.
- **imageData**: Base64 data URL of the image
- **Returns**: `Promise<DetectionResult>`

#### `getArtifactTypeFromName(artifactName)`
Converts artifact name to enum value.
- **artifactName**: String name of artifact
- **Returns**: Number (0-3)

### Data Types

```typescript
interface EnvironmentDetection {
    environment: string;        // e.g., "forest", "urban", "park"
    confidence: number;         // 0.0 to 1.0
    suggestedArtifacts: string[]; // e.g., ["Mushroom", "Fossil"]
    description: string;        // Human-readable description
}

interface DetectionResult {
    success: boolean;
    data?: EnvironmentDetection;
    error?: string;
}
```

## Environment Mappings

| Environment | Suggested Artifacts |
|-------------|-------------------|
| Forest | Mushroom, Fossil |
| Urban | Graffiti, Pixel Plant |
| Park | Mushroom, Pixel Plant |
| Street | Graffiti, Pixel Plant |
| Nature | Mushroom, Fossil |
| Building | Graffiti, Pixel Plant |
| Garden | Mushroom, Pixel Plant |
| Grass | Mushroom, Pixel Plant |
| Trees | Mushroom, Fossil |
| Concrete | Graffiti, Pixel Plant |

## Error Handling

The system includes comprehensive error handling:

1. **No API Key**: Falls back to mock analysis
2. **API Rate Limits**: Graceful degradation to mock analysis
3. **Network Issues**: Retry mechanisms with fallback
4. **Invalid Responses**: JSON parsing with error recovery
5. **Camera Issues**: User-friendly error messages

## Performance Considerations

- **Image Size**: Images are automatically optimized for API submission
- **Caching**: Results are cached per session to avoid redundant API calls
- **Lazy Loading**: AI analysis only triggers after photo capture
- **Rate Limiting**: Built-in delays to respect API limits

## Cost Optimization

### Free Tier Usage
- Google Gemini offers a generous free tier
- Mock analysis as fallback ensures functionality without costs
- Efficient prompting reduces token usage

### Production Considerations
- Monitor API usage through Google Cloud Console
- Implement additional caching for repeated locations
- Consider batch processing for multiple images
- Set up usage alerts and quotas

## Troubleshooting

### Common Issues

1. **"AI Analysis Error"**
   - Check if API key is correctly set in `.env.local`
   - Verify API key has necessary permissions
   - Check network connectivity

2. **"No JSON found in response"**
   - Gemini occasionally returns non-JSON responses
   - System automatically falls back to mock analysis

3. **Low Confidence Scores**
   - Ensure good lighting when capturing photos
   - Take photos of clear, identifiable environments
   - Avoid blurry or unclear images

### Debug Mode
Enable detailed logging by checking browser console:
```javascript
// Look for these log messages:
// 🤖 Starting Gemini AI analysis...
// ✅ Gemini AI analysis complete:
// 🎭 Using mock AI analysis...
```

## Future Enhancements

- **Multi-language Support**: Analyze text in images for location context
- **Historical Data**: Learn from user preferences and successful claims
- **Advanced Features**: Weather detection, time of day analysis
- **Offline Mode**: Local image analysis using TensorFlow.js
- **Custom Models**: Train specialized models for game-specific environments

## Security Notes

- API keys are stored securely in environment variables
- No image data is permanently stored
- All API calls use HTTPS encryption
- Client-side processing minimizes data transmission

## Contributing

To improve the AI analysis:

1. **Add New Environments**: Update `ENVIRONMENT_MAPPINGS` in `aiDetection.ts`
2. **Improve Prompts**: Modify the Gemini prompt for better accuracy
3. **Add Fallback Services**: Integrate additional computer vision APIs
4. **Enhance UI**: Improve the analysis results display

## License

This AI integration follows the same license as the main WalkScape project.
