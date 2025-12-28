const fs = require('fs')
const path = require('path')
const config = require('../config.js')

module.exports = {
    // Main menu with buttons
    async sendMainMenu(sock, to, userData) {
        const name = userData.name || 'User'
        const limit = userData.limit
        const premium = userData.premium ? '✅' : '❌'
        const role = userData.role || 'user'
        
        const caption = `╭━━━「 *${config.name}* 」━━━⬣
│ 
│ 👋 Hai, ${name}!
│ 📊 Status: ${role.toUpperCase()}
│ 🎯 Premium: ${premium}
│ 📈 Limit: ${limit}
│ 
│ 📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}
│ ⏰ Waktu: ${new Date().toLocaleTimeString('id-ID')}
│ 
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━「 *MENU UTAMA* 」━━━⬣
│ 
│ 📁 *ALL MENU* - Semua perintah
│ 👑 *OWNER MENU* - Perintah owner
│ 👥 *GROUP MENU* - Perintah grup
│ 📥 *DOWNLOAD MENU* - Downloader
│ 🎮 *FUN MENU* - Permainan
│ 🤖 *AI MENU* - Kecerdasan buatan
│ 
╰━━━━━━━━━━━━━━━━━━⬣

Ketik *.menu <nama menu>* atau klik button di bawah!`

        const buttons = [
            { buttonId: '.allmenu', buttonText: { displayText: '📁 ALL MENU' }, type: 1 },
            { buttonId: '.owner', buttonText: { displayText: '👑 OWNER' }, type: 1 },
            { buttonId: '.group', buttonText: { displayText: '👥 GROUP' }, type: 1 },
            { buttonId: '.download', buttonText: { displayText: '📥 DOWNLOAD' }, type: 1 },
            { buttonId: '.fun', buttonText: { displayText: '🎮 FUN' }, type: 1 },
            { buttonId: '.ai', buttonText: { displayText: '🤖 AI' }, type: 1 }
        ]

        const buttonMessage = {
            text: caption,
            footer: `Prefix: ${config.prefix} | Runtime: ${require('./formatter.js').runtime(global.runtime.startTime)}`,
            buttons: buttons,
            headerType: 1
        }

        // Add video thumbnail if exists
        if (fs.existsSync(config.mediaPath.thumbnail)) {
            buttonMessage.video = { url: config.mediaPath.thumbnail }
            buttonMessage.gifPlayback = true
        }

        await sock.sendMessage(to, buttonMessage)
    },
    
    // Button template for submenus
    async sendButtonMenu(sock, to, title, text, buttons) {
        const buttonMessage = {
            text: `╭━━━「 *${title}* 」━━━⬣\n│ \n${text}\n╰━━━━━━━━━━━━━━━━━━⬣`,
            footer: config.name,
            buttons: buttons.map(btn => ({
                buttonId: btn.id,
                buttonText: { displayText: btn.text },
                type: 1
            })),
            headerType: 1
        }
        
        await sock.sendMessage(to, buttonMessage)
    },
    
    // Interactive buttons
    async sendInteractiveButtons(sock, to, text, sections) {
        const message = {
            text: text,
            footer: config.name,
            title: 'Interactive Menu',
            buttonText: 'Pilih Menu',
            sections: sections
        }
        
        await sock.sendMessage(to, message)
    }
}
