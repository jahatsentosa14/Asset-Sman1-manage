// =====================================================================
// Discord Bot — Notification Bridge
// SMA Negeri 1 Cikembar Asset Management System
//
// Tugas bot ini HANYA SATU: mendengarkan event baru di database (lewat
// Supabase Realtime) dan mengirim notifikasi rapi ke channel Discord.
// Bot ini TIDAK menerima command apa pun dari user Discord — murni
// notification bridge satu arah, sesuai requirement project.
//
// Fitur reliability (supaya bot tahan jalan berbulan-bulan tanpa
// dipantau manual):
//   - Reconnect otomatis Discord Gateway (bawaan discord.js + logging)
//   - Reconnect otomatis Supabase Realtime dengan exponential backoff
//   - Retry pengiriman pesan (lihat notifier.js)
//   - Heartbeat log berkala supaya mudah dicek "masih hidup" dari Console
//   - Health check ringan lewat log status tiap komponen
// =====================================================================

require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const { startRealtimeListener } = require('./realtime-listener');
const { sendApprovalNotification } = require('./notifier');

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // log status tiap 5 menit

// ---------------------------------------------------------------------
// Validasi environment variable di awal.
// ---------------------------------------------------------------------
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'DISCORD_BOT_TOKEN', 'DISCORD_APPROVAL_CHANNEL_ID'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    logger.error(`Environment variable ${key} belum diisi. Cek file .env Anda.`);
    process.exit(1);
  }
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

let realtimeHandle = null;

async function handleActivityInsert(row) {
  const { action, metadata } = row;
  await sendApprovalNotification(discordClient, process.env.DISCORD_APPROVAL_CHANNEL_ID, action, metadata || {});
}

function startHeartbeat() {
  setInterval(() => {
    const discordStatus = discordClient.isReady() ? 'READY' : 'NOT_READY';
    const wsPing = discordClient.ws?.ping ?? 'n/a';
    const realtimeStatus = realtimeHandle?.getStatus() ?? 'not_started';
    logger.info(`Heartbeat — Discord: ${discordStatus} (ping ${wsPing}ms) | Realtime: ${realtimeStatus}`);
  }, HEARTBEAT_INTERVAL_MS);
}

// ---------------------------------------------------------------------
// Event Discord Client — logging untuk visibilitas reconnect Gateway.
// discord.js SUDAH otomatis reconnect di level bawah; listener ini hanya
// supaya prosesnya terlihat jelas di Console panel hosting.
// ---------------------------------------------------------------------
discordClient.once('ready', () => {
  logger.info(`Bot login sebagai ${discordClient.user.tag}`);
  realtimeHandle = startRealtimeListener(supabase, handleActivityInsert);
  startHeartbeat();
});

discordClient.on('error', (err) => {
  logger.error('Discord Client Error:', err.message);
});

discordClient.on('shardError', (err, shardId) => {
  logger.error(`Shard ${shardId} error:`, err.message);
});

discordClient.on('shardDisconnect', (event, shardId) => {
  logger.warn(`Shard ${shardId} terputus (code ${event?.code ?? 'unknown'}). discord.js akan reconnect otomatis.`);
});

discordClient.on('shardReconnecting', (shardId) => {
  logger.info(`Shard ${shardId} sedang reconnect...`);
});

discordClient.on('shardResume', (shardId) => {
  logger.info(`Shard ${shardId} berhasil resume koneksi.`);
});

// ---------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------
process.on('SIGINT', () => {
  logger.info('Bot dihentikan (SIGINT).');
  discordClient.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Bot dihentikan (SIGTERM).');
  discordClient.destroy();
  process.exit(0);
});

// Jangan biarkan error tak tertangani mematikan proses secara diam-diam —
// log dulu supaya kelihatan di Console panel hosting sebelum proses exit.
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err.message);
  process.exit(1); // biarkan panel hosting restart proses (aktifkan auto-restart di Pterodactyl)
});

discordClient.login(process.env.DISCORD_BOT_TOKEN).catch((err) => {
  logger.error('Gagal login ke Discord. Kemungkinan penyebab:');
  logger.error('  - DISCORD_BOT_TOKEN salah atau sudah di-reset dari Developer Portal.');
  logger.error('  - Tidak ada koneksi internet ke discord.com dari server ini.');
  logger.error('Detail error:', err.message);
  process.exit(1);
});
