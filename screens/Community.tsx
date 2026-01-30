
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { t } from '../utils/Translations';
import { SyncManager } from '../utils/SyncManager';

interface Post {
    id: string;
    text: string;
    mood: string;
    timestamp: string;
    reactions: number;
    hasReacted: boolean;
}

const Community: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([
        { id: '1', text: 'la ansiedad por el futuro me paraliza hoy. intento respirar.', mood: 'ansiedad', timestamp: '2min', reactions: 12, hasReacted: false },
        { id: '2', text: 'hoy logré levantarme temprano después de semanas fallando. pequeño paso.', mood: 'victoria', timestamp: '15min', reactions: 45, hasReacted: true },
        { id: '3', text: 'me siento solo en este proceso de mejora. nadie en mi entorno entiende.', mood: 'soledad', timestamp: '1h', reactions: 8, hasReacted: false },
    ]);
    const [newPost, setNewPost] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(true);

    const handleReaction = (id: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    reactions: p.hasReacted ? p.reactions - 1 : p.reactions + 1,
                    hasReacted: !p.hasReacted
                };
            }
            return p;
        }));
        
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const handlePost = () => {
        if (!newPost.trim()) return;
        setIsPosting(true);

        // Simulate Network Request
        setTimeout(() => {
            const post: Post = {
                id: Date.now().toString(),
                text: newPost.toLowerCase(),
                mood: 'reflexión',
                timestamp: 'ahora',
                reactions: 0,
                hasReacted: false
            };
            setPosts(prev => [post, ...prev]);
            setNewPost('');
            setIsPosting(false);
            // SyncManager.saveCommunityPost(post); // Imaginary backend call
        }, 800);
    };

    return (
        <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans lowercase selection:bg-purple-500/30">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="px-6 pt-12 pb-4 flex justify-between items-center relative z-10">
                <div>
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">comunidad anónima</p>
                    <h1 className="text-3xl font-bold text-white tracking-tighter">la tribu</h1>
                </div>
                <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-white">groups</span>
                </div>
            </div>

            {/* Content Feed */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-32 space-y-6 relative z-10">
                
                {/* Guidelines Banner */}
                {showGuidelines && (
                    <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 flex gap-4 animate-in fade-in slide-in-from-top-4 relative">
                        <button onClick={() => setShowGuidelines(false)} className="absolute top-2 right-2 text-purple-300/50 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                        <div className="size-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-purple-300">verified_user</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1">espacio seguro</h3>
                            <p className="text-xs text-purple-200/70 leading-relaxed">
                                aquí no hay juicios ni comentarios tóxicos. solo puedes leer y enviar "luz" (reacciones) para mostrar apoyo. tu identidad es secreta.
                            </p>
                        </div>
                    </div>
                )}

                {/* Compose Input */}
                <div className="liquid-glass rounded-3xl p-4 flex gap-3 items-end focus-within:bg-white/5 transition-colors">
                     <div className="size-8 rounded-full bg-neutral-800 shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-neutral-500 text-sm">edit</span>
                     </div>
                     <textarea 
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="comparte tu carga..."
                        className="flex-1 bg-transparent border-none text-white text-sm outline-none resize-none h-10 py-1.5 placeholder-neutral-600 leading-relaxed"
                        rows={1}
                     />
                     <button 
                        onClick={handlePost}
                        disabled={!newPost.trim() || isPosting}
                        className="size-8 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
                     >
                        {isPosting ? <div className="size-3 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : <span className="material-symbols-outlined text-sm">arrow_upward</span>}
                     </button>
                </div>

                {/* Posts */}
                {posts.map(post => (
                    <div key={post.id} className="group relative pl-4 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Thread Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 group-hover:bg-purple-500/30 transition-colors" />
                        
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 hover:bg-neutral-900/60 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                                    post.mood === 'ansiedad' ? 'text-orange-300 border-orange-900/30 bg-orange-900/10' :
                                    post.mood === 'victoria' ? 'text-emerald-300 border-emerald-900/30 bg-emerald-900/10' :
                                    'text-purple-300 border-purple-900/30 bg-purple-900/10'
                                }`}>
                                    {post.mood}
                                </span>
                                <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{post.timestamp}</span>
                            </div>
                            
                            <p className="text-neutral-300 text-sm font-medium leading-relaxed mb-4">
                                "{post.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => handleReaction(post.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95 ${
                                        post.hasReacted 
                                        ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                        : 'bg-white/5 text-neutral-500 hover:bg-white/10'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-sm ${post.hasReacted ? 'icon-filled' : ''}`}>
                                        {post.hasReacted ? 'bolt' : 'bolt'}
                                    </span>
                                    <span className="text-[10px] font-bold tabular-nums">
                                        {post.reactions} {post.hasReacted ? 'enviada' : 'enviar fuerza'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="text-center pt-8 pb-4">
                    <p className="text-[9px] text-neutral-700 uppercase tracking-widest">fin del flujo</p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Community;
