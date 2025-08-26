'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getContract, ArtifactType } from '@/lib/web3';
import { keccak256, toUtf8Bytes } from 'ethers';
import Webcam from 'react-webcam';
import Image from 'next/image';
import {
    QrCode,
    MapPin,
    Camera,
    Loader2,
    CheckCircle,
    AlertCircle,
    Zap,
    Gem,
    Palette,
    Bone,
    Sprout,
    RefreshCw,
    Image as ImageIcon,
    Download,
    Brain
} from 'lucide-react';
import {
    analyzeEnvironmentWithGemini,
    getArtifactTypeFromName,
    getConfidenceColor,
    formatConfidence,
    EnvironmentDetection
} from '@/lib/aiDetection';

// Helper: deterministic-ish bytes32 location hash (lat,lng,salt, rounded precision)
const generateLocationHash = (lat: number, lng: number, salt: string): string => {
    const precision = 6;
    const normalizedLat = Math.round(lat * 10 ** precision);
    const normalizedLng = Math.round(lng * 10 ** precision);
    const raw = `${normalizedLat}:${normalizedLng}:${salt}`;
    return keccak256(toUtf8Bytes(raw)); // returns 0x... bytes32
};

export default function ArtifactScanner() {
    const { provider, address, refreshPlayerStats, isRegistered } = useWallet();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [selectedArtifactType, setSelectedArtifactType] = useState<ArtifactType>(ArtifactType.MUSHROOM);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    // AI Environment Detection state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [environmentDetection, setEnvironmentDetection] = useState<EnvironmentDetection | null>(null);
    const [aiDetectionError, setAiDetectionError] = useState<string | null>(null);

    // Enhanced location request with comprehensive error handling and fallback strategies
    const requestLocation = useCallback(async () => {
        setIsLoadingLocation(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            setIsLoadingLocation(false);
            return;
        }

        // Define options for different accuracy levels
        const highAccuracyOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 30000
        };

        // Success handler
        const onSuccess = (position: GeolocationPosition) => {
            const { latitude, longitude, accuracy } = position.coords;
            setLocation({
                lat: latitude,
                lng: longitude
            });
            setLocationError(null);
            setIsLoadingLocation(false);
            console.log(`Location obtained: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
        };

        // Enhanced error handler
        const onError = (error: GeolocationPositionError) => {
            console.error('Geolocation error:', {
                code: error.code,
                message: error.message,
                PERMISSION_DENIED: error.PERMISSION_DENIED,
                POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
                TIMEOUT: error.TIMEOUT
            });
            let errorMessage = 'Unable to get your location';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied. Please enable location services in your device settings and refresh the page.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable. This can happen indoors or in areas with poor GPS signal. Try moving to an open area or enabling Wi-Fi location services.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out. Please try again.';
                    break;
                default:
                    errorMessage = 'Failed to get location. Please check your device settings and try again.';
            }

            setLocationError(errorMessage);
            setIsLoadingLocation(false);
        };

        // Try high accuracy first
        try {
            navigator.geolocation.getCurrentPosition(onSuccess, onError, highAccuracyOptions);
        } catch (syncError) {
            console.error('Synchronous geolocation error:', syncError);
            setLocationError('Failed to initialize location services. Please check your browser settings.');
            setIsLoadingLocation(false);
        }
    }, []);

    // AI Environment Analysis
    const analyzeEnvironment = useCallback(async (imageData: string) => {
        setIsAnalyzing(true);
        setAiDetectionError(null);
        setEnvironmentDetection(null);

        try {
            console.log('🤖 Starting Gemini AI environment analysis...');

            // Try Gemini AI first with your API key
            const result = await analyzeEnvironmentWithGemini(imageData);

            if (result.success && result.data) {
                setEnvironmentDetection(result.data);
                console.log('✅ Gemini AI Analysis complete:', result.data);

                // Auto-select the first suggested artifact
                if (result.data.suggestedArtifacts.length > 0) {
                    const suggestedType = getArtifactTypeFromName(result.data.suggestedArtifacts[0]);
                    setSelectedArtifactType(suggestedType as ArtifactType);
                    console.log('🎯 Auto-selected artifact type:', result.data.suggestedArtifacts[0]);
                }
            } else {
                setAiDetectionError(result.error || 'Failed to analyze environment');
                console.error('❌ Gemini AI Analysis failed:', result.error);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'AI analysis error';
            setAiDetectionError(errorMessage);
            console.error('❌ AI Analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);


    // Enhanced camera capture using webcam
    const capturePhoto = useCallback(async () => {
        setIsCapturing(true);

        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setCapturedImage(imageSrc);
                console.log('Photo captured successfully');

                // Automatically analyze the captured image
                await analyzeEnvironment(imageSrc);
            }
        }

        setIsCapturing(false);
    }, [analyzeEnvironment]);

    // Manual AI analysis trigger
    const triggerManualAnalysis = useCallback(async () => {
        if (capturedImage) {
            await analyzeEnvironment(capturedImage);
        }
    }, [capturedImage, analyzeEnvironment]);

    // Enhanced camera error handling
    const handleCameraError = useCallback((error: string | DOMException) => {
        console.error('Camera error:', error);
        let errorMessage = 'Failed to access camera';

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error instanceof DOMException) {
            switch (error.name) {
                case 'NotAllowedError':
                    errorMessage = 'Camera access denied. Please allow camera permissions and refresh the page.';
                    break;
                case 'NotFoundError':
                    errorMessage = 'No camera found. Please connect a camera device.';
                    break;
                case 'NotSupportedError':
                    errorMessage = 'Camera not supported by this browser.';
                    break;
                case 'NotReadableError':
                    errorMessage = 'Camera is already in use by another application.';
                    break;
                case 'OverconstrainedError':
                    errorMessage = 'Camera constraints cannot be satisfied.';
                    break;
                default:
                    errorMessage = `Camera error: ${error.message}`;
            }
        }

        setCameraError(errorMessage);
        setIsCameraActive(false);
    }, []);

    // Check if the detected environment is suitable for touching grass (outdoor)
    const isOutdoorEnvironment = useCallback(() => {
        if (!environmentDetection) return false;

        const outdoorEnvironments = [
            'forest', 'park', 'garden', 'beach', 'field', 'mountain',
            'urban', 'street', 'outdoor', 'nature', 'grass', 'trail',
            'countryside', 'wilderness', 'meadow', 'hill', 'valley'
        ];

        const environment = environmentDetection.environment.toLowerCase();
        return outdoorEnvironments.some(outdoor => environment.includes(outdoor));
    }, [environmentDetection]);

    // Enhanced touch grass validation
    const canTouchGrass = useCallback(() => {
        if (!location) return { canTouch: false, reason: 'Location required' };
        if (!capturedImage) return { canTouch: false, reason: 'Take a photo to verify outdoor location' };
        if (isAnalyzing) return { canTouch: false, reason: 'Analyzing environment...' };

        if (environmentDetection && !isOutdoorEnvironment()) {
            return {
                canTouch: false,
                reason: `Cannot touch grass indoors (detected: ${environmentDetection.environment})`
            };
        }

        return { canTouch: true, reason: 'Ready to touch grass!' };
    }, [location, capturedImage, isAnalyzing, environmentDetection, isOutdoorEnvironment]);

    // Get user location on component mount
    useEffect(() => {
        if (isRegistered) {
            requestLocation();
        }
    }, [isRegistered, requestLocation]);

    if (!isRegistered) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md mx-auto p-6">
                    <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white">Registration Required</h3>
                    <p className="text-slate-400">Please complete registration to access scanning features.</p>
                </div>
            </div>
        );
    }

    const handleTouchGrass = async () => {
        if (!provider || !address || !location) return;

        setIsScanning(true);
        setScanResult(null);

        try {
            // If camera is active, simulate scanning process
            if (isCameraActive) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log('🌱 Starting touch grass process...');
            console.log('Address:', address);
            console.log('Location:', location);

            const contract = getContract(provider);
            const locationHash = generateLocationHash(location.lat, location.lng, 'grass_touch');

            console.log('Generated location hash:', locationHash);
            console.log('📡 Calling touchGrass on contract...');

            const signer = await provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            // Use 'unknown' first as recommended by TypeScript
            const tx = await (contractWithSigner as unknown as { touchGrassCheckin: (locationHash: string) => Promise<{ hash: string; wait: () => Promise<unknown> }> }).touchGrassCheckin(locationHash);
            console.log('Transaction submitted:', tx.hash);

            // Wait for transaction confirmation
            console.log('⏳ Waiting for transaction confirmation...');
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            setScanResult({
                success: true,
                message: `Grass touched successfully! +15 XP earned. Transaction: ${tx.hash.slice(0, 10)}...`
            });

            setTimeout(() => {
                console.log('🔄 Refreshing player stats...');
                refreshPlayerStats();
            }, 3000);

        } catch (error: unknown) {
            console.error('❌ Touch grass failed:', error);

            let errorMessage = 'Failed to touch grass.';

            if (error instanceof Error) {
                if (error.message.includes('Player not registered')) {
                    errorMessage = 'Please complete registration first.';
                } else if (error.message.includes('execution was reverted')) {
                    errorMessage = 'Transaction failed. There may have been a contract error.';
                } else {
                    errorMessage = error.message;
                }
            }

            setScanResult({
                success: false,
                message: errorMessage
            });
        } finally {
            setIsScanning(false);
        }
    };

    const handleClaimArtifact = async () => {
        if (!provider || !address || !location) return;

        setIsScanning(true);
        setScanResult(null);

        try {
            // If camera is active, simulate scanning process
            if (isCameraActive) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            console.log('🔍 Starting artifact claim process...');
            console.log('Address:', address);
            console.log('Location:', location);
            console.log('Selected artifact type:', selectedArtifactType);

            const contract = getContract(provider);
            const locationHash = generateLocationHash(
                location.lat,
                location.lng,
                `artifact_${selectedArtifactType}`
            );

            console.log('Generated location hash:', locationHash);

            // Add more detailed logging and transaction handling
            console.log('📡 Calling claimArtifact on contract...');
            const signer = await provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            // Use 'unknown' first as recommended by TypeScript
            const tx = await (contractWithSigner as unknown as { claimArtifact: (locationHash: string, artifactType: number) => Promise<{ hash: string; wait: () => Promise<unknown> }> }).claimArtifact(locationHash, selectedArtifactType);
            console.log('Transaction submitted:', tx.hash);

            // Wait for transaction confirmation
            console.log('⏳ Waiting for transaction confirmation...');
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            const artifactNames = ['Mushroom', 'Fossil', 'Graffiti', 'Pixel Plant'];
            setScanResult({
                success: true,
                message: `${artifactNames[selectedArtifactType]} claimed successfully! Transaction: ${tx.hash.slice(0, 10)}...`
            });

            // Refresh stats after successful transaction
            setTimeout(() => {
                console.log('🔄 Refreshing player stats...');
                refreshPlayerStats();
            }, 3000);

        } catch (error: unknown) {
            console.error('❌ Artifact claim failed:', error);

            let errorMessage = 'Failed to claim artifact.';

            if (error instanceof Error) {
                // Handle specific error cases
                if (error.message.includes('Location already claimed')) {
                    errorMessage = 'This location has already been claimed. Try a different location!';
                } else if (error.message.includes('Invalid artifact type')) {
                    errorMessage = 'Invalid artifact type selected. Please try again.';
                } else if (error.message.includes('Player not registered')) {
                    errorMessage = 'Please complete registration first.';
                } else if (error.message.includes('execution was reverted')) {
                    errorMessage = 'Transaction failed. You may have already claimed this location or there was a contract error.';
                } else {
                    errorMessage = error.message;
                }
            }

            setScanResult({
                success: false,
                message: errorMessage
            });
        } finally {
            setIsScanning(false);
        }
    };

    const artifactTypes = [
        { type: ArtifactType.MUSHROOM, name: 'Mushroom', color: 'green', icon: Sprout },
        { type: ArtifactType.FOSSIL, name: 'Fossil', color: 'gray', icon: Bone },
        { type: ArtifactType.GRAFFITI, name: 'Graffiti', color: 'gray', icon: Palette },
        { type: ArtifactType.PIXEL_PLANT, name: 'Pixel Plant', color: 'green', icon: Gem },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                    <QrCode size={32} className="text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Enhanced Scan & Discover</h2>
                <p className="text-slate-400 text-sm">
                    Advanced camera scanning with media recording capabilities
                </p>
            </div>

            {/* Location Status */}
            <div className="card">
                <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-gray-300" />
                    <span className="font-medium">Current Location</span>
                    {!isLoadingLocation && !locationError && !location && (
                        <span className="text-xs text-gray-300 bg-gray-800/20 px-2 py-1 rounded">Required</span>
                    )}
                </div>

                {isLoadingLocation ? (
                    <div className="flex items-center gap-2 p-3 bg-gray-800/20 rounded-lg">
                        <Loader2 size={16} className="animate-spin text-gray-300" />
                        <p className="text-sm text-gray-300">Getting your location...</p>
                    </div>
                ) : locationError ? (
                    <div className="space-y-3">
                        <div className="flex items-start gap-2 text-gray-300 bg-gray-800/20 p-3 rounded-lg">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Location Error</p>
                                <p className="text-xs text-gray-400 mt-1">{locationError}</p>
                            </div>
                        </div>
                        <button
                            onClick={requestLocation}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                        >
                            <RefreshCw size={16} />
                            Retry Location
                        </button>
                    </div>
                ) : location ? (
                    <div className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg">
                        <CheckCircle size={16} className="text-green-400" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-400">Location acquired</p>
                            <p className="text-xs text-gray-400">
                                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={requestLocation}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <MapPin size={16} />
                        Get Location
                    </button>
                )}
            </div>

            {/* Enhanced Camera Scanner */}
            <div className="card">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Camera size={16} className="text-gray-300" />
                    Enhanced Camera Scanner
                </h3>

                <div className="space-y-4">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                facingMode: "environment",
                                width: { ideal: 1280 },
                                height: { ideal: 720 }
                            }}
                            className="w-full h-full object-cover"
                            onUserMedia={() => {
                                setIsCameraActive(true);
                                setCameraError(null);
                                console.log('Camera activated successfully');
                            }}
                            onUserMediaError={handleCameraError}
                        />

                        {/* Scanning Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className={`w-48 h-48 border-2 rounded-lg transition-all duration-500 ${isScanning
                                ? 'border-green-400 animate-pulse scale-110 shadow-lg shadow-green-400/50'
                                : 'border-white/70 shadow-lg shadow-white/20'
                                }`}>
                                {/* Corner indicators */}
                                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white"></div>

                                {/* Center dot */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-400 animate-ping' : 'bg-white/50'
                                        }`}></div>
                                </div>
                            </div>
                        </div>

                        {/* Scanner Instructions */}
                        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                            <div className="bg-black/70 rounded-lg p-3 text-center backdrop-blur-sm">
                                <p className="text-white text-sm">
                                    {isScanning
                                        ? 'Scanning environment...'
                                        : 'Point camera at surroundings • Use controls below'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Camera Controls */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={capturePhoto}
                            disabled={isCapturing || !isCameraActive}
                            className="btn-secondary flex items-center justify-center gap-2"
                        >
                            {isCapturing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Capturing...
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={16} />
                                    Capture
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="btn-secondary flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Reset
                        </button>
                    </div>

                    {/* Show captured image */}
                    {capturedImage && (
                        <div className="space-y-2">
                            <p className="text-sm text-green-400 font-medium">Photo captured successfully!</p>
                            <Image
                                src={capturedImage}
                                alt="Captured"
                                width={400}
                                height={128}
                                className="w-full max-h-32 object-cover rounded-lg border border-green-500/30"
                            />
                            <div className="flex gap-2">
                                <a
                                    href={capturedImage}
                                    download="walkscape-capture.jpg"
                                    className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Download size={16} />
                                    Download
                                </a>
                                <button
                                    onClick={() => setCapturedImage(null)}
                                    className="btn-secondary flex-1 text-sm"
                                >
                                    Clear Photo
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Camera Error */}
                    {cameraError && (
                        <div className="flex items-start gap-2 text-gray-300 bg-gray-800/20 p-3 rounded-lg">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Camera Error</p>
                                <p className="text-xs text-gray-400 mt-1">{cameraError}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Environment Analysis */}
            <div className="card">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Brain size={16} className="text-green-400" />
                    AI Environment Analysis
                </h3>

                {isAnalyzing ? (
                    <div className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg">
                        <Loader2 size={16} className="animate-spin text-green-400" />
                        <p className="text-sm text-green-400">Analyzing environment with AI...</p>
                    </div>
                ) : environmentDetection ? (
                    <div className="space-y-3">
                        <div className="bg-green-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-green-400 capitalize">
                                    {environmentDetection.environment}
                                </h4>
                                <span className={`text-sm font-medium ${getConfidenceColor(environmentDetection.confidence)}`}>
                                    {formatConfidence(environmentDetection.confidence)} confident
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-3">
                                {environmentDetection.description}
                            </p>

                            <div className="space-y-2">
                                <p className="text-xs text-slate-400 font-medium">Suggested Artifacts:</p>
                                <div className="flex gap-2">
                                    {environmentDetection.suggestedArtifacts.map((artifact: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                const artifactType = getArtifactTypeFromName(artifact);
                                                setSelectedArtifactType(artifactType as ArtifactType);
                                            }}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${artifactTypes[getArtifactTypeFromName(artifact)]?.name === artifact
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {artifact}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {capturedImage && (
                            <button
                                onClick={triggerManualAnalysis}
                                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                            >
                                <RefreshCw size={16} />
                                Re-analyze Image
                            </button>
                        )}
                    </div>
                ) : aiDetectionError ? (
                    <div className="space-y-3">
                        <div className="flex items-start gap-2 text-gray-300 bg-gray-800/20 p-3 rounded-lg">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">AI Analysis Error</p>
                                <p className="text-xs text-gray-400 mt-1">{aiDetectionError}</p>
                            </div>
                        </div>
                        {capturedImage && (
                            <button
                                onClick={triggerManualAnalysis}
                                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                            >
                                <RefreshCw size={16} />
                                Retry Analysis
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-slate-400 p-4">
                        <Camera size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Capture a photo to analyze the environment</p>
                        <p className="text-xs mt-1">AI will suggest the best artifacts for this location</p>
                    </div>
                )}
            </div>

            {/* Touch Grass Action */}
            <div className="card-forest">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-green-400" />
                    Touch Grass
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                    Verify your outdoor presence to earn XP and maintain your streak!
                </p>

                {/* Touch Grass Validation Status */}
                {(() => {
                    const validation = canTouchGrass();
                    return (
                        <div className={`p-3 rounded-lg mb-3 text-sm ${validation.canTouch
                            ? 'bg-green-900/20 border border-green-500/30 text-green-400'
                            : 'bg-gray-900/20 border border-gray-500/30 text-gray-400'
                            }`}>
                            <div className="flex items-center gap-2">
                                {validation.canTouch ? (
                                    <CheckCircle size={16} className="text-green-400" />
                                ) : (
                                    <AlertCircle size={16} className="text-gray-400" />
                                )}
                                <span>{validation.reason}</span>
                            </div>
                        </div>
                    );
                })()}

                <button
                    onClick={handleTouchGrass}
                    disabled={isScanning || !canTouchGrass().canTouch}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isScanning ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {isCameraActive ? 'Scanning...' : 'Touching Grass...'}
                        </>
                    ) : (
                        <>
                            <Camera size={16} />
                            Touch Grass (+15 XP)
                        </>
                    )}
                </button>

                {!location && (
                    <p className="text-xs text-gray-300 text-center mt-2">
                        Location access required for this action
                    </p>
                )}
            </div>

            {/* Artifact Claiming */}
            <div className="card">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <QrCode size={16} className="text-gray-300" />
                    Claim Artifact
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                    Scan your surroundings to discover unique location-based collectibles
                </p>

                {/* Artifact Type Selection */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {artifactTypes.map((artifact) => {
                        const IconComponent = artifact.icon;
                        return (
                            <button
                                key={artifact.type}
                                onClick={() => setSelectedArtifactType(artifact.type)}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex items-center gap-2 ${selectedArtifactType === artifact.type
                                    ? `artifact-${artifact.color} border-opacity-100`
                                    : `artifact-${artifact.color} border-opacity-30`
                                    }`}
                            >
                                <IconComponent size={16} />
                                {artifact.name}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleClaimArtifact}
                    disabled={isScanning || !location}
                    className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isScanning ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {isCameraActive ? 'Scanning...' : 'Claiming...'}
                        </>
                    ) : (
                        <>
                            <QrCode size={16} />
                            Claim {artifactTypes[selectedArtifactType].name}
                        </>
                    )}
                </button>
            </div>

            {/* Scan Result */}
            {scanResult && (
                <div className={`card ${scanResult.success ? 'border-green-500/50' : 'border-gray-500/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {scanResult.success ? (
                            <CheckCircle size={16} className="text-green-400" />
                        ) : (
                            <AlertCircle size={16} className="text-gray-300" />
                        )}
                        <span className={`font-medium ${scanResult.success ? 'text-green-400' : 'text-gray-300'}`}>
                            {scanResult.success ? 'Success!' : 'Error'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-300">
                        {scanResult.message}
                    </p>
                </div>
            )}

            {/* Enhanced Tips */}
            <div className="card">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-gray-300" />
                    Enhanced Features
                </h3>
                <div className="space-y-2 text-sm text-slate-400">
                    <p><strong>AI Environment Analysis:</strong> Automatically detect environment types and suggest optimal artifacts</p>
                    <p><strong>Smart Camera:</strong> Capture photos with automatic environment recognition</p>
                    <p><strong>Auto-Selection:</strong> AI suggests the best artifact types based on your surroundings</p>
                    <p><strong>Enhanced Detection:</strong> Advanced GPS and visual analysis for accurate location-based claims</p>
                    <p><strong>Transaction Tracking:</strong> Real-time blockchain transaction monitoring and confirmation</p>
                    <p><strong>Smart Retry:</strong> Automatic fallback systems for camera, location, and AI services</p>
                </div>

                <div className="mt-4 p-3 bg-green-800/30 rounded-lg border border-green-500/30">
                    <p className="text-xs text-green-400">
                        <strong>Gemini AI Active:</strong> Advanced AI environment analysis is enabled with your API key.
                        The system will analyze your photos with Google Gemini Vision for accurate artifact suggestions.
                    </p>
                </div>
            </div>
        </div>
    );
}
