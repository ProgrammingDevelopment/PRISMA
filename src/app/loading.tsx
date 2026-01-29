import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                {/* Animated Logo/Spinner */}
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full mx-auto"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin mx-auto"></div>
                </div>

                {/* Loading Text */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-foreground">Memuat...</h2>
                    <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
                </div>

                {/* Animated Dots */}
                <div className="flex justify-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    )
}
