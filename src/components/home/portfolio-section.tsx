"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Image from "next/image"

// Types
interface PortfolioItem {
    id: number
    title: string
    category: string
    imageUrl: string
    description: string
}

interface PortfolioSectionProps {
    items: PortfolioItem[]
}

export function PortfolioSection({ items }: PortfolioSectionProps) {
    return (
        <section id="portfolio" className="py-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold mb-4">Our Portfolio</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Recent activities and projects managed by RT 04
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-video relative">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform hover:scale-105 duration-500"
                                    />
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                                            {item.category}
                                        </span>
                                    </div>
                                    <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="line-clamp-2">
                                        {item.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
