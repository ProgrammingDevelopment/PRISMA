// Configuration for API Service Discovery
// "Direct DNS" Strategy configuration

export const ApiConfig = {
    // Development / Default (Localhost)
    development: {
        decisionService: "http://localhost:5014",
        optimizationService: "http://localhost:5133",
        imageService: "http://localhost:5014", // Same as Decision for now
    },
    // Direct DNS / Production-like Simulation
    // Requires 'hosts' file modification:
    // 127.0.0.1 ai.prisma.local
    // 127.0.0.1 opt.prisma.local
    // 127.0.0.1 assets.prisma.local
    directDns: {
        decisionService: "http://ai.prisma.local:5014",
        optimizationService: "http://opt.prisma.local:5133",
        imageService: "http://assets.prisma.local:5014",
    },

    // Active Strategy
    // Toggling this allows switching between Direct DNS and safe Localhost navigation
    useDirectDns: false, // Set to true after running setup-local-dns.ps1

    get baseUrl() {
        return this.useDirectDns ? this.directDns : this.development;
    }
};
