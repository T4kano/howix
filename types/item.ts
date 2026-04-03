export type ItemWithDetails = {
    id: number
    title: string
    item_description: string | null
    location_description: string | null
    event_date: string
    type: "lost" | "found"
    status: "open" | "claimed"
    deleted_at: string | null
    created_at: string

    category_name: string | null
    campus_name: string | null

    author_name: string | null
    author_avatar_url: string | null
}
