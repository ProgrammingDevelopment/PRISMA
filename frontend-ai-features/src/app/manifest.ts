import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PRISMA RT 04 Kemayoran',
        short_name: 'PRISMA RT 04',
        description: 'Sistem Manajemen Digital RT 04/RW 09 Kemayoran',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
