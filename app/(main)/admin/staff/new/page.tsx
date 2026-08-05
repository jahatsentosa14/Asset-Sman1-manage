import { CreateStaffForm } from '../create-staff-form';

export default function NewStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buat Akun Guru / Admin</h1>
        <p className="text-muted-foreground">Akun langsung aktif dan bisa dipakai login.</p>
      </div>
      <CreateStaffForm />
    </div>
  );
}
