import { Loader2 } from "lucide-react"

export default function KeuanganLoading() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Skeleton Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-24 h-10 bg-muted animate-pulse rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-8 bg-muted animate-pulse rounded-lg w-64"></div>
                        <div className="h-4 bg-muted animate-pulse rounded-lg w-48"></div>
                    </div>
                </div>

                {/* Skeleton Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>
                    ))}
                </div>

                {/* Skeleton Content */}
                <div className="space-y-4">
                    <div className="h-12 bg-muted animate-pulse rounded-lg w-48"></div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                </div>

                {/* Loading Indicator */}
                <div className="fixed bottom-8 right-8 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Memuat data...</span>
                </div>
            </div>
        </div>
    )
}
