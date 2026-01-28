"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    }

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({ errorInfo })
        this.props.onError?.(error, errorInfo)
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Card className="m-4 border-red-200 dark:border-red-800">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Terjadi Kesalahan</h3>
                            <p className="text-muted-foreground text-sm mb-4 max-w-md">
                                Komponen ini mengalami error. Coba refresh atau kembali ke halaman sebelumnya.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="w-full mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-left overflow-auto">
                                    <p className="text-xs font-mono text-red-600 dark:text-red-400">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button size="sm" onClick={this.handleReset}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Coba Lagi
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                    <Link href="/">
                                        <Home className="h-4 w-4 mr-2" />
                                        Beranda
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return this.props.children
    }
}

// Wrapper hook for functional components
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        )
    }
}

// Simple inline error fallback component
export function ErrorFallback({
    title = "Terjadi Kesalahan",
    message = "Komponen ini tidak dapat dimuat.",
    onRetry
}: {
    title?: string
    message?: string
    onRetry?: () => void
}) {
    return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h4 className="font-medium text-red-700 dark:text-red-400">{title}</h4>
                    <p className="text-sm text-red-600/80 dark:text-red-300/80 mt-1">{message}</p>
                    {onRetry && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            onClick={onRetry}
                        >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Coba Lagi
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ErrorBoundary
