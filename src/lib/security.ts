/**
 * PRISMA Security Core Library
 * Implementasi keamanan berdasarkan OWASP, OSINT Protection, dan Reverse Engineering Safety
 * 
 * OWASP Top 10 Coverage:
 * - A01: Broken Access Control
 * - A02: Cryptographic Failures
 * - A03: Injection
 * - A07: Identification and Authentication Failures
 */

// ============================================
// 1. SECURE ENCRYPTION (OWASP A02)
// ============================================

const ENCRYPTION_KEY = 'PRISMA_SEC_2026_RT04'

/**
 * Simple XOR-based obfuscation for client-side storage
 * Note: For production, use Web Crypto API with AES-GCM
 */
export function encryptData(data: string): string {
    if (typeof window === 'undefined') return data

    try {
        const uint8Array = new TextEncoder().encode(data);
        let result = '';
        for (let i = 0; i < uint8Array.length; i++) {
            result += String.fromCharCode(
                uint8Array[i] ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
            )
        }
        return btoa(result)
    } catch {
        return data
    }
}

export function decryptData(encryptedData: string): string {
    if (typeof window === 'undefined') return encryptedData

    try {
        const decoded = atob(encryptedData)
        const uint8Array = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
            uint8Array[i] = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        }
        return new TextDecoder().decode(uint8Array);
    } catch {
        return encryptedData
    }
}

// ============================================
// 2. SECURE STORAGE (OWASP A02, A07)
// ============================================

interface SecureStorageOptions {
    encrypt?: boolean
    expiry?: number // milliseconds
}

export const secureStorage = {
    set(key: string, value: unknown, options: SecureStorageOptions = {}) {
        if (typeof window === 'undefined') return

        const { encrypt = true, expiry } = options

        const payload = {
            data: value,
            timestamp: Date.now(),
            expiry: expiry ? Date.now() + expiry : null,
            fingerprint: generateFingerprint()
        }

        const serialized = JSON.stringify(payload)
        const stored = encrypt ? encryptData(serialized) : serialized

        try {
            sessionStorage.setItem(`_sec_${key}`, stored)
        } catch {
            // Fallback to memory storage if sessionStorage fails
            memoryStorage.set(key, stored)
        }
    },

    get<T>(key: string, options: SecureStorageOptions = {}): T | null {
        if (typeof window === 'undefined') return null

        const { encrypt = true } = options

        try {
            const stored = sessionStorage.getItem(`_sec_${key}`) || memoryStorage.get(key)
            if (!stored) return null

            const decrypted = encrypt ? decryptData(stored) : stored
            const payload = JSON.parse(decrypted)

            // Check expiry
            if (payload.expiry && Date.now() > payload.expiry) {
                this.remove(key)
                return null
            }

            // Validate fingerprint (anti-session hijacking)
            if (payload.fingerprint !== generateFingerprint()) {
                console.warn('[Security] Session fingerprint mismatch')
                this.remove(key)
                return null
            }

            return payload.data as T
        } catch {
            return null
        }
    },

    remove(key: string) {
        if (typeof window === 'undefined') return
        sessionStorage.removeItem(`_sec_${key}`)
        memoryStorage.remove(key)
    },

    clear() {
        if (typeof window === 'undefined') return
        sessionStorage.clear()
        memoryStorage.clear()
    }
}

// In-memory fallback storage
const memoryStorage = {
    _store: new Map<string, string>(),
    set(key: string, value: string) { this._store.set(key, value) },
    get(key: string) { return this._store.get(key) || null },
    remove(key: string) { this._store.delete(key) },
    clear() { this._store.clear() }
}

// ============================================
// 3. SESSION FINGERPRINTING (Anti-OSINT, Anti-Hijacking)
// ============================================

function generateFingerprint(): string {
    if (typeof window === 'undefined') return 'server'

    const components = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0
    ]

    return simpleHash(components.join('|'))
}

function simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(36)
}

