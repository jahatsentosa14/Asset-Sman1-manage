'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/image-upload';
import { LanguageSection } from './language-section';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import { updateFullNameAction, updatePasswordAction, updateAvatarAction, type SettingsActionState } from './actions';

const initialState: SettingsActionState = { error: null };

const ROLE_LABELS: Record<string, string> = {
  student: 'Siswa',
  teacher: 'Guru',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
    >
      {pending ? 'Menyimpan...' : label}
    </button>
  );
}

export function SettingsForms({ userId, fullName, email, role, avatarUrl }: {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}) {
  const [nameState, nameAction] = useFormState(updateFullNameAction, initialState);
  const [passwordState, passwordAction] = useFormState(updatePasswordAction, initialState);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

  useEffect(() => {
    if (nameState.success) toast.success('Nama berhasil diperbarui.');
    else if (nameState.error) toast.error(nameState.error);
  }, [nameState]);

  useEffect(() => {
    if (passwordState.success) toast.success('Password berhasil diubah.');
    else if (passwordState.error) toast.error(passwordState.error);
  }, [passwordState]);

  const panel = 'space-y-3 rounded-2xl border border-border bg-white/85 p-5 shadow-[0_8px_28px_rgba(26,18,59,.07)] backdrop-blur-xl';

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <section className={panel}>
          <h2 className="font-semibold text-primary">Foto Profil</h2>
          <ImageUpload
            bucket="profile-pictures"
            path={`${userId}/avatar`}
            currentUrl={avatarUrl}
            shape="circle"
            onUploaded={async (url) => {
              setAvatarMessage(null);
              const result = await updateAvatarAction(url);
              setAvatarMessage(result.error ?? 'Foto profil berhasil diperbarui.');
              if (result.error) toast.error(result.error);
              else toast.success('Foto profil berhasil diperbarui.');
            }}
          />
          {avatarMessage && <p className="text-xs text-muted-foreground">{avatarMessage}</p>}
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className={panel}>
          <h2 className="font-semibold text-primary">Informasi Akun</h2>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">Email: <span className="text-foreground">{email}</span></p>
            <p className="text-muted-foreground">Peran: <span className="text-foreground">{ROLE_LABELS[role] ?? role}</span></p>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem><LanguageSection /></StaggerItem>

      <StaggerItem>
        <section className={panel}>
          <h2 className="font-semibold text-primary">Edit Nama</h2>
          <form action={nameAction} className="space-y-3">
            <input type="text" name="fullName" defaultValue={fullName} required className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2" />
            {nameState.error && <p className="text-sm text-destructive">{nameState.error}</p>}
            {nameState.success && <p className="text-sm text-emerald-600">Nama berhasil diperbarui.</p>}
            <SubmitButton label="Simpan Nama" />
          </form>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className={panel}>
          <h2 className="font-semibold text-primary">Ubah Password</h2>
          <form action={passwordAction} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-sm font-medium">Password Baru</label>
              <input id="newPassword" type="password" name="newPassword" minLength={8} required className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Konfirmasi Password Baru</label>
              <input id="confirmPassword" type="password" name="confirmPassword" minLength={8} required className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2" />
            </div>
            {passwordState.error && <p className="text-sm text-destructive">{passwordState.error}</p>}
            {passwordState.success && <p className="text-sm text-emerald-600">Password berhasil diubah.</p>}
            <SubmitButton label="Ubah Password" />
          </form>
        </section>
      </StaggerItem>
    </StaggerContainer>
  );
}
