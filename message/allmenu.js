const button = require('../lib/button.js')
const listmenu = require('../lib/listmenu.js')
const formatter = require('../lib/formatter.js')
const config = require('../config.js')

module.exports = async function allmenu(sock, from, sender, userData) {
    try {
        if (config.menuType === 'button') {
            await button.sendMainMenu(sock, from, userData)
        } else {
            const name = userData.name || 'User'
            const text = `Halo ${name}! Berikut adalah semua menu yang tersedia:\n\n` +
                `Total fitur: 1000+ commands\n` +
                `Prefix: ${config.prefix}\n` +
                `Mode: ${config.selfMode ? 'Self' : 'Public'}\n\n` +
                `Pilih kategori menu di bawah:`
            
            const sections = [
                listmenu.createListSection('MAIN MENU', [
                    { id: '.menu main', title: '📱 Menu Utama', description: 'Menu utama bot' },
                    { id: '.menu info', title: 'ℹ️ Info Bot', description: 'Informasi bot' },
                    { id: '.menu stats', title: '📊 Statistics', description: 'Statistik bot' }
                ]),
                listmenu.createListSection('OWNER MENU', [
                    { id: '.owner eval', title: '⚡ Eval', description: 'Evaluate JavaScript code' },
                    { id: '.owner exec', title: '💻 Exec', description: 'Execute shell command' },
                    { id: '.owner broadcast', title: '📢 Broadcast', description: 'Broadcast message' }
                ]),
                listmenu.createListSection('GROUP MENU', [
                    { id: '.group info', title: '📊 Group Info', description: 'Informasi grup' },
                    { id: '.group settings', title: '⚙️ Settings', description: 'Pengaturan grup' },
                    { id: '.group admin', title: '👑 Admin Tools', description: 'Tools admin grup' }
                ]),
                listmenu.createListSection('DOWNLOAD MENU', [
                    { id: '.dl youtube', title: '🎥 YouTube', description: 'Download video YouTube' },
                    { id: '.dl tiktok', title: '📱 TikTok', description: 'Download video TikTok' },
                    { id: '.dl instagram', title: '📸 Instagram', description: 'Download IG video' }
                ]),
                listmenu.createListSection('FUN MENU', [
                    { id: '.fun joke', title: '😂 Joke', description: 'Lelucon lucu' },
                    { id: '.fun quote', title: '💭 Quote', description: 'Kutipan inspiratif' },
                    { id: '.fun game', title: '🎮 Game', description: 'Permainan seru' }
                ]),
                listmenu.createListSection('AI MENU', [
                    { id: '.ai chat', title: '💬 Chat AI', description: 'Chat dengan AI' },
                    { id: '.ai image', title: '🖼️ Generate Image', description: 'Buat gambar AI' },
                    { id: '.ai translate', title: '🌍 Translate', description: 'Terjemahan AI' }
                ])
            ]
            
            await listmenu.sendListMenu(sock, from, '📁 ALL MENU', text, sections)
        }
    } catch (error) {
        console.error('All menu error:', error)
        await sock.sendMessage(from, { text: config.errorMessage })
    }
}
