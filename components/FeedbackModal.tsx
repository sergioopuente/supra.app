
import React, { useState } from 'react';
import { SyncManager } from '../utils/SyncManager';
import { Analytics, EVENTS } from '../utils/Analytics';

interface FeedbackModalProps {
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'rating' | 'comment' | 'done'>('rating');

    const handleRating = (val: number) => {
        setRating(val);
        // Si es muy positivo (4-5), podríamos pedir review en store.
        // Si es negativo (1-3), pedimos feedback detallado.
        setStep('comment');
    };

    const handleSubmit = async () => {
        if (!rating) return;
        setIsSubmitting(true);
        
        await SyncManager.saveFeedback({
            rating,
            comment,
            context: '7_day_check'
        });

        Analytics.track(EVENTS.FEEDBACK_SUBMITTED, { rating, has_comment: !!comment });

        setTimeout(() => {
            setIsSubmitting(false);
            setStep('done');
            setTimeout(onClose, 2000);
        }, 800);
    };

    if (step === 'done') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-neutral-900 border border-emerald-500/30 rounded-[2rem] p-8 text-center shadow-2xl scale-100 animate-in zoom-in-95">
                    <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-emerald-400">favorite</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">¡Gracias!</h3>
                    <p className="text-neutral-400 text-xs">Tu opinión construye Supra.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
            
            <div className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                <div className="flex flex-col items-center text-center space-y-2 mb-8 mt-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        ayúdanos a mejorar
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        {step === 'rating' ? '¿Cómo valorarías tu experiencia?' : '¿Qué mejorarías?'}
                    </h2>
                </div>

                {step === 'rating' ? (
                    <div className="flex justify-between gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleRating(val)}
                                className="group flex-1 aspect-square rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all active:scale-90"
                            >
                                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-125">
                                    {val === 1 ? '😡' : val === 2 ? '😕' : val === 3 ? '😐' : val === 4 ? '🙂' : '😍'}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={rating && rating < 4 ? "Cuéntanos qué falló..." : "¿Alguna función que te falte?"}
                            className="w-full h-32 bg-black/30 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder-neutral-600 outline-none focus:border-white/30 resize-none transition-colors"
                            autoFocus
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full h-14 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            {isSubmitting ? (
                                <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>enviar</span>
                                    <span className="material-symbols-outlined text-lg">send</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
