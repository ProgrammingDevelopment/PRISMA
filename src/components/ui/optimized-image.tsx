import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage Component
 * Ensures images are responsive, not blurry/pixelated, and handle loading states.
 * Mencegah payload gambar buram, pecah, dan menjamin responsivitas di desktop/mobile.
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.webp',
  containerClassName,
  className,
  aspectRatio = 'auto',
  objectFit = 'cover',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 90,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: 'aspect-auto',
  }[aspectRatio];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md',
        aspectRatioClass,
        containerClassName
      )}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 h-full w-full bg-slate-200 dark:bg-slate-800" />
      )}
      <Image
        src={imgSrc}
        alt={alt}
        sizes={sizes}
        quality={quality}
        priority={priority}
        fill={aspectRatio !== 'auto'}
        width={aspectRatio === 'auto' ? props.width || 800 : undefined}
        height={aspectRatio === 'auto' ? props.height || 600 : undefined}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-105 blur-sm grayscale' : 'scale-100 blur-0 grayscale-0',
          aspectRatio !== 'auto' && `object-${objectFit}`,
          aspectRatio === 'auto' && 'h-auto w-full',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setImgSrc(fallbackSrc);
        }}
        {...props}
      />
    </div>
  );
}
