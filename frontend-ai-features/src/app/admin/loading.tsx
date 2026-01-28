import { Loader2 } from "lucide-react"

export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Skeleton Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-24 h-10 bg-muted animate-pulse rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-28 bg-primary/20 animate-pulse rounded-full"></div>
                            <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
                        </div>
                        <div className="h-8 bg-muted animate-pulse rounded-lg w-64"></div>
                        <div className="h-4 bg-muted animate-pulse rounded-lg w-48"></div>
                    </div>
                </div>

                {/* Skeleton Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-muted animate-pulse rounded-xl"></div>
                    ))}
                </div>

                {/* Skeleton Main Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-4">
                        <div className="h-6 bg-muted animate-pulse rounded-lg w-32"></div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
                        ))}
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <div className="h-64 bg-muted animate-pulse rounded-xl"></div>
                        <div className="h-40 bg-muted animate-pulse rounded-xl"></div>
                    </div>
                </div>

                {/* Loading Overlay */}
                <div className="fixed inset-0 bg-background/50 flex items-center justify-center pointer-events-none">
                    <div className="bg-card shadow-xl rounded-xl p-6 flex items-center gap-4 pointer-events-auto">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <div>
                            <p className="font-medium">Memuat Dashboard</p>
                            <p className="text-sm text-muted-foreground">Mohon tunggu sebentar...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
