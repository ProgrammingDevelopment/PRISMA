"use client";

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCcw, Video, AlertCircle } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import Link from 'next/link';

// Using the same interface but only dealing with public streams
interface CCTVStream {
  id: string;
  nama: string;
  lokasi: string;
  streamUrl: string;
  status: 'Active' | 'Inactive';
  isPublic: boolean;
  thumbnailUrl: string;
}

export default function PublicCCTVPage() {
  const [streams, setStreams] = useState<CCTVStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicCCTVStreams = async () => {
      setLoading(true);
      // TEMPLATE: Integrasi API CCTV RT Wilayah Setempat (Public Endpoint)
      // Fetch only public streams. In production: await fetch('/api/cctv/streams/public')
      
      setTimeout(() => {
        const mockStreams: CCTVStream[] = [
          {
            id: 'cam-01',
            nama: 'Gerbang Utama RT 04',
            lokasi: 'Jl. Kemayoran Utama Blok A',
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            status: 'Active',
            isPublic: true,
            thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800'
          },
          {
            id: 'cam-03',
            nama: 'Taman Warga',
            lokasi: 'Fasum RT 04',
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            status: 'Inactive',
            isPublic: true,
            thumbnailUrl: 'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&q=80&w=800'
          }
        ];

        setStreams(mockStreams);
        setLoading(false);
      }, 1200);
    };

    fetchPublicCCTVStreams();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 max-w-6xl">
      <div className="bg-slate-900 text-slate-50 rounded-2xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Camera className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="outline" className="text-blue-300 border-blue-400/30">Portal Terbuka</Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Pantauan CCTV Publik RT 04
          </h1>
          <p className="text-slate-300 text-lg">
            Akses pemantauan area publik lingkungan RT 04/RW 09 untuk masyarakat umum. Transparansi keamanan untuk kenyamanan bersama.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCcw className="mr-2 h-4 w-4" /> Segarkan Kamera
            </Button>
            <Link href="/cctv" passHref>
               <Button variant="secondary">Login Warga RT 04</Button>
            </Link>
          </div>
        </div>
      </div>

      {!loading && streams.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold">CCTV Publik Tidak Tersedia</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Saat ini tidak ada kamera publik yang sedang aktif atau dapat diakses.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          [1, 2].map((i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)
        ) : (
          streams.map((cam) => (
            <Card key={cam.id} className="overflow-hidden flex flex-col group border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="relative w-full aspect-video bg-black rounded-t-xl overflow-hidden">
                {cam.status === 'Active' ? (
                  <div className="relative w-full h-full">
                     <OptimizedImage
                      src={cam.thumbnailUrl}
                      alt={`CCTV ${cam.nama}`}
                      aspectRatio="video"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="opacity-70 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Button variant="secondary" size="icon" className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/30 border border-white/20 h-16 w-16">
                         <Video className="h-8 w-8 text-white" />
                       </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-900">
                    <span className="text-slate-500 font-mono">NO SIGNAL</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4">
                   <Badge variant={cam.status === 'Active' ? 'default' : 'destructive'} className="shadow-lg backdrop-blur-md bg-opacity-90">
                     {cam.status === 'Active' ? (
                        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span> LIVE PUBLIC</span>
                     ) : 'OFFLINE'}
                   </Badge>
                </div>
              </div>
              <CardHeader className="bg-white dark:bg-slate-950 p-6">
                <CardTitle className="text-xl">{cam.nama}</CardTitle>
                <CardDescription className="text-base mt-2">
                  Lokasi: {cam.lokasi}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
      
      <div className="text-center mt-12 text-sm text-slate-500">
         <p>Untuk mengakses kamera internal blok, silakan login sebagai Warga RT 04.</p>
      </div>
    </div>
  );
}
