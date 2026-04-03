export interface Profile {
    id: number;
    user_id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Campus {
    id: number;
    name: string;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    created_at: string;
}

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed';

export interface Item {
    id: number;
    user_id: number;
    campus_id: number;
    category_id: number;
    title: string;
    item_description: string | null;
    location_description: string | null;
    event_date: string | null;
    type: ItemType;
    status: ItemStatus;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ItemImage {
    id: number;
    item_id: number;
    image_url: string;
    created_at: string;
}

export interface ItemWithDetails {
    id: number;
    title: string;
    item_description: string | null;
    location_description: string | null;
    event_date: string | null;
    type: ItemType;
    status: ItemStatus;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
    campus_id: number;
    category_id: number;
    category_name: string;
    campus_name: string;
    author_name: string | null;
    author_email: string | null;
    author_phone: string | null;
    author_whatsapp: string | null;
    author_avatar_url: string | null;
    author_user_id: string;
}

export interface ItemFilters {
    search?: string;
    category_id?: number;
    campus_id?: number;
    type?: ItemType;
    status?: ItemStatus;
    page?: number;
    pageSize?: number;
}
