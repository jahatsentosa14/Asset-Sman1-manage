import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getActiveLoansForUser } from '@/services/loans';
import { getGreeting } from '@/lib/greeting';
import { LoanStatusBadge } from '@/components/ui/badge';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { FadeIn } from '@/components/motion/fade-in';
import { HomeShortcuts } from './home-shortcuts';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [activeLoans, profileResult] = await Promise.all([
    user ? getActiveLoansForUser(supabase, user.id) : Promise.resolve([]),
    user
      ? supabase.from('profiles').select('full_name, role, gender').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const profile = profileResult.data;
  const greeting = profile
    ? getGreeting(profile.role, profile.gender, profile.full_name)
    : { title: 'Selamat datang 👋', subtitle: 'Apa yang ingin Anda lakukan hari ini?' };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting.title}</h1>
          <p className="text-muted-foreground">{greeting.subtitle}</p>
        </div>
        <RealtimeRefresher tables={['loans']} />
      </div>

      <HomeShortcuts role={profile?.role ?? 'student'} />

      {activeLoans.length > 0 && (
        <FadeIn className="space-y-3">
          <h2 className="text-lg font-semibold">Pinjaman Aktif Anda</h2>
          <div className="space-y-3">
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-4 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {loan.loan_items.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="h-10 w-10 overflow-hidden rounded-lg border-2 border-background bg-muted"
                      >
                        {item.assets?.image_url ? (
                          <Image
                            src={item.assets.image_url}
                            alt={item.assets.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {loan.loan_items.map((i) => i.assets?.name).join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(loan.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <LoanStatusBadge status={loan.status} />
              </div>
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
