'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type AuthActionState } from '../actions';

const initialState: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full rounded-2xl bg-[#0f03ff] py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(15,3,255,.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,3,255,.28)] disabled:translate-y-0 disabled:opacity-50">
      {pending ? 'Memproses...' : 'Masuk'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <main className="flex min-h-[calc(100vh-150px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="clay-panel rounded-[2rem] p-7 sm:p-9">
          <div className="mb-8 space-y-2 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f03ff] text-xl font-black text-white shadow-[inset_2px_2px_5px_rgba(255,255,255,.3),6px_8px_18px_rgba(15,3,255,.25)]">S1</div>
            <h1 className="text-3xl font-black tracking-tight text-[#0f03ff]">Selamat Datang</h1>
            <p className="text-sm text-muted-foreground">Masuk menggunakan akun sekolah Anda.</p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className="glass-panel w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#0f03ff] focus:ring-2 focus:ring-[#0f03ff]/20" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold">Password</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" className="glass-panel w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-[#0f03ff] focus:ring-2 focus:ring-[#0f03ff]/20" />
            </div>
            {state.error && <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>}
            <SubmitButton />
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun? <a href="/register" className="font-bold text-[#0f03ff] hover:underline">Daftar sebagai Siswa</a>
          </p>
        </div>
      </div>
    </main>
  );
}
