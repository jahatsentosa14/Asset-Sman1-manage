'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { registerStudentAction, type AuthActionState } from '../actions';

const initialState: AuthActionState = { error: null };

type ClassOption = { id: string; name: string; grade_level: number };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Memproses...' : 'Daftar'}
    </button>
  );
}

export function RegisterForm({ classes }: { classes: ClassOption[] }) {
  const [state, formAction] = useFormState(registerStudentAction, initialState);

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Daftar sebagai Siswa</h1>
        <p className="text-sm text-muted-foreground">
          Akun Guru dan Admin dibuatkan oleh pihak sekolah.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
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
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
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
              Pilih jenis kelamin
            </option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="classId" className="text-sm font-medium">
            Kelas
          </label>
          <select
            id="classId"
            name="classId"
            required
            defaultValue=""
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          >
            <option value="" disabled>
              Pilih kelas
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="nisn" className="text-sm font-medium">
            NISN <span className="text-muted-foreground">(opsional)</span>
          </label>
          <input
            id="nisn"
            name="nisn"
            type="text"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Dengan mendaftar, Anda menyetujui{' '}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>{' '}
        dan{' '}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>{' '}
        kami.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
