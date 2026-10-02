import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  FiUpload,
  FiX,
  FiCamera,
  FiCheck,
  FiAlertCircle,
  FiStar,
  FiZap,
  FiUser,
  FiImage,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { useConsentStore } from '../../store/consentStore';
import { useConsent } from '../../hooks/useConsent';

interface PhotoUploaderProps {
  onNext: () => void;
  onBack: () => void;
}

interface UploadedPhoto {
  id: string;
  url: string;
  thumbnail: string;
  file: File;
  isPrimary: boolean;
  confidence: number;
  uploading: boolean;
  uploaded: boolean;
}

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 1;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onNext, onBack }) => {
  const { profile } = useConsentStore();
  const { uploadPhoto, isUploading } = useConsent();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (photos.length + acceptedFiles.length > MAX_PHOTOS) {
        toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
        return;
      }

      setIsProcessing(true);

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large. ${file.size / 1024 / 1024}`);
          continue;
        }
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image`);
          continue;
        }

        const isP = photos.length === 0 && i === 0;
        let dataUrl: string;
        try {
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          })
        } catch (error) {
          console.log('File read error', error);
          toast.error('Failed to read file');
          continue;
        }
        const tempId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const placeholder: UploadedPhoto = {
          id: tempId,
          url: dataUrl,
          thumbnail: dataUrl,
          file,
          isPrimary: i === 0 && photos.length === 0,
          confidence: 0,
          uploading: false,
          uploaded: false,
        };
        setPhotos((prev) => [...prev, placeholder]);

        if (!profile?.id) {
          setPhotos((prev) => prev.filter((p) => p.id !== tempId));
          toast.error('User profile not found. Please login.');
          continue;
        }

        try {
          const result = await uploadPhoto(profile.id!, file, isP)

          setPhotos((prev) =>
            prev.map((p) =>
              p.id === tempId
                ? {
                  ...p,
                  id: result.id,
                  url: result.photo_url,
                  thumbnail: result.thumbnail_url ?? result.photo_url,
                  uploading: false,
                  uploaded: true,
                  confidence: result.face_confidence ?? 0,
                }
                : p
            )
          );

          toast.success('Photo uploaded and indexed');
        } catch {
          setPhotos((prev) => prev.filter((p) => p.id !== tempId));
          toast.error(`Upload failed for ${file.name}`);
        }
      }

      setIsProcessing(false);
    },
    [photos.length, profile?.id, uploadPhoto]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: MAX_PHOTOS - photos.length,
    multiple: true,
    disabled: photos.length >= MAX_PHOTOS,
  });
  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  }, []);

  const setPrimary = useCallback((id: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({ ...p, isPrimary: p.id === id }))
    );
  }, []);

  const handleContinue = useCallback(() => {
    const uploadedCount = photos.filter((p) => p.uploaded).length;
    if (uploadedCount < MIN_PHOTOS) {
      toast.error('Please upload at least one photo');
      return;
    }
    onNext();
  }, [photos, onNext]);

  const uploadedCount = photos.filter((p) => p.uploaded).length;
  const canContinue = uploadedCount >= MIN_PHOTOS && !isUploading && !isProcessing;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/25"
        >
          <FiCamera className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          <GlitchText glitchInterval={5000} intensity={0.4}>
            Upload Your Photos
          </GlitchText>
        </h2>

        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Upload {MIN_PHOTOS}-{MAX_PHOTOS} clear face photos. Better photos = better matching.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <FiZap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400 leading-relaxed">
            <p className="font-semibold text-cyan-400 mb-1">
              Photo Requirements
            </p>
            <ul className="space-y-1">
              <li>✓ Clear, front-facing face</li>
              <li>✓ Good lighting (not too dark)</li>
              <li>✓ No sunglasses, masks, or heavy filters</li>
              <li>✓ Recent photo (last 2 years recommended)</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {photos.length < MAX_PHOTOS && (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center
            transition-all duration-300 cursor-pointer
            ${isDragActive
              ? 'border-cyan-400 bg-cyan-400/5 scale-[1.01]'
              : 'border-white/10 hover:border-cyan-500/40 hover:bg-white/5'
            }
          `}
        >
          <input {...getInputProps()} />

          <motion.div
            animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
          >
            <FiUpload className="w-7 h-7 text-cyan-400" />
          </motion.div>

          <p className="text-sm font-medium text-gray-200 mb-1">
            {isDragActive ? 'Drop photos here' : 'Drag & drop photos here'}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            or click to browse • JPG, PNG, WebP • Max 10MB each
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <FiImage className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] text-gray-400 font-mono">
              {photos.length} / {MAX_PHOTOS} photos
            </span>
          </div>
        </div>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence>
            {photos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
                className={`
                  relative aspect-square rounded-xl overflow-hidden group
                  border-2 transition-all duration-300
                  ${photo.isPrimary
                    ? 'border-cyan-400 shadow-lg shadow-cyan-500/25'
                    : 'border-white/10 hover:border-white/20'
                  }
                `}
              >
                <img
                  src={photo.thumbnail}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {photo.uploading && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2"
                      />
                      <p className="text-[10px] text-cyan-400 font-mono">
                        Indexing face...
                      </p>
                    </div>
                  </div>
                )}
                {photo.uploaded && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                  >
                    <FiCheck className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}

                {photo.isPrimary && photo.uploaded && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500 rounded-full flex items-center gap-1 shadow-lg">
                    <FiStar className="w-2.5 h-2.5 text-white fill-current" />
                    <span className="text-[9px] text-white font-bold font-mono">
                      PRIMARY
                    </span>
                  </div>
                )}

                {photo.uploaded && photo.confidence > 0 && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xl rounded-md">
                    <span className="text-[9px] text-green-400 font-mono">
                      {(photo.confidence * 100).toFixed(0)}% match
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.isPrimary && photo.uploaded && (
                    <button
                      onClick={() => setPrimary(photo.id)}
                      className="p-2 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-lg border border-cyan-500/30 transition-colors"
                      title="Set as primary"
                    >
                      <FiStar className="w-4 h-4 text-cyan-400" />
                    </button>
                  )}
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg border border-red-500/30 transition-colors"
                    title="Remove"
                  >
                    <FiX className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2 text-gray-500 font-mono">
            <FiUser className="w-3 h-3" />
            <span>
              {uploadedCount} of {photos.length} photos indexed
            </span>
          </div>

          {uploadedCount >= MIN_PHOTOS && (
            <div className="flex items-center gap-1 text-green-400 font-mono">
              <FiCheck className="w-3 h-3" />
              <span>Ready to continue</span>
            </div>
          )}
        </motion.div>
      )}
      {photos.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
          <FiAlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">
            At least 1 photo is required to continue
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm text-gray-300 hover:text-white font-mono"
        >
          ← Back
        </button>

        <GradientButton
          onClick={handleContinue}
          disabled={!canContinue}
          variant="rainbow"
          size="lg"
          pulse={canContinue}
          icon={<FiCheck />}
          iconPosition="right"
          className="min-w-[200px]"
        >
          Continue ({uploadedCount}/{MIN_PHOTOS})
        </GradientButton>
      </div>
    </div>
  );
};

export default PhotoUploader;