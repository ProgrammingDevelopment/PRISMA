"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2, Info, CheckCircle, AlertCircle, Users, Shield, Wallet } from "lucide-react"
import { authenticateDemo, DEMO_USERS, BETA_CONFIG, DemoUser } from "@/lib/demo-credentials"
import {
    checkRateLimit,
    resetRateLimit,
    sanitizeInput,
    logSecurityEvent,
    secureStorage,
    storeCredentials
} from "@/lib/security"
import { RateLimitWarning, SecurityBadge } from "@/components/ui/security"

import { useClickOutside } from '@/hooks/use-click-outside'

export default function LoginPage() {
    const router = useRouter()
    const demoRef = React.useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showDemoCredentials, setShowDemoCredentials] = React.useState(false)

    useClickOutside(demoRef, () => {
        if (showDemoCredentials) setShowDemoCredentials(false)
    })

    const [loginError, setLoginError] = React.useState<string | null>(null)
    const [loginSuccess, setLoginSuccess] = React.useState(false)
    const [rateLimit, setRateLimit] = React.useState({ remainingAttempts: 5, blockedUntil: undefined as Date | undefined })

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setLoginError(null)

        // SECURITY: Rate limit check
        const rateLimitCheck = checkRateLimit('login', 5, 60000, 300000)
        setRateLimit({
            remainingAttempts: rateLimitCheck.remainingAttempts,
            blockedUntil: rateLimitCheck.blockedUntil
        })

        if (!rateLimitCheck.allowed) {
            setLoginError(`Terlalu banyak percobaan. Coba lagi pada ${rateLimitCheck.blockedUntil?.toLocaleTimeString('id-ID')}`)
            logSecurityEvent('login_rate_limited', false, 'Rate limit exceeded')
            return
        }

        setIsLoading(true)

        const form = event.target as HTMLFormElement
        // SECURITY: Sanitize inputs to prevent XSS/injection
        const email = sanitizeInput((form.elements.namedItem('email') as HTMLInputElement).value)
        const password = (form.elements.namedItem('password') as HTMLInputElement).value

        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Authenticate with demo credentials
        const user = authenticateDemo(email, password)

        if (user) {
            setLoginSuccess(true)

            // SECURITY: Store credentials securely (encrypted)
            storeCredentials({
                userId: String(user.id),
                role: user.role as 'admin' | 'staff' | 'warga',
                sessionToken: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            })

            // Legacy storage for backward compatibility (will be deprecated)
            localStorage.setItem('warga_logged_in', 'true')
            localStorage.setItem('warga_profile', JSON.stringify({
                id: user.id,
                nama: user.nama,
                email: user.email,
                telepon: user.no_telepon, // Normalized key
                no_telepon: user.no_telepon,
                tanggal_lahir: user.tanggal_lahir,
                alamat: user.alamat,
                blok: user.blok,
                no_rumah: user.no_rumah,
                foto_path: user.foto_path,
                status: user.status,
                role: user.role,
                permissions: user.permissions,
                tanggal_daftar: new Date().toISOString().split('T')[0],
            }))

            // SECURITY: Reset rate limit on successful login
            resetRateLimit('login')
            logSecurityEvent('login_success', true, `User: ${user.email}, Role: ${user.role}`)

            await new Promise(resolve => setTimeout(resolve, 500))

            // Redirect based on role
            if (user.role === 'admin') {
                router.push("/admin")
            } else {
                router.push("/profile")
            }
        } else {
            // SECURITY: Log failed attempt
            logSecurityEvent('login_failed', false, `Email: ${email}`)
            setLoginError("Email atau password salah. Gunakan demo credentials di bawah.")
            setIsLoading(false)
        }
    }

    const fillDemoCredentials = (user: DemoUser) => {
        const emailInput = document.getElementById('email') as HTMLInputElement
        const passwordInput = document.getElementById('password') as HTMLInputElement
        if (emailInput && passwordInput) {
            emailInput.value = user.email
            passwordInput.value = user.password
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="h-4 w-4" />
            case 'pengurus': return <Users className="h-4 w-4" />
            default: return <Users className="h-4 w-4" />
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            case 'pengurus': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        }
    }

    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Branding */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="h-10 w-10 rounded-xl bg-white/20 mr-3 flex items-center justify-center font-bold text-xl backdrop-blur-sm">P</div>
                    PRISMA RT 04
                </div>

                {/* Beta Badge */}
                <div className="relative z-20 mt-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-200 text-sm font-medium backdrop-blur-sm border border-amber-500/30">
                        <Info className="h-4 w-4" />
                        Beta Mode v{BETA_CONFIG.version}
                    </span>
                </div>

                {/* Feature List */}
                <div className="relative z-20 mt-auto space-y-4">
                    <h3 className="text-lg font-semibold opacity-90">Fitur Beta Preview:</h3>
                    <ul className="space-y-2 text-sm opacity-80">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Transparansi Keuangan Real-time
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Custom Input Anggaran Dana
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            AI-Powered Analysis & Saran
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Monitoring Budget Berkala
                        </li>
                    </ul>

                    <blockquote className="border-l-2 border-white/30 pl-4 mt-6">
                        <p className="text-base italic opacity-90">
                            "Platform PRISMA membawa RT 04 ke era digital dengan transparansi penuh."
                        </p>
                        <footer className="text-sm opacity-70 mt-2">— Ketua RT 04 RW 09 Kemayoran</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="lg:p-8 p-4">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Login Portal Warga</h1>
                        <p className="text-sm text-muted-foreground">
                            Masuk menggunakan email @rt0409.local
                        </p>
                    </div>

                    {/* Login Form Card */}
                    <Card className="border-2">
                        <form onSubmit={onSubmit}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <span>Login</span>
                                    <SecurityBadge level="high" className="ml-auto" />
                                </CardTitle>
                                <CardDescription>Akses dashboard warga RT 04</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {loginError && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        {loginError}
                                    </div>
                                )}

                                {loginSuccess && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
                                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                        Login berhasil! Mengalihkan...
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            placeholder="nama@rt0409.local"
                                            type="email"
                                            className="pl-10"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-10"
                                            required
                                            autoComplete="current-password"
                                        />
                                    </div>
                                </div>

                                {/* Rate Limit Status */}
                                <RateLimitWarning
                                    remainingAttempts={rateLimit.remainingAttempts}
                                    blockedUntil={rateLimit.blockedUntil}
                                />
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button className="w-full" disabled={isLoading || loginSuccess}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loginSuccess ? "Berhasil!" : "Masuk"}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Belum terdaftar?{" "}
                                    <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary">
                                        Buat akun baru
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Demo Credentials Section */}
                    <Card ref={demoRef} className="border-dashed border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <Info className="h-4 w-4" />
                                    Demo Credentials (Beta)
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                                    className="text-xs"
                                >
                                    {showDemoCredentials ? 'Sembunyikan' : 'Tampilkan'}
                                </Button>
                            </div>
                        </CardHeader>

                        {showDemoCredentials && (
                            <CardContent className="pt-0">
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {DEMO_USERS.map((user) => (
                                        <div
                                            key={user.id}
                                            className="p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                            onClick={() => fillDemoCredentials(user)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm truncate max-w-[200px]">{user.nama}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(user.role)}`}>
                                                    {getRoleIcon(user.role)}
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3" />
                                                    <code className="bg-muted px-1 rounded">{user.email}</code>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Lock className="h-3 w-3" />
                                                    <code className="bg-muted px-1 rounded">{user.password}</code>
                                                </div>
                                            </div>
                                            <div className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Klik untuk mengisi form →
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-3 text-center">
                                    Domain: <code className="bg-muted px-1 rounded">@rt0409.local</code>
                                </p>
                            </CardContent>
                        )}
                    </Card>

                    {/* Quick Access Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                                const emailInput = document.getElementById('email') as HTMLInputElement
                                const passwordInput = document.getElementById('password') as HTMLInputElement
                                if (emailInput && passwordInput) {
                                    emailInput.value = "admin@rt0409.local"
                                    passwordInput.value = "admin123"
                                }
                            }}
                        >
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                                const emailInput = document.getElementById('email') as HTMLInputElement
                                const passwordInput = document.getElementById('password') as HTMLInputElement
                                if (emailInput && passwordInput) {
                                    emailInput.value = "bendahara@rt0409.local"
                                    passwordInput.value = "benda123"
                                }
                            }}
                        >
                            <Wallet className="h-3 w-3 mr-1" />
                            Bendahara
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                                const emailInput = document.getElementById('email') as HTMLInputElement
                                const passwordInput = document.getElementById('password') as HTMLInputElement
                                if (emailInput && passwordInput) {
                                    emailInput.value = "budi.warga@rt0409.local"
                                    passwordInput.value = "warga123"
                                }
                            }}
                        >
                            <Users className="h-3 w-3 mr-1" />
                            Warga
                        </Button>
                    </div>

                    {/* WhatsApp Contact Support */}
                    <div className="flex flex-col items-center pt-4 border-t border-dashed">
                        <p className="text-xs text-muted-foreground mb-3">Butuh bantuan akses?</p>
                        <Link
                            href="https://wa.me/6281234567890?text=Halo%20Admin%20PRISMA,%20saya%20butuh%20bantuan%20login%20ke%20portal%20RT%2004."
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-sm font-medium transition-all hover:scale-105 shadow-md"
                        >
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Hubungi Admin RT
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
