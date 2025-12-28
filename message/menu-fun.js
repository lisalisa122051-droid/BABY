const axios = require('axios')
const formatter = require('../lib/formatter.js')

module.exports = async function menuFun(sock, from, sender, args) {
    const command = args[0] || ''
    
    switch(command) {
        case 'joke':
            try {
                const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single')
                await sock.sendMessage(from, { text: `😂 *JOKE*\n\n${response.data.joke}` })
            } catch {
                const jokes = [
                    "Kenapa komputer tidak bisa tidur? Karena ada Windows!",
                    "Apa bedanya orang jahat sama baterai? Baterai ada positifnya!",
                    "Kenapa ayam tidak pakai Facebook? Karena dia punya Twitter!"
                ]
                await sock.sendMessage(from, { text: `😂 *JOKE*\n\n${jokes[Math.floor(Math.random() * jokes.length)]}` })
            }
            break
            
        case 'quote':
            try {
                const response = await axios.get('https://api.quotable.io/random')
                const quote = response.data
                await sock.sendMessage(from, { 
                    text: `💭 *QUOTE*\n\n"${quote.content}"\n\n- ${quote.author}` 
                })
            } catch {
                const quotes = [
                    "Hidup adalah petualangan yang berani atau tidak sama sekali.",
                    "Kesuksesan adalah kombinasi dari kesempatan dan persiapan.",
                    "Masa depan tergantung pada apa yang kamu lakukan hari ini."
                ]
                await sock.sendMessage(from, { 
                    text: `💭 *QUOTE*\n\n"${quotes[Math.floor(Math.random() * quotes.length)]}"` 
                })
            }
            break
            
        case 'fact':
            try {
                const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en')
                await sock.sendMessage(from, { text: `📚 *FACT*\n\n${response.data.text}` })
            } catch {
                const facts = [
                    "Semut tidak pernah tidur.",
                    "Madu tidak akan pernah basi.",
                    "Otak manusia terdiri dari 73% air."
                ]
                await sock.sendMessage(from, { text: `📚 *FACT*\n\n${facts[Math.floor(Math.random() * facts.length)]}` })
            }
            break
            
        case 'game':
            const gameMenu = `🎮 *GAME MENU*\n\n` +
                `1. .fun tebakgambar - Tebak gambar\n` +
                `2. .fun tebakkata - Tebak kata\n` +
                `3. .fun math - Game matematika\n` +
                `4. .fun slot - Mesin slot\n` +
                `5. .fun suit - Batu gunting kertas`
            
            await sock.sendMessage(from, { text: gameMenu })
            break
            
        case 'tebakgambar':
            const images = [
                { url: 'https://example.com/image1.jpg', answer: 'apel' },
                { url: 'https://example.com/image2.jpg', answer: 'mobil' }
            ]
            const randomImage = images[Math.floor(Math.random() * images.length)]
            
            await sock.sendMessage(from, { 
                text: '🎯 *TEBAK GAMBAR*\n\nDeskripsi gambar ini adalah?',
                image: { url: randomImage.url }
            })
            
            // Store answer in temporary storage
            global.gameSession = global.gameSession || {}
            global.gameSession[sender] = {
                game: 'tebakgambar',
                answer: randomImage.answer,
                expires: Date.now() + 30000
            }
            break
            
        case 'math':
            const num1 = Math.floor(Math.random() * 100) + 1
            const num2 = Math.floor(Math.random() * 100) + 1
            const operators = ['+', '-', '*']
            const operator = operators[Math.floor(Math.random() * operators.length)]
            
            let answer
            switch(operator) {
                case '+': answer = num1 + num2; break
                case '-': answer = num1 - num2; break
                case '*': answer = num1 * num2; break
            }
            
            await sock.sendMessage(from, { 
                text: `🧮 *GAME MATEMATIKA*\n\nBerapa hasil dari: ${num1} ${operator} ${num2}?\n\nKamu punya 30 detik!` 
            })
            
            global.gameSession = global.gameSession || {}
            global.gameSession[sender] = {
                game: 'math',
                answer: answer,
                expires: Date.now() + 30000
            }
            break
            
        default:
            const funMenu = `╭━━━「 *FUN MENU* 」━━━⬣
│ 
│ 😂 *joke* - Lelucon lucu
│ 💭 *quote* - Kutipan inspiratif
│ 📚 *fact* - Fakta menarik
│ 
│ 🎮 *game* - Menu game
│ 🎯 *tebakgambar* - Tebak gambar
│ 🧮 *math* - Game matematika
│ 🎰 *slot* - Mesin slot
│ ✂️ *suit* - Batu gunting kertas
│ 
│ 🎲 *dadu* - Lempar dadu
│ 🪙 *koin* - Lempar koin
│ 🔢 *tebakangka* - Tebak angka
│ 
│ 🎵 *lirik* <judul> - Cari lirik lagu
│ 🎬 *film* <judul> - Info film
│ 🎨 *warna* - Warna random
│ 
╰━━━━━━━━━━━━━━━━━━⬣`
            
            await sock.sendMessage(from, { text: funMenu })
    }
}
