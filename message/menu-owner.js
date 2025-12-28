const config = require('../config.js')
const db = require('../lib/database.js')
const formatter = require('../lib/formatter.js')

module.exports = async function menuOwner(sock, from, sender, args, isOwner) {
    if (!isOwner) {
        return await sock.sendMessage(from, { text: '❌ Command ini hanya untuk owner!' })
    }
    
    const command = args[0] || ''
    
    switch(command) {
        case 'eval':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .owner eval <code>' })
            }
            try {
                const code = args.slice(1).join(' ')
                let result = eval(code)
                if (typeof result !== 'string') result = require('util').inspect(result)
                await sock.sendMessage(from, { text: `✅ Result:\n${result}` })
            } catch (e) {
                await sock.sendMessage(from, { text: `❌ Error:\n${e.message}` })
            }
            break
            
        case 'exec':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .owner exec <command>' })
            }
            const { exec } = require('child_process')
            const cmd = args.slice(1).join(' ')
            exec(cmd, (error, stdout, stderr) => {
                const result = error ? stderr : stdout
                sock.sendMessage(from, { text: `💻 Exec:\n${cmd}\n\n📤 Output:\n${result}` })
            })
            break
            
        case 'broadcast':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .owner broadcast <message>' })
            }
            const message = args.slice(1).join(' ')
            const users = await db.getAllUsers()
            let success = 0
            let failed = 0
            
            for (const jid in users) {
                try {
                    await sock.sendMessage(jid, { text: `📢 Broadcast dari owner:\n\n${message}` })
                    success++
                } catch {
                    failed++
                }
                await formatter.delay(1000)
            }
            
            await sock.sendMessage(from, { 
                text: `✅ Broadcast selesai!\nBerhasil: ${success}\nGagal: ${failed}` 
            })
            break
            
        case 'addpremium':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .owner addpremium <number> <days>' })
            }
            const number = args[1].replace(/[^0-9]/g, '')
            const days = parseInt(args[2]) || 30
            await db.addPremium(number, days)
            await sock.sendMessage(from, { 
                text: `✅ Premium berhasil ditambahkan!\nNumber: ${number}\nDurasi: ${days} hari` 
            })
            break
            
        case 'removepremium':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .owner removepremium <number>' })
            }
            const num = args[1].replace(/[^0-9]/g, '')
            await db.removePremium(num)
            await sock.sendMessage(from, { 
                text: `✅ Premium berhasil dihapus!\nNumber: ${num}` 
            })
            break
            
        case 'setlimit':
            if (args.length < 3) {
                return await sock.sendMessage(from, { text: 'Usage: .owner setlimit <number> <amount>' })
            }
            const target = args[1].includes('@') ? args[1] : args[1] + '@s.whatsapp.net'
            const limit = parseInt(args[2])
            await db.updateUser(target, { limit: limit })
            await sock.sendMessage(from, { 
                text: `✅ Limit berhasil diubah!\nUser: ${target}\nLimit baru: ${limit}` 
            })
            break
            
        case 'ban':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .owner ban <number>' })
            }
            const banTarget = args[1].includes('@') ? args[1] : args[1] + '@s.whatsapp.net'
            await db.updateUser(banTarget, { banned: true })
            await sock.sendMessage(from, { 
                text: `✅ User dibanned!\nUser: ${banTarget}` 
            })
            break
            
        case 'unban':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .owner unban <number>' })
            }
            const unbanTarget = args[1].includes('@') ? args[1] : args[1] + '@s.whatsapp.net'
            await db.updateUser(unbanTarget, { banned: false })
            await sock.sendMessage(from, { 
                text: `✅ User diunbanned!\nUser: ${unbanTarget}` 
            })
            break
            
        case 'stats':
            const allUsers = await db.getAllUsers()
            const premiumUsers = Object.values(allUsers).filter(u => u.premium).length
            const bannedUsers = Object.values(allUsers).filter(u => u.banned).length
            const totalCommands = Object.values(allUsers).reduce((a, b) => a + (b.totalCommand || 0), 0)
            
            const statsText = `📊 BOT STATISTICS:\n\n` +
                `👥 Total Users: ${Object.keys(allUsers).length}\n` +
                `👑 Premium Users: ${premiumUsers}\n` +
                `🚫 Banned Users: ${bannedUsers}\n` +
                `⚡ Total Commands: ${totalCommands}\n` +
                `💾 Database Size: ${formatter.formatSize(JSON.stringify(allUsers).length)}\n` +
                `⏰ Runtime: ${formatter.runtime(global.runtime.startTime)}\n` +
                `📨 Messages: ${global.runtime.messages}\n` +
                `⚠️ Errors: ${global.runtime.errors}`
            
            await sock.sendMessage(from, { text: statsText })
            break
            
        default:
            const ownerMenu = `╭━━━「 *OWNER MENU* 」━━━⬣
│ 
│ ⚡ *eval* <code> - Jalankan kode JS
│ 💻 *exec* <cmd> - Jalankan shell command
│ 📢 *broadcast* <msg> - Broadcast pesan
│ 
│ 👑 *addpremium* <num> <days> - Tambah premium
│ 👑 *removepremium* <num> - Hapus premium
│ 📊 *setlimit* <num> <amt> - Set limit user
│ 
│ 🚫 *ban* <num> - Ban user
│ ✅ *unban* <num> - Unban user
│ 📈 *stats* - Statistik bot
│ 
│ ⚙️ *restart* - Restart bot
│ 📁 *backup* - Backup database
│ 🔄 *update* - Update bot
│ 
╰━━━━━━━━━━━━━━━━━━⬣`
            
            await sock.sendMessage(from, { text: ownerMenu })
    }
}
