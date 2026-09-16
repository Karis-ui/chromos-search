import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
    FiUpload,
    FiFile,
    FiX,
    FiCheck,
    FiZap,
    FiEye,
    FiClock,
    FiCpu,
    FiCamera,
    FiFilm,
} from 'react-icons/fi';
import { toast } from 'react-toastify'
import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { formatFileSize } from '../../utils/formatters';

interface UploadZoneProps {
    onUpload: (file: File) => void;
    onClear?: () => void;
    acceptedTypes?: string[];
    maxSize?: number;
    className?: string;
    isUploading?: boolean;
    progress?: number;
    error?: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
    onUpload,
    onClear,
    acceptedTypes = ['image/*', 'video/*'],
    maxSize = 50 * 1024 * 1024, // 50MB
    className = '',
    isUploading = false,
    progress = 0,
    error = null,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Dropzone config ──
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const droppedFile = acceptedFiles[0];
            if (!droppedFile) return;

            if (droppedFile.size > maxSize) {
                toast.error(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
                return;
            }

            setFile(droppedFile);
            setIsDragging(false);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                // Trigger scanning effect
                setScanning(true);
                setTimeout(() => setScanning(false), 2000);
            };
            reader.readAsDataURL(droppedFile);

            onUpload(droppedFile);
        },
        [maxSize, onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
        maxFiles: 1,
        noClick: true,
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
    });

    // ── Clear file ──
    const handleClear = useCallback(() => {
        setFile(null);
        setPreview(null);
        setScanning(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClear?.();
    }, [onClear]);

    // ── Determine file type ──
    const isVideo = file?.type.startsWith('video/');
    const isImage = file?.type.startsWith('image/');

    // ── File icon ──
    const FileIcon = isVideo ? FiFilm : isImage ? FiCamera : FiFile;

    // ── Scan lines animation ──
    useEffect(() => {
        if (!scanning) return;

        const interval = setInterval(() => {
            // Simulate scanning progress
        }, 100);

        return () => clearInterval(interval);
    }, [scanning]);

    return (
        <div className={`relative ${className}`}>
            {/* ── Dropzone ── */}
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-2xl transition-all duration-300
          ${isDragActive || isDragging
                        ? 'border-cyan-400 bg-cyan-400/5 scale-[1.01]'
                        : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'
                    }
          ${preview ? 'min-h-[200px]' : 'min-h-[300px]'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <input {...getInputProps()} ref={fileInputRef} />

                {/* ── Scanning effect ── */}
                {isDragActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse rounded-[inherit]" />
                )}

                {/* ── Scanline overlay ── */}
                {(isDragActive || scanning) && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                            animate={{
                                top: ['-2px', '100%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    </motion.div>
                )}

                {/* ── Preview ── */}
                {preview ? (
                    <div className="relative h-full flex items-center justify-center p-4">
                        {isVideo ? (
                            <video
                                ref={videoRef}
                                src={preview}
                                controls
                                className="max-h-[400px] rounded-lg shadow-2xl"
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Upload preview"
                                className="max-h-[400px] rounded-lg shadow-2xl object-contain"
                            />
                        )}

                        {/* ── File info overlay ── */}
                        <motion.div
                            className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
                                    <FileIcon className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate text-white">{file?.name}</p>
                                    <p className="text-xs text-gray-400">{formatFileSize(file?.size || 0)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1">
                                    <FiCheck className="w-3 h-3 text-green-400" />
                                    <span className="text-xs text-green-400 font-mono">Ready</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClear();
                                    }}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <FiX className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </motion.div>

                        {/* ── Scanning overlay ── */}
                        {scanning && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-[inherit]">
                                <div className="text-center">
                                    <div className="relative w-16 h-16 mx-auto mb-4">
                                        <motion.div
                                            className="absolute inset-0 border-2 border-cyan-400/30 rounded-full"
                                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                        <motion.div
                                            className="absolute inset-0 border-2 border-purple-400/30 rounded-full"
                                            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FiCpu className="w-8 h-8 text-cyan-400 animate-spin" />
                                        </div>
                                    </div>
                                    <GlitchText className="text-sm text-cyan-400 font-mono">
                                        Scanning Biometrics...
                                    </GlitchText>
                                    <p className="text-xs text-gray-400 mt-1 font-mono">
                                        Detecting face and voice signatures
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // ── Upload placeholder ──
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                                <FiUpload className="text-4xl text-gray-400" />
                            </div>
                            <motion.div
                                className="absolute -inset-1 rounded-full border-2 border-cyan-400/20"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-300 mb-2">
                            {isDragActive ? 'Release to Upload' : 'Drop Your Media Here'}
                        </h3>

                        <p className="text-sm text-gray-500 max-w-md mb-4">
                            Upload a photo or video containing a face for biometric search
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                <FiEye className="w-3 h-3 text-cyan-400" />
                                Face Detection
                            </span>
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                <FiZap className="w-3 h-3 text-purple-400" />
                                Voice Recognition
                            </span>
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                <FiClock className="w-3 h-3 text-green-400" />
                                6-Month Search
                            </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-600 font-mono">
                            <span>Supported: {acceptedTypes.join(', ')}</span>
                            <span>•</span>
                            <span>Max: {formatFileSize(maxSize)}</span>
                        </div>

                        <GradientButton
                            onClick={() => fileInputRef.current?.click()}
                            variant="cyan"
                            size="sm"
                            className="mt-4"
                        >
                            <FiUpload className="w-4 h-4" />
                            Browse Files
                        </GradientButton>
                    </div>
                )}

                {/* ── Glow border ── */}
                {isHovered && !file && !isDragging && (
                    <div className="absolute inset-0 rounded-[inherit] pointer-events-none">
                        <div className="absolute inset-0 rounded-[inherit] border-2 border-transparent shadow-[inset_0_0_30px_rgba(34,211,238,0.05)]" />
                    </div>
                )}
            </div>

            {/* ── Error display ── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-mono"
                    >
                        <span className="flex items-center gap-2">
                            <FiX className="w-4 h-4" />
                            {error}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Upload progress ── */}
            {isUploading && progress > 0 && progress < 100 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 space-y-1"
                >
                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                        <span>Uploading...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </motion.div>
            )}

            {/* ── Success animation ── */}
            {isUploading && progress === 100 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 flex items-center gap-2 text-green-400 text-sm font-mono"
                >
                    <FiCheck className="w-4 h-4" />
                    <span>Upload complete! Processing...</span>
                </motion.div>
            )}
        </div>
    );
};