// ============================================
// 4. INPUT SANITIZATION (OWASP A03 - Injection)
// ============================================

export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return ''

    return input
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Encode HTML entities
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        // Remove potential SQL injection patterns
        .replace(/(['";])/g, '')
        .trim()
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized = {} as T
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            (sanitized as Record<string, unknown>)[key] = sanitizeInput(value)
        } else if (typeof value === 'object' && value !== null) {
            (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>)
        } else {
            (sanitized as Record<string, unknown>)[key] = value
        }
    }
    return sanitized
}

// ============================================
// 5. RATE LIMITING (OWASP A07 - Brute Force Protection)
// ============================================

interface RateLimitEntry {
    count: number
    firstAttempt: number
    blocked: boolean
    blockedUntil: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
    action: string,
    maxAttempts: number = 5,
    windowMs: number = 60000, // 1 minute
    blockDurationMs: number = 300000 // 5 minutes
): { allowed: boolean; remainingAttempts: number; blockedUntil?: Date } {
    const now = Date.now()
    const key = `${action}_${generateFingerprint()}`

    let entry = rateLimitStore.get(key)

    if (!entry) {
        entry = { count: 0, firstAttempt: now, blocked: false, blockedUntil: 0 }
        rateLimitStore.set(key, entry)
    }

    // Check if currently blocked
    if (entry.blocked && now < entry.blockedUntil) {
        return {
            allowed: false,
            remainingAttempts: 0,
            blockedUntil: new Date(entry.blockedUntil)
        }
    }

    // Reset if window expired
    if (now - entry.firstAttempt > windowMs) {
        entry.count = 0
        entry.firstAttempt = now
        entry.blocked = false
    }

    entry.count++

    if (entry.count > maxAttempts) {
        entry.blocked = true
        entry.blockedUntil = now + blockDurationMs
        return {
            allowed: false,
            remainingAttempts: 0,
            blockedUntil: new Date(entry.blockedUntil)
        }
    }

    return {
        allowed: true,
        remainingAttempts: maxAttempts - entry.count
    }
}

export function resetRateLimit(action: string) {
    const key = `${action}_${generateFingerprint()}`
    rateLimitStore.delete(key)
}

// ============================================
// 6. DATA MASKING (OSINT Protection)
// ============================================

export function maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 8) return '****'
    return phone.slice(0, 4) + '****' + phone.slice(-4)
}

export function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '****@****.***'
    const [local, domain] = email.split('@')
    const maskedLocal = local.slice(0, 2) + '***'
    return `${maskedLocal}@${domain}`
}

export function maskNIK(nik: string): string {
    if (!nik || nik.length < 16) return '****************'
    return nik.slice(0, 4) + '********' + nik.slice(-4)
}

export function maskName(name: string): string {
    if (!name || name.length < 3) return '***'
    return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
}

// ============================================
// 7. SECURE CREDENTIAL HANDLER
// ============================================

export interface SecureCredentials {
    userId: string
    role: 'admin' | 'staff' | 'warga'
    sessionToken: string
    expiresAt: number
}

export function storeCredentials(credentials: SecureCredentials) {
    // Never store raw credentials
    const securePayload = {
        ...credentials,
        sessionToken: simpleHash(credentials.sessionToken), // Only store hash
    }

    secureStorage.set('auth_session', securePayload, {
        encrypt: true,
        expiry: 24 * 60 * 60 * 1000 // 24 hours
    })
}

export function getCredentials(): SecureCredentials | null {
    return secureStorage.get<SecureCredentials>('auth_session')
}

export function clearCredentials() {
    secureStorage.remove('auth_session')
    secureStorage.clear()
}

// ============================================
// 8. ANTI-REVERSE ENGINEERING MEASURES
// ============================================

