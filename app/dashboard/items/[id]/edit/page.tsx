'use client';

import ItemForm from "@/components/items/ItemForm";
import { Suspense } from "react"


type EditItemPageProps = {
    params: Promise<{ id: string }>
}

export default async function EditItemPage({ params }: EditItemPageProps) {
    const { id } = await params

    return (
        <Suspense fallback={<div>Carregando formulário...</div>}>
            <ItemForm id={id} />
        </Suspense>
    )
}
