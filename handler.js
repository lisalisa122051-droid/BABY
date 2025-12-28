const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')
const config = require('./config.js')
const db = require('./lib/database.js')
const formatter = require('./lib/formatter.js')
const button = require('./lib/button.js')
const listmenu = require('./lib/listmenu.js')

// Import menu modules
const allmenu = require('./message/allmenu.js')
const menuOwner = require('./message/menu-owner.js')
const menuGroup = require('./message/menu-group.js')
const menuFun = require('./message/menu-fun.js')
const menuDownload = require('./message/menu-download.js')
const menuAI = require('./message/menu-ai.js')

async function handler(sock, msg) {
    try {
        // Ignore if no message
        if (!msg.message) return
        
        // Message type
        const type = Object.keys(msg.message)[0]
        const content = msg.message[type]
        const text = type === 'conversation' ? content : type === 'extendedTextMessage' ? content.text : ''
        
        // Message info
        const from = msg.key.remoteJid
        const sender = msg.key.participant || from
        const isGroup = from.endsWith('@g.us')
        const isOwner = sender === config.ownerNumber + '@s.whatsapp.net'
        const isAdmin = isGroup ? await isGroupAdmin(sock, from, sender) : false
        const isBot = msg.key.fromMe
        
        // Normalize number
        const normalizedNumber = sender.replace(/@s\.whatsapp\.net/g, '').replace(/@g\.us/g, '')
        
        // Register user to database
        await registerUser(normalizedNumber, sender, from)
        
        // Command processing
        if (text && (text.startsWith(config.prefix) || text.startsWith('!') || text.startsWith('/'))) {
            const args = text.slice(1).trim().split(/ +/)
            const command = args.shift().toLowerCase()
            const fullCommand = text.slice(1).trim()
            
            // Update command count
            await db.updateUser(sender, { totalCommand: (await db.getUser(sender)).totalCommand + 1 })
            
            // Check limit
            const userData = await db.getUser(sender)
            if (userData.limit <= 0 && !userData.premium && !isOwner) {
                return await sock.sendMessage(from, { 
                    text: `Limit habis! Upgrade premium untuk menambah limit.\nLimit kamu: ${userData.limit}` 
                })
            }
            
            // Decrease limit for non-premium, non-owner
            if (!userData.premium && !isOwner) {
                await db.updateUser(sender, { limit: userData.limit - 1 })
            }
            
            // Command router
            await routeCommand(sock, msg, {
                command,
                args,
                fullCommand,
                from,
                sender,
                isGroup,
                isOwner,
                isAdmin,
                text,
                type,
                userData
            })
        }
        
    } catch (error) {
        console.error('Handler error:', error)
        global.runtime.errors++
    }
}

// Command router
async function routeCommand(sock, msg, data) {
    const { command, args, from, sender, isGroup, isOwner, isAdmin, text, userData } = data
    
    // Main menu commands
    if (command === 'menu' || command === 'help' || command === 'allmenu') {
        return await allmenu(sock, from, sender, userData)
    }
    
    if (command === 'owner') {
        return await menuOwner(sock, from, sender, args, isOwner)
    }
    
    if (command === 'group') {
        return await menuGroup(sock, from, sender, args, isGroup, isAdmin)
    }
    
    if (command === 'fun') {
        return await menuFun(sock, from, sender, args)
    }
    
    if (command === 'download') {
        return await menuDownload(sock, from, sender, args)
    }
    
    if (command === 'ai') {
        return await menuAI(sock, from, sender, args, text)
    }
    
    // Utility commands
    if (command === 'ping') {
        const start = Date.now()
        const message = await sock.sendMessage(from, { text: 'Pinging...' })
        const latency = Date.now() - start
        await sock.sendMessage(from, { 
            text: `🏓 Pong!\nLatency: ${latency}ms\nRuntime: ${formatter.runtime(global.runtime.startTime)}` 
        })
    }
    
    if (command === 'runtime') {
        const uptime = formatter.runtime(global.runtime.startTime)
        const stats = `📊 Runtime Statistics:\n`
            + `⏰ Uptime: ${uptime}\n`
            + `📨 Messages: ${global.runtime.messages}\n`
            + `⚡ Commands: ${global.runtime.commands}\n`
            + `⚠️ Errors: ${global.runtime.errors}\n`
            + `👥 Users: ${Object.keys(await db.getAllUsers()).length}`
        await sock.sendMessage(from, { text: stats })
    }
    
    if (command === 'limit') {
        await sock.sendMessage(from, { 
            text: `📊 Limit Info:\nSisa limit: ${userData.limit}\nPremium: ${userData.premium ? '✅' : '❌'}\nTotal command: ${userData.totalCommand}` 
        })
    }
    
    // Add more commands here...
    
    global.runtime.commands++
}

// Helper functions
async function registerUser(number, sender, from) {
    const userExists = await db.getUser(sender)
    if (!userExists) {
        await db.addUser({
            jid: sender,
            number: number,
            name: 'User',
            limit: config.defaultLimit,
            premium: false,
            role: 'user',
            lastSeen: Date.now(),
            totalCommand: 0,
            registeredAt: Date.now()
        })
    } else {
        await db.updateUser(sender, { lastSeen: Date.now() })
    }
}

async function isGroupAdmin(sock, groupJid, userJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid)
        const participants = metadata.participants
        const user = participants.find(p => p.id === userJid)
        return user?.admin === 'admin' || user?.admin === 'superadmin'
    } catch {
        return false
    }
}

module.exports = handler
