"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"

import { Header } from "@/components/Header"
import { ItemCard } from "@/components/items/ItemCard"
import { ItemFiltersBar } from "@/components/items/ItemFiltersBar"
import { PaginationControls } from "@/components/PaginationControls"

import {
    fetchItemsWithDetails,
    fetchClaimedCount,
    fetchCampuses,
    fetchCategories,
    fetchItemImages,
} from "@/services/items"

import type {
    ItemWithDetails,
    Campus,
    Category,
    ItemFilters,
    ItemImage,
} from "@/types/database"

const PAGE_SIZE = 10

export default function HomePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const [items, setItems] = useState<ItemWithDetails[]>([])
    const [itemImages, setItemImages] = useState<Record<number, ItemImage[]>>({})
    const [total, setTotal] = useState(0)
    const [claimedCount, setClaimedCount] = useState(0)
    const [campuses, setCampuses] = useState<Campus[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [heroSearch, setHeroSearch] = useState(searchParams.get("q") || "")

    const filters: ItemFilters = {
        search: searchParams.get("q") || undefined,
        category_id: searchParams.get("cat")
            ? Number(searchParams.get("cat"))
            : undefined,
        campus_id: searchParams.get("campus")
            ? Number(searchParams.get("campus"))
            : undefined,
        type: (searchParams.get("type") as any) || undefined,
        status: (searchParams.get("status") as any) || undefined,
        page: Number(searchParams.get("page")) || 1,
        pageSize: PAGE_SIZE,
    }

    const setFilters = (f: ItemFilters) => {
        const params = new URLSearchParams()

        if (f.search) params.set("q", f.search)
        if (f.category_id) params.set("cat", f.category_id.toString())
        if (f.campus_id) params.set("campus", f.campus_id.toString())
        if (f.type) params.set("type", f.type)
        if (f.status) params.set("status", f.status)
        if (f.page && f.page > 1) params.set("page", f.page.toString())

        const queryString = params.toString()
        router.push(queryString ? `${pathname}?${queryString}` : pathname)
    }

    const loadData = useCallback(async () => {
        setLoading(true)

        try {
            const [itemsResult, claimed, camps, cats] = await Promise.all([
                fetchItemsWithDetails(filters),
                fetchClaimedCount(),
                fetchCampuses(),
                fetchCategories(),
            ])

            setItems(itemsResult.items)
            setTotal(itemsResult.total)
            setClaimedCount(claimed)
            setCampuses(camps)
            setCategories(cats)

            const imagePromises = itemsResult.items.map((item) =>
                fetchItemImages(item.id)
            )
            const imagesResults = await Promise.all(imagePromises)

            const imagesMap: Record<number, ItemImage[]> = {}
            itemsResult.items.forEach((item, idx) => {
                imagesMap[item.id] = imagesResults[idx]
            })

            setItemImages(imagesMap)
        } catch (err) {
            console.error("Error loading items:", err)
        } finally {
            setLoading(false)
        }
    }, [searchParams.toString()])

    useEffect(() => {
        loadData()
    }, [loadData])

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="relative overflow-hidden py-16 md:py-24">
                <div className="absolute inset-0 opacity-[0.03]" />
                <div className="container relative space-y-6 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                        Pertences que ajudamos a recuperar{" "}
                        <span className="text-blue-600">{claimedCount}</span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Encontrou ou perdeu algo no campus? Publique aqui e ajude a
                        comunidade universitária a se reconectar com seus pertences.
                    </p>
                </div>
            </section>

            {/* Main content */}
            <section className="container space-y-6 pb-16">
                <ItemFiltersBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    campuses={campuses}
                    categories={categories}
                    showStatus
                />

                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-video w-full rounded-lg" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-lg text-muted-foreground">
                            Nenhum item encontrado.
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tente ajustar os filtros de busca.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((item, i) => (
                            <div
                                key={item.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <ItemCard item={item} images={itemImages[item.id]} />
                            </div>
                        ))}
                    </div>
                )}

                <PaginationControls
                    page={filters.page || 1}
                    totalPages={totalPages}
                    onPageChange={(p) => setFilters({ ...filters, page: p })}
                />
            </section>
        </div>
    )
}