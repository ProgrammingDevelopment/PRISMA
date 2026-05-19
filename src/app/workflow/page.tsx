"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Palette, Monitor, Server, Users, Code2, Rocket, TestTube, Shield,
    Wrench, ChevronRight, CheckCircle2, Clock, AlertTriangle, ArrowRight,
    Database, Globe, Lock, BarChart3, Cpu, GitBranch, Layers, FileJson,
    Smartphone, Languages, Bot, Ticket, Activity
} from "lucide-react"

type Phase = typeof phases[number]

const phases = [
    {
        id: 1,
        title: "UI/UX Design",
        subtitle: "Prototipe & Demo Interaksi",
        icon: Palette,
        color: "from-violet-500 to-purple-600",
        badge: "bg-violet-500",
        status: "completed" as const,
        duration: "1-2 Minggu",
        team: ["UI/UX Designer", "Product Owner"],
        deliverables: [
            "Wireframe Lo-Fi & Hi-Fi",
            "Interactive Prototype (Figma)",
            "Design System & Component Library",
            "User Flow & Journey Map",
            "Demo aplikasi/website sebagai prototipe",
            "Responsive layout semua device",
        ],
        description: "Membangun prototipe interaktif untuk memahami interaksi yang jelas antara pengguna dan sistem."
    },
    {
        id: 2,
        title: "Tech Design",
        subtitle: "Deployment Diagram & Arsitektur",
        icon: Server,
        color: "from-blue-500 to-cyan-600",
        badge: "bg-blue-500",
        status: "completed" as const,
        duration: "1 Minggu",
        team: ["Tech Lead", "Solution Architect"],
        deliverables: [
            "Deployment Diagram (Cloud Architecture)",
            "Database ERD (Entity Relationship Diagram)",
            "API Design & Technology Overview",
            "Technology Stack Selection",
            "Infrastructure Cost Estimation",
            "Security Architecture Blueprint",
        ],
        description: "Merancang arsitektur teknis lengkap: deployment diagram, database, API, dan technology overview."
    },
    {
        id: 3,
        title: "Architecture Review",
        subtitle: "Multi-Team Review & Approval",
        icon: Users,
        color: "from-emerald-500 to-teal-600",
        badge: "bg-emerald-500",
        status: "in-progress" as const,
        duration: "3-5 Hari",
        team: ["UI/UX Team", "Product Team", "Dev Team", "Security Team"],
        deliverables: [
            "UI/UX Team → Review kesesuaian design",
            "Product Team → Validasi fitur & roadmap",
            "Dev Team → Feasibility & tech debt assessment",
            "Security Team → Threat modeling & compliance",
            "Sign-off document dari semua team",
            "Problem tracking & resolution log",
        ],
        description: "Memastikan apa yang dibuat sudah baik. Jika ada problem akan didiskusikan kembali oleh team."
    },
    {
        id: 4,
        title: "API Specification",
        subtitle: "Backend & Endpoint Development",
        icon: FileJson,
        color: "from-orange-500 to-amber-600",
        badge: "bg-orange-500",
        status: "pending" as const,
        duration: "1 Minggu",
        team: ["Backend Developer", "API Architect"],
        deliverables: [
            "Aplikasi Backend (1 minggu development)",
            "REST API: GET / POST / PUT / DELETE",
            "Endpoint documentation (OpenAPI/Swagger)",
            "Output: ID, Parameter, JSON response",
            "Authentication & Authorization layer",
            "Rate limiting & validation rules",
        ],
        description: "Membangun API backend dengan output mengandung ID parameter JSON, endpoint RESTful lengkap."
    },
    {
        id: 5,
        title: "Development",
        subtitle: "Parallel: BE, FE, QA",
        icon: Code2,
        color: "from-indigo-500 to-blue-600",
        badge: "bg-indigo-500",
        status: "pending" as const,
        duration: "2-4 Minggu",
        team: ["Backend Dev", "Frontend Dev", "QA Engineer"],
        deliverables: [
            "Backend: API implementation & business logic",
            "Frontend: UI components & state management",
            "QA: Test cases & automation scripts",
            "Parallel development workflow",
            "Code review & pair programming",
            "Daily standup & sprint tracking",
        ],
        description: "Development dilakukan secara paralel: Back-End, Front-End, dan QA berjalan bersamaan."
    },
    {
        id: 6,
        title: "Non-Production Deploy",
        subtitle: "Dev → Testing → Staging",
        icon: Rocket,
        color: "from-cyan-500 to-sky-600",
        badge: "bg-cyan-500",
        status: "pending" as const,
        duration: "1-2 Minggu",
        team: ["DevOps", "QA Automation", "QA Engineering"],
        deliverables: [
            "Dev: Back-End & Front-End deployment",
            "Testing: QA Automation & QA Engineering",
            "Staging: CI/CD Pipeline (Continuous Integration)",
            "Environment configuration & secrets",
            "Database migration scripts",
            "Smoke testing per environment",
        ],
        description: "Deploy ke environment non-production: Dev, Testing, dan Staging dengan CI/CD pipeline."
    },
    {
        id: 7,
        title: "Testing (QA)",
        subtitle: "E2E, Performance, Security",
        icon: TestTube,
        color: "from-rose-500 to-pink-600",
        badge: "bg-rose-500",
        status: "pending" as const,
        duration: "1-2 Minggu",
        team: ["QA Performance", "Security Engineer", "QA Lead"],
        deliverables: [
            "E2E Test (End-to-End Testing)",
            "Performance Test (Load & Stress)",
            "Security/Cybersecurity Test",
            "Penetration Testing",
            "Accessibility Audit (WCAG 2.1)",
            "Bug triage & fix verification",
        ],
        description: "Testing menyeluruh: E2E, performance, dan security/cybersecurity testing."
    },
    {
        id: 8,
        title: "Production Deploy",
        subtitle: "Go-Live & Feature Launch",
        icon: Globe,
        color: "from-green-500 to-emerald-600",
        badge: "bg-green-500",
        status: "pending" as const,
        duration: "3-5 Hari",
        team: ["DevOps", "Product Owner", "All Teams"],
        deliverables: [
            "UI, Layout, Placeholder, Tata Kelola",
            "Chatbot & AI Service Integration",
            "Press button featured deployment",
            "Penyesuaian tema & branding",
            "Multi-bahasa: ID, ZH, EN",
            "Push dari staging ke production",
        ],
        description: "Deploy ke production: UI/layout, chatbot, AI service, multi-bahasa (ID, ZH, EN)."
    },
    {
        id: 9,
        title: "Maintenance",
        subtitle: "Perawatan & Monitoring",
        icon: Wrench,
        color: "from-slate-500 to-gray-600",
        badge: "bg-slate-500",
        status: "pending" as const,
        duration: "Ongoing",
        team: ["SRE", "DevOps", "Support"],
        deliverables: [
            "By request fitur baru (Request ↔ Ticket)",
            "Update sertifikat keamanan (TLS/SSL/SSH)",
            "Monitoring data & bandwidth",
            "Total traffic user tracking",
            "Response time monitoring",
            "Incident response & escalation",
        ],
        description: "Perawatan berkelanjutan: monitoring, security updates, dan fitur baru by request."
    },
] as const

