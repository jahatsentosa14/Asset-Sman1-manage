'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createAcademicYearAction, type AcademicYearActionState } from './actions';

const initialState: AcademicYearActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Menyimpan...' : 'Buat Tahun Ajaran'}
    </button>
  );
}

export function CreateAcademicYearForm() {
  const [state, formAction] = useFormState(createAcademicYearAction, initialState);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="space-y-1.5">
        <label htmlFor="label" className="text-sm font-medium">
          Label Tahun Ajaran Baru
        </label>
        <input
          id="label"
          name="label"
          type="text"
          placeholder="2026/2027"
          required
          className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>
      <SubmitButton />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
