from app.core.config import logger
from dataclasses import dataclass
from functools import lru_cache
from typing import List, Optional

import cv2
import numpy as np
from insightface.app import FaceAnalysis

from app.core.config import settings


@dataclass
class FaceEmbedding:
    embedding: np.ndarray
    confidence: float


@lru_cache(maxsize=1)
def _get_face_analyzer() -> FaceAnalysis:
    import onnxruntime

    available_providers = set(onnxruntime.get_available_providers())
    providers = [
        provider
        for provider in settings.INSIGHTFACE_PROVIDERS
        if provider in available_providers
    ]
    if not providers:
        providers = ["CPUExecutionProvider"]

    analyzer = FaceAnalysis(name=settings.INSIGHTFACE_MODEL, providers=providers)
    use_gpu = providers[0] == "CUDAExecutionProvider"
    analyzer.prepare(
        ctx_id=0 if use_gpu else -1,
        det_size=tuple(settings.INSIGHTFACE_DET_SIZE),
        det_thresh=settings.INSIGHTFACE_DET_THRESHOLD,
    )
    return analyzer


class FaceRecognitionService:
    def extract_face_embedding(self, image_bytes: bytes) -> Optional[FaceEmbedding]:
        image = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Uploaded file is not a decodable image.")

        faces = _get_face_analyzer().get(image, max_num=settings.INSIGHTFACE_MAX_FACES)
        if not faces:
            return None

        face = max(faces, key=lambda detected_face: float(detected_face.det_score))
        embedding = np.asarray(face.embedding, dtype=np.float32)
        norm = np.linalg.norm(embedding)
        if embedding.size == 0 or not np.isfinite(norm) or norm == 0:
            raise ValueError("Face recognition returned an invalid embedding.")

        return FaceEmbedding(
            embedding=embedding / norm,
            confidence=float(face.det_score),
        )

    def batch_compare(
        self,
        target_emb: np.ndarray,
        candidates: List[np.ndarray],
        metric: str = 'cosine',
    ) -> List[float]:
        if not candidates or target_emb is None:
            return []
        
        try:
            valid_candidates = [c for c in candidates if c is not None]
            if not valid_candidates:
                return []
            
            target = np.asarray(target_emb, dtype=np.float32)
            cand_array = np.asarray(valid_candidates, dtype=np.float32)
            
            if target.ndim != 1 or cand_array.ndim != 2:
                logger.warning(f"Invalid embedding shapes")
                return [0.0] * len(candidates)
            
            target_norm = target / (np.linalg.norm(target) + 1e-8)
            cand_norms = np.linalg.norm(cand_array, axis=1, keepdims=True) + 1e-8
            candidates_normalized = cand_array / cand_norms
            
            if metric in ('cosine', 'dot'):
                similarities = np.dot(candidates_normalized, target_norm)
            elif metric == 'euclidean':
                distances = np.linalg.norm(candidates_normalized - target_norm, axis=1)
                similarities = 1.0 / (1.0 + distances)
            else:
                raise ValueError(f"Unknown metric: {metric}")
            
            similarities = np.clip(similarities, 0.0, 1.0)
            
            result = []
            valid_idx = 0
            for c in candidates:
                if c is None:
                    result.append(0.0)
                else:
                    result.append(float(similarities[valid_idx]))
                    valid_idx += 1
            
            return result
            
        except Exception as e:
            logger.error(f"Batch comparison failed: {str(e)}", exc_info=True)
            return [0.0] * len(candidates)


class VoiceRecognitionService:
    def extract_voice_embedding(self, audio_bytes: bytes):
        raise NotImplementedError("Voice embedding extraction is not configured.")

    def batch_compare(self, target: np.ndarray, candidates: List[np.ndarray]) -> List[float]:
        raise NotImplementedError("Voice embedding comparison is not configured.")


class HybridMatchingService:
    pass
