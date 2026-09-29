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

    def batch_compare(self, target: np.ndarray, candidates: List[np.ndarray]) -> List[float]:
        target_vector = np.asarray(target, dtype=np.float32).reshape(-1)
        target_norm = np.linalg.norm(target_vector)
        if target_norm == 0:
            return [0.0 for _ in candidates]
        target_vector = target_vector / target_norm

        scores = []
        for candidate in candidates:
            candidate_vector = np.asarray(candidate, dtype=np.float32).reshape(-1)
            if candidate_vector.shape != target_vector.shape:
                scores.append(0.0)
                continue
            candidate_norm = np.linalg.norm(candidate_vector)
            score = float(np.dot(target_vector, candidate_vector / candidate_norm)) if candidate_norm else 0.0
            scores.append(max(0.0, min(1.0, score)))
        return scores


class VoiceRecognitionService:
    def extract_voice_embedding(self, audio_bytes: bytes):
        raise NotImplementedError("Voice embedding extraction is not configured.")

    def batch_compare(self, target: np.ndarray, candidates: List[np.ndarray]) -> List[float]:
        raise NotImplementedError("Voice embedding comparison is not configured.")


class HybridMatchingService:
    pass
