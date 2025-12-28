module.exports = {
    // Bot Settings
    name: 'Elaina Bot',
    prefix: '.',
    session: 'session',
    
    // Owner Settings
    ownerNumber: '628xxxxxxxxxx',
    ownerName: 'Bot Owner',
    
    // Bot Mode
    selfMode: false,
    publicMode: true,
    
    // Features
    autoRead: true,
    autoTyping: true,
    database: true,
    runtime: true,
    
    // API Keys (example)
    openaiKey: 'your-openai-key',
    googleApiKey: 'your-google-key',
    
    // Limits
    defaultLimit: 30,
    premiumLimit: 1000,
    vipLimit: 5000,
    
    // Messages
    welcomeMessage: 'Halo! Selamat datang di bot WhatsApp.',
    goodbyeMessage: 'Sampai jumpa!',
    errorMessage: 'Terjadi kesalahan. Silakan coba lagi.',
    
    // Database Paths
    databasePath: {
        user: './database/user.json',
        group: './database/group.json',
        premium: './database/premium.json'
    },
    
    // Media Paths
    mediaPath: {
        thumbnail: './media/thumb.mp4',
        menuImage: './media/menu.jpg'
    },
    
    // Menu Settings
    menuType: 'button', // button or list
    showRuntime: true,
    showOwnerInfo: true
}
