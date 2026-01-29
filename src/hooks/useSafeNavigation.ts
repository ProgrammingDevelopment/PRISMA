"use client"

import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

interface SafeNavigationOptions {
    onError?: (error: Error) => void
    onNavigationStart?: () => void
    onNavigationEnd?: () => void
    fallbackPath?: string
}

interface NavigationState {
    isNavigating: boolean
    error: Error | null
}

/**
 * Custom hook for safe navigation with error handling and callbacks
 * Prevents navigation crashes by wrapping router.push in try-catch
 */
export function useSafeNavigation(options: SafeNavigationOptions = {}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [state, setState] = useState<NavigationState>({
        isNavigating: false,
        error: null
    })

    const { onError, onNavigationStart, onNavigationEnd, fallbackPath = '/' } = options

    const navigateTo = useCallback(async (path: string) => {
        setState({ isNavigating: true, error: null })
        onNavigationStart?.()

        try {
            startTransition(() => {
                router.push(path)
            })

            // Small delay to ensure navigation has started
            await new Promise(resolve => setTimeout(resolve, 100))

            setState(prev => ({ ...prev, isNavigating: false }))
            onNavigationEnd?.()
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Navigation failed')
            console.error('Navigation error:', err)

            setState({ isNavigating: false, error: err })
            onError?.(err)

            // Attempt to navigate to fallback
            if (fallbackPath !== path) {
                try {
                    router.push(fallbackPath)
                } catch {
                    console.error('Fallback navigation also failed')
                }
            }
        }
    }, [router, onError, onNavigationStart, onNavigationEnd, fallbackPath, startTransition])

    const navigateBack = useCallback(() => {
        try {
            router.back()
        } catch (error) {
            console.error('Back navigation error:', error)
            router.push(fallbackPath)
        }
    }, [router, fallbackPath])

    const navigateReplace = useCallback(async (path: string) => {
        setState({ isNavigating: true, error: null })
        onNavigationStart?.()

        try {
            startTransition(() => {
                router.replace(path)
            })

            setState(prev => ({ ...prev, isNavigating: false }))
            onNavigationEnd?.()
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Replace navigation failed')
            console.error('Replace navigation error:', err)

            setState({ isNavigating: false, error: err })
            onError?.(err)
        }
    }, [router, onError, onNavigationStart, onNavigationEnd, startTransition])

    const prefetch = useCallback((path: string) => {
        try {
            router.prefetch(path)
        } catch (error) {
            console.error('Prefetch error:', error)
        }
    }, [router])

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }))
    }, [])

    return {
        navigateTo,
        navigateBack,
        navigateReplace,
        prefetch,
        clearError,
        isNavigating: state.isNavigating || isPending,
        error: state.error
    }
}

/**
 * Safe link click handler for when you need manual control
 */
export function createSafeLinkHandler(
    path: string,
    options: SafeNavigationOptions = {}
) {
    return (e: React.MouseEvent) => {
        e.preventDefault()

        try {
            if (typeof window !== 'undefined') {
                window.location.href = path
            }
        } catch (error) {
            console.error('Link handler error:', error)
            if (options.onError && error instanceof Error) {
                options.onError(error)
            }

            // Fallback
            if (options.fallbackPath) {
                window.location.href = options.fallbackPath
            }
        }
    }
}

/**
 * Validate if a path is safe to navigate to
 */
export function isValidPath(path: string): boolean {
    if (!path) return false

    // Check for valid URL patterns
    const validPatterns = [
        /^\//, // Absolute paths starting with /
        /^https?:\/\//, // External URLs
        /^#/, // Anchor links
    ]

    return validPatterns.some(pattern => pattern.test(path))
}

/**
 * Get safe href that won't crash
 */
export function getSafeHref(path: string, fallback: string = '/'): string {
    if (!path || !isValidPath(path)) {
        console.warn(`Invalid path detected: "${path}", using fallback`)
        return fallback
    }
    return path
}

export default useSafeNavigation
