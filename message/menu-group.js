module.exports = async function menuGroup(sock, from, sender, args, isGroup, isAdmin) {
    if (!isGroup) {
        return await sock.sendMessage(from, { text: '❌ Command ini hanya untuk grup!' })
    }
    
    const command = args[0] || ''
    
    switch(command) {
        case 'info':
            try {
                const metadata = await sock.groupMetadata(from)
                const participants = metadata.participants
                const admins = participants.filter(p => p.admin).map(p => p.id)
                
                const infoText = `📊 *GROUP INFO*\n\n` +
                    `Nama: ${metadata.subject}\n` +
                    `ID: ${metadata.id}\n` +
                    `Dibuat: ${new Date(metadata.creation * 1000).toLocaleDateString('id-ID')}\n` +
                    `Pemilik: ${metadata.owner}\n` +
                    `Total Member: ${participants.length}\n` +
                    `Admin: ${admins.length}\n` +
                    `Deskripsi: ${metadata.desc || 'Tidak ada'}`
                
                await sock.sendMessage(from, { text: infoText })
            } catch (error) {
                await sock.sendMessage(from, { text: '❌ Gagal mendapatkan info grup' })
            }
            break
            
        case 'promote':
            if (!isAdmin) {
                return await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa promote!' })
            }
            
            const targetPromote = args[1] ? args[1].replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
            if (!targetPromote) {
                return await sock.sendMessage(from, { text: '❌ Tag user yang ingin dipromote!' })
            }
            
            try {
                await sock.groupParticipantsUpdate(from, [targetPromote], 'promote')
                await sock.sendMessage(from, { text: `✅ @${targetPromote.split('@')[0]} telah dipromote jadi admin!`, mentions: [targetPromote] })
            } catch (error) {
                await sock.sendMessage(from, { text: '❌ Gagal promote user' })
            }
            break
            
        case 'demote':
            if (!isAdmin) {
                return await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa demote!' })
            }
            
            const targetDemote = args[1] ? args[1].replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
            if (!targetDemote) {
                return await sock.sendMessage(from, { text: '❌ Tag admin yang ingin didemote!' })
            }
            
            try {
                await sock.groupParticipantsUpdate(from, [targetDemote], 'demote')
                await sock.sendMessage(from, { text: `✅ @${targetDemote.split('@')[0]} telah didemote dari admin!`, mentions: [targetDemote] })
            } catch (error) {
                await sock.sendMessage(from, { text: '❌ Gagal demote user' })
            }
            break
            
        case 'add':
            if (!isAdmin) {
                return await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa menambah member!' })
            }
            
            const numbers = args.slice(1).map(num => num.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            if (numbers.length === 0) {
                return await sock.sendMessage(from, { text: '❌ Masukkan nomor yang akan ditambahkan!' })
            }
            
            try {
                await sock.groupParticipantsUpdate(from, numbers, 'add')
                await sock.sendMessage(from, { text: `✅ ${numbers.length} user berhasil ditambahkan!` })
            } catch (error) {
                await sock.sendMessage(from, { text: '❌ Gagal menambahkan user' })
            }
            break
            
        case 'kick':
            if (!isAdmin) {
                return await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa mengeluarkan member!' })
            }
            
            const targetKick = args[1] ? args[1].replace('@', '').replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
            if (!targetKick) {
                return await sock.sendMessage(from, { text: '❌ Tag user yang ingin dikick!' })
            }
            
            try {
                await sock.groupParticipantsUpdate(from, [targetKick], 'remove')
                await sock.sendMessage(from, { text: `✅ @${targetKick.split('@')[0]} telah dikeluarkan dari grup!`, mentions: [targetKick] })
            } catch (error) {
                await sock.sendMessage(from, { text: '❌ Gagal mengeluarkan user' })
            }
            break
            
        case 'settings':
            const settingsText = `⚙️ *GROUP SETTINGS*\n\n` +
                `1. Anti Link: [ON/OFF]\n` +
                `2. Welcome Message: [ON/OFF]\n` +
                `3. NSFW Filter: [ON/OFF]\n` +
                `4. Auto Reply: [ON/OFF]\n\n` +
                `Gunakan: .group set <option> <on/off>`
            
            await sock.sendMessage(from, { text: settingsText })
            break
            
        default:
            const groupMenu = `╭━━━「 *GROUP MENU* 」━━━⬣
│ 
│ 📊 *info* - Info grup
│ 👑 *promote* @user - Promote jadi admin
│ ⬇️ *demote* @user - Demote admin
│ 
│ ➕ *add* <num> - Tambah member
│ 🚪 *kick* @user - Keluarkan member
│ 🔒 *settings* - Pengaturan grup
│ 
│ 🎭 *tagall* - Tag semua member
│ 📢 *announce* <msg> - Pengumuman
│ 🏷️ *setname* <name> - Ubah nama grup
│ 
│ 🚫 *antilink* on/off - Anti link
│ 👋 *welcome* on/off - Welcome message
│ ⚠️ *nsfw* on/off - Filter NSFW
│ 
╰━━━━━━━━━━━━━━━━━━⬣`
            
            await sock.sendMessage(from, { text: groupMenu })
    }
}
