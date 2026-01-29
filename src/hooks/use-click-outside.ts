import { useEffect, RefObject } from 'react'

type EventHandler = (event: MouseEvent | TouchEvent) => void

/**
 * Hook to detect clicks outside of a specified element.
 * Optimized for low latency by listening to 'mousedown' and 'touchstart'.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    handler: EventHandler
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const el = ref.current

            // Do nothing if clicking ref's element or descendent elements
            if (!el || el.contains(event.target as Node)) {
                return
            }

            handler(event)
        }

        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener)

        return () => {
            document.removeEventListener('mousedown', listener)
            document.removeEventListener('touchstart', listener)
        }
    }, [ref, handler])
}
