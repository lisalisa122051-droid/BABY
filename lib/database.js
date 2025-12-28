const fs = require('fs')
const path = require('path')
const config = require('../config.js')

class Database {
    constructor() {
        this.userDB = config.databasePath.user
        this.groupDB = config.databasePath.group
        this.premiumDB = config.databasePath.premium
    }
    
    // Initialize database
    async init() {
        this.ensureFileExists(this.userDB, {})
        this.ensureFileExists(this.groupDB, {})
        this.ensureFileExists(this.premiumDB, {})
    }
    
    // User database methods
    async addUser(data) {
        const db = this.readJSON(this.userDB)
        db[data.jid] = {
            jid: data.jid,
            number: data.number,
            name: data.name || 'User',
            limit: data.limit || config.defaultLimit,
            premium: data.premium || false,
            role: data.role || 'user',
            lastSeen: data.lastSeen || Date.now(),
            totalCommand: data.totalCommand || 0,
            registeredAt: data.registeredAt || Date.now(),
            banned: false,
            warning: 0
        }
        this.writeJSON(this.userDB, db)
        return db[data.jid]
    }
    
    async getUser(jid) {
        const db = this.readJSON(this.userDB)
        return db[jid] || null
    }
    
    async updateUser(jid, data) {
        const db = this.readJSON(this.userDB)
        if (db[jid]) {
            db[jid] = { ...db[jid], ...data }
            this.writeJSON(this.userDB, db)
            return true
        }
        return false
    }
    
    async getAllUsers() {
        return this.readJSON(this.userDB)
    }
    
    async deleteUser(jid) {
        const db = this.readJSON(this.userDB)
        if (db[jid]) {
            delete db[jid]
            this.writeJSON(this.userDB, db)
            return true
        }
        return false
    }
    
    // Group database methods
    async addGroup(data) {
        const db = this.readJSON(this.groupDB)
        db[data.jid] = {
            jid: data.jid,
            name: data.name || 'Group',
            owner: data.owner,
            admins: data.admins || [],
            members: data.members || [],
            settings: {
                welcome: data.settings?.welcome || false,
                antiLink: data.settings?.antiLink || false,
                nsfw: data.settings?.nsfw || false,
                mute: data.settings?.mute || false
            },
            createdAt: Date.now()
        }
        this.writeJSON(this.groupDB, db)
        return db[data.jid]
    }
    
    async getGroup(jid) {
        const db = this.readJSON(this.groupDB)
        return db[jid] || null
    }
    
    async updateGroup(jid, data) {
        const db = this.readJSON(this.groupDB)
        if (db[jid]) {
            db[jid] = { ...db[jid], ...data }
            this.writeJSON(this.groupDB, db)
            return true
        }
        return false
    }
    
    // Premium database methods
    async addPremium(number, duration) {
        const db = this.readJSON(this.premiumDB)
        db[number] = {
            number,
            premium: true,
            type: 'premium',
            startDate: Date.now(),
            endDate: Date.now() + (duration * 24 * 60 * 60 * 1000),
            features: ['unlimited', 'priority']
        }
        this.writeJSON(this.premiumDB, db)
        
        // Update user database
        const userDb = this.readJSON(this.userDB)
        for (const jid in userDb) {
            if (userDb[jid].number === number) {
                userDb[jid].premium = true
                userDb[jid].limit = config.premiumLimit
            }
        }
        this.writeJSON(this.userDB, userDb)
    }
    
    async removePremium(number) {
        const db = this.readJSON(this.premiumDB)
        if (db[number]) {
            delete db[number]
            this.writeJSON(this.premiumDB, db)
            
            // Update user database
            const userDb = this.readJSON(this.userDB)
            for (const jid in userDb) {
                if (userDb[jid].number === number) {
                    userDb[jid].premium = false
                    userDb[jid].limit = config.defaultLimit
                }
            }
            this.writeJSON(this.userDB, userDb)
            return true
        }
        return false
    }
    
    // Utility methods
    ensureFileExists(filePath, defaultValue = {}) {
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2))
        }
    }
    
    readJSON(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf-8')
            return JSON.parse(data)
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error)
            return {}
        }
    }
    
    writeJSON(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
            return true
        } catch (error) {
            console.error(`Error writing ${filePath}:`, error)
            return false
        }
    }
}

module.exports = new Database()
