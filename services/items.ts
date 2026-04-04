import { createClient } from '@/lib/supabase/client';
import type { ItemWithDetails, ItemFilters, Item, ItemImage, Campus, Category } from '@/types/database';

const supabase = createClient();

export async function fetchItemsWithDetails(filters: ItemFilters = {}) {
    const { page = 1, pageSize = 10, search, category_id, campus_id, type, status } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('items_with_details')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (search) {
        query = query.or(`title.ilike.%${search}%,item_description.ilike.%${search}%`);
    }
    if (category_id) query = query.eq('category_id', category_id);
    if (campus_id) query = query.eq('campus_id', campus_id);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;
    return { items: (data as ItemWithDetails[]) || [], total: count || 0 };
}

export async function fetchItemById(id: number) {
    const { data, error } = await supabase
        .from('items_with_details')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data as ItemWithDetails;
}

export async function fetchItemImages(itemId: number) {
    const { data, error } = await supabase
        .from('item_images')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as ItemImage[]) || [];
}

export async function fetchClaimedCount() {
    const { count, error } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'claimed')
        .is('deleted_at', null);
    if (error) throw error;
    return count || 0;
}

export async function fetchCampuses() {
    const { data, error } = await supabase.from('campuses').select('*').order('name');
    if (error) throw error;
    return (data as Campus[]) || [];
}

export async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return (data as Category[]) || [];
}

export async function fetchUserItems(profileId: number, includeDeleted = false) {
    let query = supabase
        .from('items')
        .select('*, item_images(*)')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

    if (!includeDeleted) {
        query = query.is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function createItem(item: {
    user_id: number;
    campus_id: number;
    category_id: number;
    title: string;
    item_description?: string;
    location_description?: string;
    event_date?: string;
    type: 'lost' | 'found';
}) {
    const { data, error } = await supabase
        .from('items')
        .insert(item)
        .select()
        .single();
    if (error) throw error;
    return data as Item;
}

export async function updateItem(id: number, updates: Partial<Item>) {
    const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as Item;
}

export async function softDeleteItem(id: number) {
    const { error } = await supabase
        .from("items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)

    if (error) throw error
}


export async function claimItem(id: number) {
    return updateItem(id, { status: 'claimed' });
}

export async function addItemImage(itemId: number, imageUrl: string) {
    const { data, error } = await supabase
        .from('item_images')
        .insert({ item_id: itemId, image_url: imageUrl })
        .select()
        .single();
    if (error) throw error;
    return data as ItemImage;
}

export async function deleteItemImage(imageId: number) {
    const { error } = await supabase.from('item_images').delete().eq('id', imageId);
    if (error) throw error;
}