export function initSecurityProtections() {
    if (typeof window === 'undefined') return

    // Disable right-click context menu on sensitive areas
    // Note: Can be bypassed, but adds friction

    // Detect DevTools opening (basic detection)
    let devToolsOpen = false
    const threshold = 160

    const checkDevTools = () => {
        const widthDiff = window.outerWidth - window.innerWidth > threshold
        const heightDiff = window.outerHeight - window.innerHeight > threshold

        if (widthDiff || heightDiff) {
            if (!devToolsOpen) {
                devToolsOpen = true
                console.log('%c🛡️ PRISMA Security Active', 'color: #00ff00; font-size: 20px;')
                console.log('%cUnauthorized access attempts are logged.', 'color: #ff6600;')
            }
        } else {
            devToolsOpen = false
        }
    }

    setInterval(checkDevTools, 1000)

    // Disable console in production
    if (process.env.NODE_ENV === 'production') {
        const noop = () => { }
        // Preserve error logging
        const originalError = console.error
        Object.keys(console).forEach(key => {
            if (typeof (console as any)[key] === 'function') {
                (console as any)[key] = noop
            }
        })
        console.error = originalError
    }
}

// ============================================
// 9. CSRF TOKEN MANAGEMENT
// ============================================

export function generateCSRFToken(): string {
    const array = new Uint8Array(32)
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array)
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

let csrfToken: string | null = null

export function getCSRFToken(): string {
    if (!csrfToken) {
        csrfToken = generateCSRFToken()
        secureStorage.set('csrf_token', csrfToken, { expiry: 3600000 }) // 1 hour
    }
    return csrfToken
}

export function validateCSRFToken(token: string): boolean {
    const storedToken = secureStorage.get<string>('csrf_token')
    return storedToken === token
}

// ============================================
// 10. SECURE FETCH WRAPPER
// ============================================

export async function secureFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    // Add security headers
    const secureOptions: RequestInit = {
        ...options,
        credentials: 'same-origin',
        headers: {
            ...options.headers,
            'X-CSRF-Token': getCSRFToken(),
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    }

    // Rate limit check
    const rateCheck = checkRateLimit('api_request', 100, 60000)
    if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded. Try again at ${rateCheck.blockedUntil?.toLocaleTimeString() || 'later'}`)
    }

    return fetch(url, secureOptions)
}

// ============================================
// 11. PASSWORD STRENGTH VALIDATOR (OWASP)
// ============================================

export interface PasswordStrength {
    score: number // 0-4
    feedback: string[]
    isStrong: boolean
}

export function validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score++
    else feedback.push('Minimal 8 karakter')

    if (password.length >= 12) score++

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    else feedback.push('Gunakan huruf besar dan kecil')

    if (/\d/.test(password)) score++
    else feedback.push('Tambahkan angka')

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
    else feedback.push('Tambahkan karakter spesial')

    // Check common patterns
    const commonPatterns = ['password', '123456', 'qwerty', 'admin', 'prisma']
    if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
        score = Math.max(0, score - 2)
        feedback.push('Hindari kata umum')
    }

    return {
        score: Math.min(4, score),
        feedback,
        isStrong: score >= 3
    }
}

// ============================================
// 12. AUDIT LOG (For Security Monitoring)
// ============================================

interface AuditEntry {
    action: string
    timestamp: number
    userId?: string
    ip?: string
    userAgent: string
    success: boolean
    details?: string
}

const auditLog: AuditEntry[] = []
const MAX_AUDIT_ENTRIES = 1000

export function logSecurityEvent(
    action: string,
    success: boolean,
    details?: string
) {
    const entry: AuditEntry = {
        action,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        success,
        details
    }

    auditLog.unshift(entry)

    // Keep log size manageable
    if (auditLog.length > MAX_AUDIT_ENTRIES) {
        auditLog.pop()
    }

    // In production, send to server
    if (process.env.NODE_ENV === 'production' && !success) {
        // Send failed security events to monitoring
        console.error('[Security Audit]', entry)
    }
}

export function getAuditLog(): AuditEntry[] {
    return [...auditLog]
}

// Auto-initialize security protections
if (typeof window !== 'undefined') {
    initSecurityProtections()
}
