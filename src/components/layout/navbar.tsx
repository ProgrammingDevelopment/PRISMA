"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Bell, User, ChevronDown, FileText, BarChart3, ShieldAlert, ShieldCheck } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                                P
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                PRISMA RT 04
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                            Beranda
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary outline-none">
                                Layanan Digital <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link href="#admin" className="flex items-center gap-2 cursor-pointer">
                                        <FileText className="h-4 w-4" />
                                        <span>Administrasi & Surat</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="#finance" className="flex items-center gap-2 cursor-pointer">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>Transparansi Keuangan</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary outline-none">
                                Respons & Keamanan <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link href="#response" className="flex items-center gap-2 cursor-pointer">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span>Pengaduan & Darurat</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="#security" className="flex items-center gap-2 cursor-pointer">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>Keamanan Lingkungan</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="#about" className="text-sm font-medium transition-colors hover:text-primary">
                            Tentang Kami
                        </Link>
                    </div>

                    {/* Utility Area */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                        </Button>
                        <ThemeToggle />
                        <Button size="sm" className="gap-2" asChild>
                            <Link href="/auth/login">
                                <User className="h-4 w-4" />
                                Login Warga
                            </Link>
                        </Button>
                    </div>

                    {/* Mobile Navigation Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isOpen && (
                    <div className="md:hidden border-t py-4">
                        <div className="flex flex-col space-y-4 px-2">
                            <Link
                                href="/"
                                className="text-sm font-medium hover:text-primary py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Beranda
                            </Link>

                            <div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
                                <div className="text-sm font-semibold text-muted-foreground">Layanan Digital</div>
                                <Link
                                    href="#admin"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Administrasi & Surat
                                </Link>
                                <Link
                                    href="#finance"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Transparansi Keuangan
                                </Link>
                            </div>

                            <div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
                                <div className="text-sm font-semibold text-muted-foreground">Respons & Keamanan</div>
                                <Link
                                    href="#response"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Pengaduan & Darurat
                                </Link>
                                <Link
                                    href="#security"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Keamanan Lingkungan
                                </Link>
                            </div>

                            <Link
                                href="#about"
                                className="text-sm font-medium hover:text-primary py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Tentang Kami
                            </Link>

                            <div className="pt-4 flex items-center justify-between border-t mt-2">
                                <ThemeToggle />
                                <Button size="sm" className="gap-2" asChild>
                                    <Link href="/auth/login">
                                        <User className="h-4 w-4" />
                                        Login Warga
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
