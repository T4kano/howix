'use client';

import ItemForm from "@/components/items/ItemForm";
import { Suspense } from "react";

export default function NewItemPage() {
    return (
        <Suspense fallback={<div>Carregando formulário...</div>}>
            <ItemForm />
        </Suspense>
    );
}