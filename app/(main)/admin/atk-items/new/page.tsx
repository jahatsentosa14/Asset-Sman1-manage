import { randomUUID } from 'crypto';
import { AtkItemForm } from '../atk-item-form';
import { createAtkItemAction } from '../actions';

export default function NewAtkItemPage() {
  const tempId = randomUUID();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah ATK</h1>
        <p className="text-muted-foreground">Tambahkan alat tulis kantor baru.</p>
      </div>
      <AtkItemForm action={createAtkItemAction} itemIdForImage={tempId} submitLabel="Tambah ATK" />
    </div>
  );
}
