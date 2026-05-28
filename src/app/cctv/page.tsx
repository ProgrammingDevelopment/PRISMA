"use client";

import { useEffect, useState } from 'react';
import { useSecureAuth } from '@/lib/security-hooks';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Camera, Lock, RefreshCcw, Video } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface CCTVStream {
  id: string;
  nama: string;
  lokasi: string;
  streamUrl: string;
  status: 'Active' | 'Inactive';
  isPublic: boolean;
  thumbnailUrl: string; // Used as fallback/placeholder if stream requires specific player
}

export default function CCTVPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useSecureAuth();
  const router = useRouter();
  const [streams, setStreams] = useState<CCTVStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=/cctv');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchCCTVStreams = async () => {
      setLoading(true);
      // TEMPLATE: Integrasi API CCTV RT Wilayah Setempat
      // In production, this would fetch from your backend which proxies to the real DVR/NVR/IP Camera API
      // e.g., const res = await secureFetch('/api/cctv/streams');
      
      // Simulating API latency and response
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
            id: 'cam-02',
            nama: 'Pos Kamling',
            lokasi: 'Blok B Pertigaan',
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            status: 'Active',
            isPublic: false, // Warga RT 04 Only
            thumbnailUrl: 'https://images.unsplash.com/photo-1549109926-58f039549485?auto=format&fit=crop&q=80&w=800'
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

        // Role check: Only admin or warga RT04 can see non-public streams.
        // This is a client-side filter for demonstration. In production, the API must filter it.
        const isWargaRT04OrAdmin = user?.role === 'admin' || user?.role === 'warga';
        const filtered = isWargaRT04OrAdmin ? mockStreams : mockStreams.filter(s => s.isPublic);

        setStreams(filtered);
        setLoading(false);
      }, 1500);
    };

    if (isAuthenticated) {
      fetchCCTVStreams();
    }
  }, [isAuthenticated, user?.role]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
    }, 1500);
  };

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="h-8 w-8 text-primary-accent" />
            Live CCTV Lingkungan
          </h1>
          <p className="text-muted-foreground mt-1">
            Pantau keamanan lingkungan RT 04/RW 09 secara real-time.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="w-full md:w-auto">
          <RefreshCcw className="mr-2 h-4 w-4" /> Segarkan
        </Button>
      </div>

      {!loading && streams.length === 0 && (
        <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold">Tidak Ada Kamera Tersedia</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Saat ini tidak ada kamera CCTV yang dapat diakses oleh akun Anda.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)
        ) : (
          streams.map((cam) => (
            <Card key={cam.id} className="overflow-hidden flex flex-col group">
              <div className="relative w-full aspect-video bg-black">
                {cam.status === 'Active' ? (
                  // For a real video stream, you'd use a player like video.js or HLS.js. 
                  // Using OptimizedImage as fallback/thumbnail representation here for payload optimization demonstration.
                  <div className="relative w-full h-full">
                     <OptimizedImage
                      src={cam.thumbnailUrl}
                      alt={`CCTV ${cam.nama}`}
                      aspectRatio="video"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Button variant="secondary" size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40">
                         <Video className="h-6 w-6 text-white" />
                       </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-900">
                    <span className="text-slate-500 font-mono text-sm">NO SIGNAL</span>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2">
                   <Badge variant={cam.status === 'Active' ? 'default' : 'destructive'} className="shadow-sm">
                     {cam.status === 'Active' ? (
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span> LIVE</span>
                     ) : 'OFFLINE'}
                   </Badge>
                   {!cam.isPublic && (
                     <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100 shadow-sm">
                       <Lock className="h-3 w-3 mr-1" /> Internal
                     </Badge>
                   )}
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{cam.nama}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  {cam.lokasi}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
