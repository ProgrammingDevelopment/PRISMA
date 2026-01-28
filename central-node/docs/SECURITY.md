# 🛡️ PRISMA Security Documentation

## Panduan Keamanan Kredensial Admin, Staff, dan Warga

Dokumen ini menjelaskan implementasi keamanan berdasarkan standar **OWASP**, **OSINT Protection**, dan **Reverse Engineering Safety**.

---

## 📋 Daftar Isi

1. [OWASP Coverage](#owasp-coverage)
2. [Penggunaan Security Library](#penggunaan-security-library)
3. [Secure Authentication](#secure-authentication)
4. [Data Masking](#data-masking)
5. [Rate Limiting](#rate-limiting)
6. [Anti-Reverse Engineering](#anti-reverse-engineering)
7. [Best Practices](#best-practices)

---

## 🔐 OWASP Coverage

| OWASP Top 10 | Status | Implementasi |
|--------------|--------|--------------|
| A01: Broken Access Control | ✅ | Session fingerprinting, role-based access |
| A02: Cryptographic Failures | ✅ | Encrypted storage, secure session tokens |
| A03: Injection | ✅ | Input sanitization, XSS prevention |
| A04: Insecure Design | ✅ | Security-first architecture |
| A05: Security Misconfiguration | ✅ | Secure defaults, CSRF tokens |
| A06: Vulnerable Components | ⚠️ | Regular dependency updates required |
| A07: Auth Failures | ✅ | Rate limiting, password strength, session management |
| A08: Data Integrity Failures | ✅ | Input validation, sanitization |
| A09: Logging & Monitoring | ✅ | Audit logging |
| A10: SSRF | ✅ | Secure fetch wrapper |

---

## 💻 Penggunaan Security Library

### 1. Import Security Utilities

```typescript
// Core security functions
import { 
    secureStorage,
    sanitizeInput,
    checkRateLimit,
    maskPhoneNumber,
    maskEmail,
    validatePasswordStrength,
    logSecurityEvent
} from '@/lib/security'

// React hooks
import {
    useSecureAuth,
    useDataMasking,
    useSecureForm,
    usePasswordStrength
} from '@/lib/security-hooks'
```

### 2. Secure Storage

```typescript
// Menyimpan data terenkripsi
secureStorage.set('user_data', userData, {
    encrypt: true,
    expiry: 24 * 60 * 60 * 1000 // 24 jam
})

// Mengambil data (otomatis decrypt)
const data = secureStorage.get<UserData>('user_data')

// Menghapus data
secureStorage.remove('user_data')
```

### 3. Input Sanitization

```typescript
// Sanitasi string tunggal
const safeInput = sanitizeInput(userInput)

// Sanitasi object
const safeForm = sanitizeObject({
    nama: formData.nama,
    email: formData.email,
    telepon: formData.telepon
})
```

---

## 🔑 Secure Authentication

### Menggunakan useSecureAuth Hook

```tsx
import { useSecureAuth } from '@/lib/security-hooks'

function LoginPage() {
    const { 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        error,
        checkPasswordStrength 
    } = useSecureAuth()

    const handleLogin = async () => {
        const success = await login(email, password, 'warga')
        if (success) {
            router.push('/dashboard')
        }
    }

    return (
        // ... form
    )
}
```

### Password Strength Validation

```tsx
import { usePasswordStrength } from '@/lib/security-hooks'
import { PasswordStrengthIndicator } from '@/components/ui/security'

function PasswordField() {
    const [password, setPassword] = useState('')
    const strength = usePasswordStrength(password)

    return (
        <div>
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrengthIndicator 
                score={strength.score}
                feedback={strength.feedback}
            />
        </div>
    )
}
```

---

## 🎭 Data Masking (OSINT Protection)

### Menggunakan useDataMasking Hook

```tsx
import { useDataMasking } from '@/lib/security-hooks'

function WargaProfile({ warga }) {
    const { maskData, showSensitive, toggleVisibility } = useDataMasking()

    const masked = maskData({
        phone: warga.telepon,
        email: warga.email,
        nik: warga.nik,
        name: warga.nama
    })

    return (
        <div>
            <p>NIK: {masked.nik}</p>
            <p>Telepon: {masked.phone}</p>
            <Button onClick={toggleVisibility}>
                {showSensitive ? 'Sembunyikan' : 'Tampilkan'} Data
            </Button>
        </div>
    )
}
```

### Format Masking

| Data Type | Original | Masked |
|-----------|----------|--------|
| Phone | 087872004448 | 0878****4448 |
| Email | warga@email.com | wa***@email.com |
| NIK | 3171234567890123 | 3171********0123 |
| Name | Budi Santoso | B**********o |

---

## ⏱️ Rate Limiting

### Menggunakan Rate Limit

```typescript
import { checkRateLimit, resetRateLimit } from '@/lib/security'

// Cek sebelum aksi sensitif
const result = checkRateLimit('login', 5, 60000, 300000)
// 5 percobaan per 60 detik, blokir 5 menit jika melebihi

if (!result.allowed) {
    console.log(`Diblokir sampai: ${result.blockedUntil}`)
    return
}

// Setelah login berhasil
resetRateLimit('login')
```

### Rate Limit Warning UI

```tsx
import { RateLimitWarning } from '@/components/ui/security'

function LoginForm() {
    const [rateLimit, setRateLimit] = useState({ 
        remainingAttempts: 5 
    })

    return (
        <form>
            <RateLimitWarning 
                remainingAttempts={rateLimit.remainingAttempts}
                blockedUntil={rateLimit.blockedUntil}
            />
            {/* ... form fields */}
        </form>
    )
}
```

---

## 🔒 Anti-Reverse Engineering

### Proteksi Otomatis

Security library secara otomatis mengaktifkan:

1. **DevTools Detection** - Mendeteksi pembukaan Developer Tools
2. **Console Disable** - Menonaktifkan console.log di production
3. **Session Fingerprinting** - Mencegah session hijacking
4. **Memory Storage Fallback** - Jika sessionStorage diblokir

### Manual Initialization

```typescript
import { initSecurityProtections } from '@/lib/security'

// Dipanggil otomatis, tapi bisa manual jika perlu
initSecurityProtections()
```

---

## 📊 Audit Logging

### Log Security Events

```typescript
import { logSecurityEvent, getAuditLog } from '@/lib/security'

// Log event sukses
logSecurityEvent('user_data_access', true, 'Admin accessed warga list')

// Log event gagal
logSecurityEvent('login_attempt', false, 'Invalid password for user@email.com')

// Ambil audit log (untuk admin)
const logs = getAuditLog()
```

---

## ✅ Best Practices

### Do's ✓

1. **Selalu sanitasi input user** sebelum menyimpan atau menampilkan
2. **Gunakan secure storage** untuk data sensitif
3. **Terapkan rate limiting** pada endpoint sensitif
4. **Mask data sensitif** saat tidak diperlukan
5. **Log security events** untuk monitoring
6. **Validasi password strength** saat registrasi
7. **Gunakan CSRF token** untuk form submission

### Don'ts ✗

1. ❌ Jangan simpan password plain text
2. ❌ Jangan tampilkan NIK/KK penuh di UI
3. ❌ Jangan bypass rate limiting
4. ❌ Jangan log data sensitif ke console
5. ❌ Jangan trust client-side validation saja
6. ❌ Jangan expose internal error messages

---

## 🚨 Incident Response

Jika terjadi security breach:

1. **Immediate**: Clear semua session dengan `secureStorage.clear()`
2. **Notify**: Log incident dengan `logSecurityEvent('security_breach', false, details)`
3. **Reset**: Reset semua rate limits
4. **Audit**: Review audit log untuk investigasi

---

## 📞 Support

Untuk pertanyaan keamanan, hubungi:
- **Pengurus RT**: +62 878-7200-4448
- **Email**: security@prisma-rt04.id

---

*Dokumen ini terakhir diperbarui: Januari 2026*
