'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type AuthActionState } from '../actions';

const initialState: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full rounded-2xl bg-[#FDBB2D] py-3 text-sm font-bold text-[#000080] shadow-[0_10px_25px_rgba(253,187,45,.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,128,.16)] disabled:translate-y-0 disabled:opacity-50">
      {pending ? 'Memproses...' : 'Masuk'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <main className="flex min-h-[calc(100vh-150px)] flex-col items-center px-6 py-12">
      <div className="mb-8 flex w-full max-w-md items-center justify-center">
        <span className="text-lg font-black tracking-tight text-[#000080]">SMAN 1 Cikembar</span>
      </div>

      <div className="w-full max-w-md">
        <div className="clay-panel rounded-[2rem] p-7 sm:p-9">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-3xl font-black tracking-tight text-[#000080]">Selamat Datang</h1>
            <p className="text-sm text-muted-foreground">Masuk menggunakan akun sekolah Anda.</p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-[#000080]">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className="glass-panel w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#FDBB2D] focus:ring-2 focus:ring-[#FDBB2D]/30" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-[#000080]">Password</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" className="glass-panel w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#FDBB2D] focus:ring-2 focus:ring-[#FDBB2D]/30" />
            </div>
            {state.error && <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>}
            <SubmitButton />
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun? <a href="/register" className="font-bold text-[#000080] decoration-[#FDBB2D] decoration-2 underline-offset-4 hover:underline">Daftar sebagai Siswa</a>
          </p>
        </div>
      </div>
    </main>
  );
}
