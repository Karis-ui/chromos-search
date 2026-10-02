import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ConsentProfile, ConsentStats, ConsentStatus } from '../api/endpoints/consent';

interface ConsentStoreState {
    profile: ConsentProfile | null;
    stats: ConsentStats | null;

    wizardStep: number;
    wizardData: {
        displayName: string;
        bio: string;
        location: string;
        occupation: string;
        company: string;
        contactEmail: string;
        allowDirectMessages: boolean;
        allowEmailContact: boolean;
        allowPhoneContact: boolean;
        consentVersion: string;
        acceptTerms: boolean;
    };
    uploadedPhotos: Array<{
        id: string;
        url: string;
        thumbnail: string;
        isPrimary: boolean;
        confidence: number;
    }>;

    isLoading: boolean;
    isGranting: boolean;
    isUploading: boolean;
    isRevoking: boolean;
    error: string | null;

    hasConsent: boolean;
    isActive: boolean;
    faceCount: number;

    setProfile: (profile: ConsentProfile | null) => void;
    setStats: (stats: ConsentStats | null) => void;
    setStatus: (status: ConsentStatus) => void;
    setWizardStep: (step: number) => void;
    updateWizardData: (data: Partial<ConsentStoreState['wizardData']>) => void;
    addPhoto: (photo: ConsentStoreState['uploadedPhotos'][0]) => void;
    removePhoto: (id: string) => void;
    resetWizard: () => void;
    setLoading: (key: 'isLoading' | 'isGranting' | 'isUploading' | 'isRevoking' | 'isUpdating' | 'isSearching', value: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const initialWizardData = {
    displayName: "",
    bio: "",
    location: "",
    occupation: "",
    company: "",
    contactEmail: "",
    allowDirectMessages: false,
    allowEmailContact: false,
    allowPhoneContact: false,
    consentVersion: "v1.0",
    acceptTerms: false,
};

const initialState = {
    profile: null,
    stats: null,
    wizardStep: 1,
    wizardData: initialWizardData,
    uploadedPhotos: [],
    isLoading: false,
    isGranting: false,
    isUploading: false,
    isRevoking: false,
    error: null,
    hasConsent: false,
    isActive: false,
    faceCount: 0,
}

export const useConsentStore = create<ConsentStoreState>()(
    persist(
        immer((set) => ({
            ...initialState,
            setProfile: (profile) => {
                set((state) => {
                    state.profile = profile;
                    state.hasConsent = profile?.consent_given ?? false;
                    state.isActive = profile?.is_active ?? false;
                    state.faceCount = profile?.face_count ?? 0;
                });
            },
            setStats: (stats) => {
                set((state) => {
                    state.stats = stats;
                })
            },
            setStatus: (status) =>
                set({
                    hasConsent: status.consent_given,
                    isActive: status.is_active,
                    faceCount: status.face_count,
                    profile: status.profile,
                }),
            setWizardStep: (step) => set({ wizardStep: step }),
            updateWizardData: (data) =>
                set((state) => {
                    state.wizardData = { ...state.wizardData, ...data };
                }),
            addPhoto: (photo) =>
                set((state) => {
                    state.uploadedPhotos.push(photo);
                }),
            removePhoto: (id) =>
                set((state) => {
                    state.uploadedPhotos = state.uploadedPhotos.filter(
                        (p) => p.id !== id
                    );
                }),
            resetWizard: () => set({ wizardStep: 1, wizardData: initialWizardData, uploadedPhotos: [] }),
            setLoading: (key, value) => set({ [key]: value }),
            setError: (error) => set({ error }),
            reset: () => set(initialState),
        })),
        {
            name: "consent",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                profile: state.profile,
                stats: state.stats,
                hasConsent: state.hasConsent,
                isActive: state.isActive,
                faceCount: state.faceCount,
            }),
        }
    )
);

export default useConsentStore;