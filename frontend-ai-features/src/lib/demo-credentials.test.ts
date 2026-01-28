import { describe, it, expect } from 'vitest'
import {
    authenticateDemo,
    getDemoUserByEmail,
    hasPermission,
    DEMO_USERS,
    BETA_CONFIG
} from './demo-credentials'

describe('Demo Credentials System', () => {
    describe('DEMO_USERS', () => {
        it('should have at least 5 demo users', () => {
            expect(DEMO_USERS.length).toBeGreaterThanOrEqual(5)
        })

        it('should have users with rt0409.local domain', () => {
            DEMO_USERS.forEach(user => {
                expect(user.email).toMatch(/@rt0409\.local$/)
            })
        })

        it('should have admin, pengurus, and warga roles', () => {
            const roles = DEMO_USERS.map(u => u.role)
            expect(roles).toContain('admin')
            expect(roles).toContain('pengurus')
            expect(roles).toContain('warga')
        })

        it('should have valid status for all users', () => {
            DEMO_USERS.forEach(user => {
                expect(['Aktif', 'Pending', 'Nonaktif']).toContain(user.status)
            })
        })
    })

    describe('authenticateDemo', () => {
        it('should authenticate valid admin credentials', () => {
            const user = authenticateDemo('admin@rt0409.local', 'admin123')
            expect(user).not.toBeNull()
            expect(user?.role).toBe('admin')
            expect(user?.nama).toBe('Pak Hendra Wijaya')
        })

        it('should authenticate valid warga credentials', () => {
            const user = authenticateDemo('budi.warga@rt0409.local', 'warga123')
            expect(user).not.toBeNull()
            expect(user?.role).toBe('warga')
        })

        it('should be case-insensitive for email', () => {
            const user1 = authenticateDemo('ADMIN@RT0409.LOCAL', 'admin123')
            const user2 = authenticateDemo('Admin@rt0409.local', 'admin123')
            expect(user1).not.toBeNull()
            expect(user2).not.toBeNull()
        })

        it('should return null for invalid password', () => {
            const user = authenticateDemo('admin@rt0409.local', 'wrongpassword')
            expect(user).toBeNull()
        })

        it('should return null for non-existent email', () => {
            const user = authenticateDemo('nonexistent@rt0409.local', 'admin123')
            expect(user).toBeNull()
        })
    })

    describe('getDemoUserByEmail', () => {
        it('should find user by email', () => {
            const user = getDemoUserByEmail('bendahara@rt0409.local')
            expect(user).not.toBeNull()
            expect(user?.nama).toBe('Pak Ahmad Fauzi')
        })

        it('should return null for non-existent email', () => {
            const user = getDemoUserByEmail('unknown@rt0409.local')
            expect(user).toBeNull()
        })
    })

    describe('hasPermission', () => {
        it('should return true for admin with all permissions', () => {
            const admin = DEMO_USERS.find(u => u.role === 'admin')!
            expect(hasPermission(admin, 'manage_finance')).toBe(true)
            expect(hasPermission(admin, 'manage_users')).toBe(true)
            expect(hasPermission(admin, 'any_permission')).toBe(true)
        })

        it('should return true for pengurus with specific permission', () => {
            const bendahara = getDemoUserByEmail('bendahara@rt0409.local')!
            expect(hasPermission(bendahara, 'manage_finance')).toBe(true)
            expect(hasPermission(bendahara, 'view_letters')).toBe(true)
        })

        it('should return false for missing permission', () => {
            const warga = DEMO_USERS.find(u => u.role === 'warga')!
            expect(hasPermission(warga, 'manage_finance')).toBe(false)
            expect(hasPermission(warga, 'manage_users')).toBe(false)
        })
    })

    describe('BETA_CONFIG', () => {
        it('should have beta version', () => {
            expect(BETA_CONFIG.version).toMatch(/^\d+\.\d+\.\d+-beta$/)
        })

        it('should have rt0409.local domain', () => {
            expect(BETA_CONFIG.domain).toBe('rt0409.local')
        })

        it('should have all required features enabled', () => {
            expect(BETA_CONFIG.features.demoLogin).toBe(true)
            expect(BETA_CONFIG.features.customFinanceInput).toBe(true)
            expect(BETA_CONFIG.features.realtimeAnalysis).toBe(true)
            expect(BETA_CONFIG.features.budgetMonitoring).toBe(true)
        })
    })
})
