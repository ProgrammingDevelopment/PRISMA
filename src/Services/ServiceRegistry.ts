// ServiceRegistry — Service discovery and mode toggle
// Controls whether the app uses local (SQLite/Mock) or remote (Microservices API)

export type ServiceMode = 'local' | 'remote' | 'hybrid';

export interface ServiceStatus {
  name: string;
  mode: ServiceMode;
  isAvailable: boolean;
  url?: string;
}

class ServiceRegistryClass {
  private mode: ServiceMode = 'local';

  constructor() {
    // Read mode from environment variable or default to local
    if (typeof window !== 'undefined') {
      const envMode = process.env.NEXT_PUBLIC_SERVICE_MODE as ServiceMode;
      if (envMode && ['local', 'remote', 'hybrid'].includes(envMode)) {
        this.mode = envMode;
      }
    }
  }

  /**
   * Get current service mode
   */
  getMode(): ServiceMode {
    return this.mode;
  }

  /**
   * Set service mode
   */
  setMode(mode: ServiceMode): void {
    this.mode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('prisma_service_mode', mode);
    }
  }

  /**
   * Check if a specific domain should use local data source
   */
  isLocal(domain?: string): boolean {
    if (this.mode === 'local') return true;
    if (this.mode === 'remote') return false;

    // Hybrid mode: local for data, remote for AI
    if (this.mode === 'hybrid') {
      return domain !== 'ai';
    }

    return true;
  }

  /**
   * Check if a specific domain should use remote API
   */
  isRemote(domain?: string): boolean {
    return !this.isLocal(domain);
  }

  /**
   * Get API Gateway URL
   */
  getGatewayUrl(): string {
    return process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000/api/v1';
  }

  /**
   * Get service URL for a specific domain
   */
  getServiceUrl(domain: string): string {
    const gateway = this.getGatewayUrl();
    const paths: Record<string, string> = {
      warga: '/warga',
      keuangan: '/keuangan',
      keamanan: '/keamanan',
      surat: '/surat',
      ai: '/ai',
    };
    return `${gateway}${paths[domain] ?? ''}`;
  }

  /**
   * Get status of all services
   */
  async getServiceStatuses(): Promise<ServiceStatus[]> {
    const services = ['warga', 'keuangan', 'keamanan', 'surat', 'ai'];

    return Promise.all(
      services.map(async (name) => {
        const status: ServiceStatus = {
          name,
          mode: this.isLocal(name) ? 'local' : 'remote',
          isAvailable: true,
        };

        if (this.isRemote(name)) {
          status.url = this.getServiceUrl(name);
          try {
            const response = await fetch(`${status.url}/health`, {
              signal: AbortSignal.timeout(3000),
            });
            status.isAvailable = response.ok;
          } catch {
            status.isAvailable = false;
          }
        }

        return status;
      })
    );
  }
}

// Singleton
export const ServiceRegistry = new ServiceRegistryClass();
export default ServiceRegistry;
