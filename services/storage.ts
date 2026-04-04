import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const BUCKET = 'public_assets';

export async function uploadItemImage(file: File, itemId: number, userId: string): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const fileName = `${userId}/items/${itemId}/${name}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
}

export async function deleteItemImageFile(imageUrl: string) {
    try {
        const url = new URL(imageUrl);
        // Extract path after /object/public/public_assets/
        const match = url.pathname.match(/\/object\/public\/public_assets\/(.+)/);
        if (!match) return;
        const filePath = decodeURIComponent(match[1]);
        await supabase.storage.from(BUCKET).remove([filePath]);
    } catch {
        console.warn('Could not delete storage file');
    }
}