const statusConfig = {
    completed: { label: "Selesai", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    "in-progress": { label: "Berjalan", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    pending: { label: "Belum Mulai", icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-muted" },
}

export default function WorkflowPage() {
    const [activePhase, setActivePhase] = useState<number>(0)
    const phase = phases[activePhase]
    const StatusIcon = statusConfig[phase.status].icon

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 py-16 md:py-24">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                <div className="container relative z-10 mx-auto px-4 text-center text-white">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-6 ring-1 ring-white/20">
                            <Layers className="w-4 h-4" />
                            SDLC Workflow
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                            Development Lifecycle
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                            Workflow lengkap dari UI/UX Design hingga Production Deployment & Maintenance
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Progress Bar */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                        {phases.map((p, i) => {
                            const Icon = p.icon
                            const isActive = i === activePhase
                            const isDone = p.status === "completed"
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setActivePhase(i)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                            : isDone
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{p.title}</span>
                                    <span className="sm:hidden">{p.id}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Phase Detail - Left 2/3 */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={phase.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Phase Header Card */}
                                <Card className={`relative overflow-hidden border-0 bg-gradient-to-r ${phase.color} text-white p-6 md:p-8`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm">
                                                <phase.icon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <div className="text-white/60 text-sm font-medium">Fase {phase.id} of {phases.length}</div>
                                                <h2 className="text-2xl md:text-3xl font-bold">{phase.title}</h2>
                                            </div>
                                        </div>
                                        <p className="text-white/80 text-base md:text-lg mb-4">{phase.description}</p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig[phase.status].bg} text-white`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusConfig[phase.status].label}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                {phase.duration}
                                            </span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Deliverables */}
                                <Card className="p-6 mt-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <ChevronRight className="w-5 h-5 text-primary" />
                                        Deliverables & Output
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {phase.deliverables.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                            >
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                                <span className="text-sm">{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Team */}
                                <Card className="p-6 mt-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        Team yang Terlibat
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {phase.team.map((member, i) => (
                                            <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${phase.badge} text-white`}>
                                                {member}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex justify-between pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
                                disabled={activePhase === 0}
                                className="gap-2"
                            >
                                ← Fase Sebelumnya
                            </Button>
                            <Button
                                onClick={() => setActivePhase(Math.min(phases.length - 1, activePhase + 1))}
                                disabled={activePhase === phases.length - 1}
                                className="gap-2"
                            >
                                Fase Berikutnya →
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar - Right 1/3 */}
                    <div className="space-y-6">
                        {/* Phase Overview */}
                        <Card className="p-5">
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Semua Fase</h3>
                            <div className="space-y-2">
                                {phases.map((p, i) => {
                                    const Icon = p.icon
                                    const st = statusConfig[p.status]
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setActivePhase(i)}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all text-sm ${
                                                i === activePhase
                                                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                                    : "hover:bg-muted"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="flex-1 font-medium truncate">{p.title}</span>
                                            <st.icon className={`w-3.5 h-3.5 shrink-0 ${st.color}`} />
                                        </button>
                                    )
                                })}
                            </div>
                        </Card>

                        {/* Tech Stack */}
                        <Card className="p-5">
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Technology Stack</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Monitor, label: "Frontend", value: "Next.js + React" },
                                    { icon: Server, label: "Backend", value: "Node.js / REST API" },
                                    { icon: Database, label: "Database", value: "Supabase PostgreSQL" },
                                    { icon: Globe, label: "Hosting", value: "Cloudflare Pages" },
                                    { icon: GitBranch, label: "CI/CD", value: "GitHub Actions" },
                                    { icon: Lock, label: "Auth", value: "Supabase Auth" },
                                    { icon: Shield, label: "Security", value: "TLS/SSL + CSP" },
                                    { icon: Bot, label: "AI/Chatbot", value: "Gemini API" },
                                    { icon: Languages, label: "i18n", value: "ID, ZH, EN" },
                                    { icon: Smartphone, label: "PWA", value: "Serwist + SW" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="text-muted-foreground w-20 shrink-0">{item.label}</span>
                                        <span className="font-medium truncate">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Monitoring Metrics */}
                        <Card className="p-5">
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Monitoring</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Activity, label: "Response Time", value: "< 200ms" },
                                    { icon: BarChart3, label: "Uptime SLA", value: "99.9%" },
                                    { icon: Cpu, label: "Bandwidth", value: "Monitored" },
                                    { icon: Ticket, label: "Ticketing", value: "Request ↔ Ticket" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="flex-1">{item.label}</span>
                                        <span className="font-medium text-primary">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Visual Pipeline */}
                <section className="mt-16">
                    <h2 className="text-2xl font-bold text-center mb-8">Pipeline Overview</h2>
                    <div className="relative">
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 rounded-full -translate-y-1/2 opacity-20" />
                        <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
                            {phases.map((p, i) => {
                                const Icon = p.icon
                                return (
                                    <motion.button
                                        key={p.id}
                                        onClick={() => setActivePhase(i)}
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                                            i === activePhase ? "bg-primary/10 ring-2 ring-primary shadow-lg" : "hover:bg-muted"
                                        }`}
                                    >
                                        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${p.color} text-white shadow-md`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] md:text-xs font-medium text-center leading-tight">{p.title}</span>
                                        {i < phases.length - 1 && (
                                            <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                        )}
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
