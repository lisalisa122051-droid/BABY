const fs = require('fs')
const path = require('path')

module.exports = {
    // Format runtime
    runtime(startTime) {
        const uptime = Date.now() - startTime
        const seconds = Math.floor(uptime / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        
        return `${days} hari ${hours % 24} jam ${minutes % 60} menit ${seconds % 60} detik`
    },
    
    // Format size
    formatSize(bytes) {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    // Format date
    formatDate(date = new Date()) {
        return date.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    },
    
    // Format number
    formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num)
    },
    
    // Remove command from text
    getArgs(text, prefix = '.') {
        const args = text.slice(prefix.length).trim().split(/ +/)
        args.shift()
        return args
    },
    
    // Extract mentioned users
    getMentionedUsers(text) {
        const regex = /@(\d+)/g
        const matches = text.match(regex)
        return matches ? matches.map(m => m.replace('@', '') + '@s.whatsapp.net') : []
    },
    
    // Sanitize text
    sanitize(text) {
        return text
            .replace(/[\\*_`[\]()#+\-.!~>|]/g, '\\$&')
            .replace(/\n/g, '\n')
    },
    
    // Generate random
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    
    // Delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
