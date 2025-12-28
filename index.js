const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys')
const Pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const path = require('path')
const config = require('./config.js')
const handler = require('./handler.js')

// Runtime statistics
global.runtime = {
    startTime: Date.now(),
    messages: 0,
    commands: 0,
    errors: 0
}

// Global variables
global.config = config
global.owner = config.ownerNumber
global.prefix = config.prefix
global.db = require('./lib/database.js')

async function startBot() {
    console.log('🚀 Starting WhatsApp Bot...')
    
    // Create directories if not exist
    const dirs = ['database', 'media', 'lib', 'message']
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    })
    
    // Initialize database
    await db.init()
    
    // Baileys connection setup
    const { state, saveCreds } = await useMultiFileAuthState('./auth')
    const { version } = await fetchLatestBaileysVersion()
    
    const sock = makeWASocket({
        version,
        logger: Pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'fatal' }).child({ level: 'fatal' }))
        },
        browser: ['Chrome (Windows)', '', ''],
        getMessage: async (key) => {
            return {
                conversation: 'Hello from bot!'
            }
        }
    })
    
    // Save credentials
    sock.ev.on('creds.update', saveCreds)
    
    // Connection update
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if (qr) console.log('📱 Scan QR Code above')
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut)
            console.log('⚠️ Connection closed:', lastDisconnect.error)
            
            if (shouldReconnect) {
                console.log('🔄 Reconnecting...')
                startBot()
            }
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp!')
            console.log('🤖 Bot is ready!')
            
            // Update presence
            await sock.sendPresenceUpdate('available')
        }
    })
    
    // Message handling
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return
        
        // Mark as read
        await sock.readMessages([msg.key])
        
        // Process message
        await handler(sock, msg)
        
        // Update runtime stats
        global.runtime.messages++
    })
    
    // Auto typing
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (msg.key.fromMe || !msg.message) return
        
        try {
            await sock.sendPresenceUpdate('composing', msg.key.remoteJid)
            setTimeout(async () => {
                await sock.sendPresenceUpdate('paused', msg.key.remoteJid)
            }, 2000)
        } catch (e) {}
    })
    
    // Error handling
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0]
            if (!msg.message) return
            
            // Process message through handler
        } catch (error) {
            global.runtime.errors++
            console.error('Error:', error)
        }
    })
    
    // Keep alive
    setInterval(() => {
        sock.sendPresenceUpdate('available')
    }, 60000)
    
    return sock
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})

// Start bot
startBot().catch(console.error)
