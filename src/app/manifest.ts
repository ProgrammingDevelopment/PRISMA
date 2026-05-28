import { MetadataRoute } from 'next'

export const dynamic = 'force-static';
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PRISMA RT 04 Kemayoran',
        short_name: 'PRISMA RT04',
        description: 'Sistem Manajemen Digital RT 04/RW 09 Kemayoran - Platform Realisasi Informasi, Sistem Manajemen & Administrasi',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        categories: ['government', 'social', 'utilities'],
        lang: 'id',
        dir: 'ltr',
        prefer_related_applications: false,
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/images/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/images/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        screenshots: [
            {
                src: '/images/placeholders/banner.png',
                sizes: '1280x720',
                type: 'image/png',
                form_factor: 'wide',
                label: 'PRISMA RT 04 - Dashboard Utama',
            },
            {
                src: '/images/placeholders/kegiatan.png',
                sizes: '750x1334',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'PRISMA RT 04 - Tampilan Mobile',
            },
        ],
    }
}
