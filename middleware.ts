// middleware.ts berjalan di SETIAP request sebelum halaman dirender.
// Dua tugas:
//   1. Refresh token Supabase supaya user tidak ter-logout tiba-tiba.
//   2. Redirect user yang belum login menjauh dari halaman yang butuh auth,
//      dan redirect user yang sudah login menjauh dari halaman login/register.
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/terms', '/terms-of-use', '/privacy', '/disclaimer', '/maintenance'];
const ADMIN_ONLY_PREFIX = '/admin';

export async function middleware(request: NextRequest) {
  // GitHub Codespaces meneruskan request ke Next.js dengan:
  //   Origin: localhost:<port>
  //   X-Forwarded-Host: <codespace>.app.github.dev
  // Next.js Server Actions membandingkan keduanya untuk proteksi CSRF.
  // Saat development di Codespaces, samakan forwarded host dengan Origin.
  // Hanya berlaku untuk POST di development; production tidak disentuh.
  const requestHeaders = new Headers(request.headers);
  if (process.env.NODE_ENV !== 'production' && request.method === 'POST') {
    const origin = request.headers.get('origin');
    if (origin) {
      try {
        requestHeaders.set('x-forwarded-host', new URL(origin).host);
      } catch {
        // Biarkan Next.js menangani Origin yang tidak valid seperti biasa.
      }
    }
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.cookies.set(name, '', options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(path);

  // Belum login tapi akses halaman yang butuh auth -> lempar ke /login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  // Sudah login tapi masih buka /login atau /register -> lempar ke /home
  if (user && (path === '/login' || path === '/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // Proteksi /admin: hanya role admin & super_admin
  if (user && path.startsWith(ADMIN_ONLY_PREFIX)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }
  }

  // Maintenance Mode: saat aktif, semua user NON-ADMIN yang login dialihkan
  // ke /maintenance. Admin tetap bisa mengakses seluruh aplikasi seperti biasa
  // (requirement: "Admin tetap bisa login").
  if (user && path !== '/maintenance' && !path.startsWith(ADMIN_ONLY_PREFIX)) {
    const { data: setting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();

    const maintenanceValue = setting?.value as { active?: boolean } | null;
    const maintenanceActive = maintenanceValue?.active === true;

    if (maintenanceActive) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua path KECUALI:
     * - file statis (_next/static, _next/image)
     * - favicon.ico
     * - file di folder /public (gambar, dsb.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
