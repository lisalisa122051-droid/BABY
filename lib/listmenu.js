module.exports = {
    // List message template
    async sendListMenu(sock, to, title, text, listSections) {
        const listMessage = {
            text: text,
            footer: 'Pilih menu di bawah',
            title: title,
            buttonText: 'Buka Menu',
            sections: listSections
        }
        
        await sock.sendMessage(to, listMessage)
    },
    
    // Create list sections
    createListSection(title, rows) {
        return {
            title: title,
            rows: rows.map(row => ({
                title: row.title,
                description: row.description,
                rowId: row.id
            }))
        }
    },
    
    // Example: All menu list
    getAllMenuList() {
        return [
            this.createListSection('MAIN MENU', [
                { id: '.menu', title: '📱 Menu Utama', description: 'Menu utama bot' },
                { id: '.ping', title: '🏓 Ping Bot', description: 'Cek kecepatan bot' },
                { id: '.runtime', title: '⏰ Runtime', description: 'Cek statistik bot' },
                { id: '.limit', title: '📊 Limit', description: 'Cek limit kamu' }
            ]),
            this.createListSection('OWNER MENU', [
                { id: '.owner eval', title: '⚡ Eval Code', description: 'Jalankan kode JavaScript' },
                { id: '.owner exec', title: '💻 Exec Command', description: 'Jalankan command shell' },
                { id: '.owner broadcast', title: '📢 Broadcast', description: 'Kirim pesan ke semua user' }
            ]),
            this.createListSection('GROUP MENU', [
                { id: '.group info', title: '📊 Group Info', description: 'Info grup' },
                { id: '.group promote', title: '👑 Promote', description: 'Promote member jadi admin' },
                { id: '.group demote', title: '⬇️ Demote', description: 'Demote admin jadi member' }
            ])
        ]
    }
}
