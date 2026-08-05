import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AtkItemForm } from '../../atk-item-form';
import { updateAtkItemAction, type AtkItemActionState } from '../../actions';

export default async function EditAtkItemPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: item } = await supabase
    .from('atk_items')
    .select('id, name, unit, stock, image_url')
    .eq('id', params.id)
    .single();

  if (!item) notFound();

  const boundAction = async (state: AtkItemActionState, formData: FormData) =>
    updateAtkItemAction(item.id, state, formData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit ATK</h1>
        <p className="text-muted-foreground">{item.name}</p>
      </div>
      <AtkItemForm
        action={boundAction}
        itemIdForImage={item.id}
        submitLabel="Simpan Perubahan"
        defaultValues={{ name: item.name, unit: item.unit, stock: item.stock, imageUrl: item.image_url }}
      />
    </div>
  );
}
