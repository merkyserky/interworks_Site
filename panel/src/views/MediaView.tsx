import { ImageIcon, Upload, FolderOpen, Film, Music } from 'lucide-react'
import { cn } from '@panel/lib/utils'

export function MediaView() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-2">Media Library</h1>
                <p className="text-slate-500">Manage your images, videos, and audio files</p>
            </div>

            {/* Coming Soon Card */}
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-xl border border-slate-800 bg-slate-900/30">
                <div className="relative mb-8">
                    {/* Animated icons */}
                    <div className="absolute -top-4 -left-8 h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 animate-float-slow">
                        <ImageIcon size={24} />
                    </div>
                    <div className="absolute -top-2 -right-10 h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 animate-float-medium">
                        <Film size={20} />
                    </div>
                    <div className="absolute -bottom-4 -left-4 h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 animate-float-fast">
                        <Music size={20} />
                    </div>

                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <FolderOpen size={40} className="text-indigo-400" />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-100 mb-2">Coming Soon</h2>
                <p className="text-slate-500 text-center max-w-md mb-6">
                    The media library is under development. Soon you'll be able to upload, organize, and manage all your media assets in one place.
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                    <FeatureTag icon={<Upload size={14} />} label="Drag & Drop Upload" />
                    <FeatureTag icon={<ImageIcon size={14} />} label="Image Optimization" />
                    <FeatureTag icon={<FolderOpen size={14} />} label="Folder Organization" />
                </div>
            </div>

            {/* Preview of what's to come */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-40 pointer-events-none select-none">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "aspect-square rounded-xl bg-slate-800/50 border border-slate-700/50",
                            "flex items-center justify-center"
                        )}
                    >
                        <ImageIcon size={24} className="text-slate-600" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function FeatureTag({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-slate-400">
            {icon}
            <span>{label}</span>
        </div>
    );
}
