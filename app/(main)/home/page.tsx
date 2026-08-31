import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getActiveLoansForUser } from '@/services/loans';
import { getGreeting } from '@/lib/greeting';
import { getSchoolInformation } from '@/services/school-info';
import { LoanStatusBadge } from '@/components/ui/badge';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { FadeIn } from '@/components/motion/fade-in';
import { InformationGallery } from '../informasi/information-gallery';
import { HomeShortcuts } from './home-shortcuts';
import { HomeInsights, type HomeActivity, type RankItem } from './home-insights';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [activeLoans, profileResult, information, todayLoans, todayAtk, weekLoans, weekAtk] = await Promise.all([
    user ? getActiveLoansForUser(supabase, user.id) : Promise.resolve([]),
    user ? supabase.from('profiles').select('full_name, role, gender').eq('id', user.id).single() : Promise.resolve({ data: null }),
    getSchoolInformation(supabase),
    user ? supabase.from('loans').select('id, status, created_at, loan_items(quantity, assets(name))').eq('borrower_id', user.id).gte('created_at', startOfToday).order('created_at', { ascending: false }).limit(5) : Promise.resolve({ data: [] }),
    user ? supabase.from('atk_requests').select('id, status, created_at, atk_request_items(quantity, atk_items(name))').eq('requester_id', user.id).gte('created_at', startOfToday).order('created_at', { ascending: false }).limit(5) : Promise.resolve({ data: [] }),
    supabase.from('loans').select('loan_items(quantity, assets(name))').gte('created_at', startOfWeek),
    supabase.from('atk_requests').select('atk_request_items(quantity, atk_items(name))').gte('created_at', startOfWeek),
  ]);

  const profile = profileResult.data;
  const greeting = profile ? getGreeting(profile.role, profile.gender, profile.full_name) : { title: 'Selamat datang 👋', subtitle: 'Apa yang ingin Anda lakukan hari ini?' };

  const activities: HomeActivity[] = [
    ...((todayLoans.data ?? []) as any[]).map((x) => ({ id: `loan-${x.id}`, label: `Peminjaman: ${(x.loan_items ?? []).map((i: any) => i.assets?.name).filter(Boolean).join(', ') || 'Asset'}`, status: x.status, createdAt: x.created_at })),
    ...((todayAtk.data ?? []) as any[]).map((x) => ({ id: `atk-${x.id}`, label: `Pengambilan ATK: ${(x.atk_request_items ?? []).map((i: any) => i.atk_items?.name).filter(Boolean).join(', ') || 'ATK'}`, status: x.status, createdAt: x.created_at })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const aggregate = (rows: any[], itemKey: 'loan_items' | 'atk_request_items', nameKey: 'assets' | 'atk_items'): RankItem[] => {
    const map = new Map<string, number>();
    for (const row of rows) for (const item of row[itemKey] ?? []) {
      const name = item[nameKey]?.name;
      if (name) map.set(name, (map.get(name) ?? 0) + Number(item.quantity ?? 0));
    }
    return [...map.entries()].map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  };

  const assetRanks = aggregate(weekLoans.data ?? [], 'loan_items', 'assets');
  const atkRanks = aggregate(weekAtk.data ?? [], 'atk_request_items', 'atk_items');
  const grouped = (['denah', 'luas_tanah', 'tata_ruang', 'daftar_ruangan'] as const).map((category) => ({ category, items: information.filter((i) => i.category === category) })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-2xl font-black tracking-tight text-[#0f03ff]">{greeting.title}</h1><p className="text-muted-foreground">{greeting.subtitle}</p></div>
        <RealtimeRefresher tables={['loans', 'atk_requests', 'assets', 'atk_items']} />
      </div>

      <HomeShortcuts role={profile?.role ?? 'student'} />
      <HomeInsights activities={activities} assetRanks={assetRanks} atkRanks={atkRanks} />

      {grouped.length > 0 && <FadeIn className="glass-panel rounded-3xl p-5 sm:p-7"><div className="mb-6"><h2 className="text-xl font-black">Informasi Sekolah</h2><p className="text-sm text-muted-foreground">Denah, tata ruang, luas tanah, dan daftar ruangan.</p></div><InformationGallery grouped={grouped} /></FadeIn>}

      {activeLoans.length > 0 && (
        <FadeIn className="space-y-3"><h2 className="text-lg font-semibold">Pinjaman Aktif Anda</h2><div className="space-y-3">
          {activeLoans.map((loan) => <div key={loan.id} className="glass-panel flex items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-3"><div className="flex -space-x-2">{loan.loan_items.slice(0, 3).map((item, idx) => <div key={idx} className="h-10 w-10 overflow-hidden rounded-lg border-2 border-background bg-muted">{item.assets?.image_url ? <Image src={item.assets.image_url} alt={item.assets.name} width={40} height={40} className="h-full w-full object-cover" /> : null}</div>)}</div><div><p className="text-sm font-medium">{loan.loan_items.map((i) => i.assets?.name).join(', ')}</p><p className="text-xs text-muted-foreground">{new Date(loan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
            <LoanStatusBadge status={loan.status} />
          </div>)}
        </div></FadeIn>
      )}
    </div>
  );
}
