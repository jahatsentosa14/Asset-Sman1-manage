const { EmbedBuilder } = require('discord.js');
const logger = require('./logger');

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const NOTIFIABLE_ACTIONS = {
  loan_created: { title: '📦 Approval Pinjam Baru', color: 0x3b82f6 },
  loan_status_changed_to_return_requested: { title: '↩️ Approval Pengembalian Baru', color: 0xf59e0b },
  atk_request_created: { title: '✏️ Approval ATK Baru', color: 0x10b981 },
  maintenance_enabled: { title: '🔧 Maintenance Mode Diaktifkan', color: 0xef4444 },
  maintenance_disabled: { title: '✅ Maintenance Mode Dinonaktifkan', color: 0x22c55e },
};

const MAINTENANCE_ACTIONS = new Set(['maintenance_enabled', 'maintenance_disabled']);

const ROLE_LABELS = { student: 'Siswa', teacher: 'Guru', admin: 'Admin', super_admin: 'Super Admin' };

function isNotifiableAction(action) {
  return Boolean(NOTIFIABLE_ACTIONS[action]);
}

function buildEmbed(action, metadata) {
  const config = NOTIFIABLE_ACTIONS[action];
  const embed = new EmbedBuilder().setTitle(config.title).setColor(config.color).setTimestamp(new Date());

  if (MAINTENANCE_ACTIONS.has(action)) {
    embed.addFields({ name: 'Diubah oleh', value: metadata.actor_name || '-', inline: true });
    if (metadata.message) embed.addFields({ name: 'Pesan', value: metadata.message, inline: false });
    if (metadata.ends_at) {
      const endsAtDate = new Date(metadata.ends_at);
      const unixSeconds = Math.floor(endsAtDate.getTime() / 1000);
      // Format <t:unix:R> — Discord otomatis menampilkan "dalam X menit" dan
      // menyesuaikan ke timezone lokal tiap user yang melihat pesan ini.
      embed.addFields({ name: 'Perkiraan Selesai', value: `<t:${unixSeconds}:R>`, inline: true });
    }
    return embed;
  }

  return embed.addFields(
    { name: 'Nama', value: metadata.actor_name || '-', inline: true },
    { name: 'Role', value: ROLE_LABELS[metadata.actor_role] || metadata.actor_role || '-', inline: true },
    { name: 'Kelas', value: metadata.class_name || '-', inline: true },
    { name: 'Barang', value: metadata.items_text || '-', inline: false }
  );
}

// DISCORD_MENTION_USER_IDS di .env: daftar user ID Discord dipisah koma,
// misal "111111111111111111,222222222222222222" — akan di-mention
// (memicu notifikasi push) di setiap approval baru. Opsional; kosongkan
// jika tidak perlu mention siapa pun.
function buildMentionContent() {
  const raw = process.env.DISCORD_MENTION_USER_IDS;
  if (!raw || !raw.trim()) return undefined;

  const ids = raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) return undefined;
  return ids.map((id) => `<@${id}>`).join(' ');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry dengan exponential backoff: percobaan ke-1 tunggu 1 detik, ke-2
// tunggu 2 detik, ke-3 tunggu 4 detik — supaya gangguan jaringan singkat
// (bukan error permanen seperti token salah) punya kesempatan pulih
// sendiri tanpa kehilangan notifikasi.
async function sendWithRetry(channel, payload, context) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await channel.send(payload);
      if (attempt > 1) {
        logger.info(`Berhasil kirim notifikasi ${context} pada percobaan ke-${attempt}.`);
      }
      return true;
    } catch (err) {
      lastError = err;
      logger.warn(`Percobaan ke-${attempt}/${MAX_RETRIES} gagal kirim notifikasi ${context}: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }

  logger.error(`Gagal kirim notifikasi ${context} setelah ${MAX_RETRIES} percobaan.`, lastError?.message);
  return false;
}

async function sendApprovalNotification(discordClient, channelId, action, metadata) {
  if (!isNotifiableAction(action)) return;

  const channel = await discordClient.channels.fetch(channelId).catch((err) => {
    logger.error('Gagal mengambil channel Discord. Cek DISCORD_APPROVAL_CHANNEL_ID.', err.message);
    return null;
  });

  if (!channel) return;

  const payload = { embeds: [buildEmbed(action, metadata)] };
  const mentionContent = buildMentionContent();
  if (mentionContent) payload.content = mentionContent;

  await sendWithRetry(channel, payload, action);
}

module.exports = { isNotifiableAction, sendApprovalNotification };
