"use client"

import React, { useState, useCallback } from 'react'
import Image, { ImageProps } from 'next/image'
import {
    getPlaceholder,
    getResponsiveSizes,
    generateBlurPlaceholder,
    type PlaceholderType,
    type ImageLayout,
    type AspectRatio,
    getAspectRatioClass,
} from '@/utils/responsive-image'
import { ImageOff } from 'lucide-react'

interface ResponsiveImageProps extends Omit<ImageProps, 'src' | 'alt' | 'sizes' | 'placeholder' | 'blurDataURL'> {
    /** Image source URL */
    src: string
    /** Accessible alt text */
    alt: string
    /** Layout context for responsive sizing */
    layout?: ImageLayout
    /** Fallback placeholder type */
    placeholderType?: PlaceholderType
    /** Aspect ratio for container */
    aspectRatio?: AspectRatio
    /** Custom blur placeholder color */
    blurColor?: string
    /** Show error state with icon */
    showErrorState?: boolean
    /** Additional class for the container */
    containerClassName?: string
}

/**
 * ResponsiveImage - A production-ready image component that:
 * 
 * 1. Never shows broken images on ANY device
 * 2. Uses correct responsive sizes for each layout context
 * 3. Provides blur placeholder while loading
 * 4. Falls back to typed placeholder on error
 * 5. Supports all aspect ratios with proper object-fit
 * 6. Works in PWA installed mode and all browsers
 */
export function ResponsiveImage({
    src,
    alt,
    layout = 'card',
    placeholderType = 'default',
    aspectRatio = '16:10',
    blurColor = '#e2e8f0',
    showErrorState = true,
    containerClassName = '',
    className = '',
    ...props
}: ResponsiveImageProps) {
    const [imgSrc, setImgSrc] = useState(src)
    const [hasError, setHasError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    const handleError = useCallback(() => {
        if (!hasError) {
            setHasError(true)
            setImgSrc(getPlaceholder(placeholderType))
        }
    }, [hasError, placeholderType])

    const handleLoad = useCallback(() => {
        setIsLoaded(true)
    }, [])

    const aspectClass = getAspectRatioClass(aspectRatio)

    return (
        <div className={`relative overflow-hidden ${aspectClass} ${containerClassName}`}>
            {/* Loading skeleton */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 animate-pulse bg-muted" />
            )}

            {/* Error state overlay */}
            {hasError && showErrorState && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageOff className="h-6 w-6 opacity-50" />
                        <span className="text-xs opacity-60">Foto tidak tersedia</span>
                    </div>
                </div>
            )}

            <Image
                src={imgSrc}
                alt={alt}
                fill
                sizes={getResponsiveSizes(layout)}
                placeholder="blur"
                blurDataURL={generateBlurPlaceholder(blurColor)}
                className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />
        </div>
    )
}

/**
 * PlaceholderImage - Shows a styled placeholder for missing content
 * Used when no real image is available yet
 */
export function PlaceholderImage({
    type = 'default',
    aspectRatio = '16:10',
    className = '',
    label,
}: {
    type?: PlaceholderType
    aspectRatio?: AspectRatio
    className?: string
    label?: string
}) {
    const aspectClass = getAspectRatioClass(aspectRatio)

    return (
        <div className={`relative overflow-hidden ${aspectClass} ${className}`}>
            <Image
                src={getPlaceholder(type)}
                alt={label || 'Placeholder'}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
            />
            {label && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3">
                    <span className="text-white text-sm font-medium">{label}</span>
                </div>
            )}
        </div>
    )
}
