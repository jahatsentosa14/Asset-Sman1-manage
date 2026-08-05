'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createStaffAccountAction, type StaffActionState } from './actions';

const initialState: StaffActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Membuat Akun...' : 'Buat Akun'}
    </button>
  );
}

export function CreateStaffForm() {
  const [state, formAction] = useFormState(createStaffAccountAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="text-sm font-medium">
          Nama Lengkap
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password Awal
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
        <p className="text-xs text-muted-foreground">
          Sampaikan password ini secara langsung/pribadi kepada yang bersangkutan. Mereka bisa
          menggantinya sendiri lewat halaman Settings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            Peran
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue=""
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          >
            <option value="" disabled>
              Pilih peran
            </option>
            <option value="teacher">Guru</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="gender" className="text-sm font-medium">
            Jenis Kelamin
          </label>
          <select
            id="gender"
            name="gender"
            required
            defaultValue=""
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          >
            <option value="" disabled>
              Pilih
            </option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
