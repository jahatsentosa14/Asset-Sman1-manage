const logger = require('./logger');

const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000, 30000]; // backoff bertahap, maksimal 30 detik antar percobaan

// Subscribe ke activity_logs dengan reconnect otomatis. Supabase Realtime
// bisa terputus karena berbagai alasan (jaringan hosting bot, restart
// project Supabase, dll) — tanpa reconnect, bot akan "diam" selamanya
// setelah sekali putus meski proses Node.js-nya masih berjalan.
function startRealtimeListener(supabase, onActivityInsert) {
  let reconnectAttempt = 0;
  let currentChannel = null;

  function subscribe() {
    if (currentChannel) {
      supabase.removeChannel(currentChannel);
    }

    currentChannel = supabase
      .channel(`discord-bridge-${Date.now()}`) // nama unik tiap reconnect supaya tidak bentrok channel lama
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        onActivityInsert(payload.new).catch((err) => {
          logger.error('Gagal memproses event activity_logs baru:', err.message);
        });
      })
      .subscribe((status) => {
        logger.info(`Status koneksi Realtime: ${status}`);

        if (status === 'SUBSCRIBED') {
          reconnectAttempt = 0; // reset backoff setelah berhasil konek lagi
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          scheduleReconnect();
        }
      });
  }

  function scheduleReconnect() {
    const delay = RECONNECT_DELAYS_MS[Math.min(reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)];
    reconnectAttempt += 1;
    logger.warn(`Realtime terputus. Mencoba reconnect dalam ${delay / 1000} detik (percobaan ke-${reconnectAttempt})...`);
    setTimeout(subscribe, delay);
  }

  subscribe();

  return {
    getStatus: () => currentChannel?.state ?? 'unknown',
  };
}

module.exports = { startRealtimeListener };
