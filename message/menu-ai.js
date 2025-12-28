const axios = require('axios')
const config = require('../config.js')

module.exports = async function menuAI(sock, from, sender, args, text) {
    const command = args[0] || ''
    
    switch(command) {
        case 'chat':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .ai chat <message>' })
            }
            
            const message = args.slice(1).join(' ')
            await sock.sendMessage(from, { text: '🤖 Thinking...' })
            
            try {
                // Using OpenAI API
                if (config.openaiKey) {
                    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                        model: 'gpt-3.5-turbo',
                        messages: [{ role: 'user', content: message }],
                        max_tokens: 1000
                    }, {
                        headers: { 'Authorization': `Bearer ${config.openaiKey}` }
                    })
                    
                    const reply = response.data.choices[0].message.content
                    await sock.sendMessage(from, { text: `🤖 AI:\n${reply}` })
                } else {
                    // Fallback to local AI or other API
                    await sock.sendMessage(from, { 
                        text: '🤖 AI:\nMaaf, fitur AI sedang maintenance. Silakan coba lagi nanti.' 
                    })
                }
            } catch (error) {
                await sock.sendMessage(from, { text: '❌ Gagal mendapatkan respons AI' })
            }
            break
            
        case 'image':
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: 'Usage: .ai image <prompt>' })
            }
            
            const prompt = args.slice(1).join(' ')
            await sock.sendMessage(from, { text: '🎨 Generating image...' })
            
            try {
                // Using DALL-E or Stable Diffusion
                if (config.openaiKey) {
                    const response = await axios.post('https://api.openai.com/v1/images/generations', {
                        prompt: prompt,
                        n: 1,
                        size: '512x512'
                    }, {
                        headers: { 'Authorization': `Bearer ${config.openaiKey}` }
                    })
                    
                    const imageUrl = response.data.data[0].url
                    await sock.sendMessage(from, { 
                        image: { url: imageUrl },
                        caption: `🎨 Generated: ${prompt}`
                    })
                } else {
                    await sock.sendMessage(from, { 
                        text: '❌ API key tidak tersedia untuk generate gambar' 
                    })
                }
            } catch (error) {
                await sock.sendMessage(from, { text: '❌ Gagal generate gambar' })
            }
            break
            
        case 'translate':
            if (args.length < 3) {
                return await sock.sendMessage(from, { 
                    text: 'Usage: .ai translate <lang> <text>\nContoh: .ai translate id Hello world' 
                })
            }
            
            const lang = args[1]
            const textToTranslate = args.slice(2).join(' ')
            
            try {
                const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
                    params: {
                        client: 'gtx',
                        sl: 'auto',
                        tl: lang,
                        dt: 't',
                        q: textToTranslate
                    }
                })
                
                const translation = response.data[0][0][0]
                await sock.sendMessage(from, { 
                    text: `🌍 TRANSLATION:\n\nOriginal: ${textToTranslate}\n\nTranslated (${lang}): ${translation}` 
                })
            } catch (error) {
                await sock.sendMessage(from, { text: '❌ Gagal menerjemahkan' })
            }
            break
            
        default:
            const aiMenu = `╭━━━「 *AI MENU* 」━━━⬣
│ 
│ 💬 *chat* <msg> - Chat dengan AI
│ 🎨 *image* <prompt> - Generate gambar AI
│ 🌍 *translate* <lang> <text> - Terjemahan
│ 
│ 📝 *summarize* <text> - Ringkas teks
│ ✍️ *rewrite* <text> - Parafrase teks
│ 🔍 *analyze* <text> - Analisis sentimen
│ 
│ 🧠 *brainly* <query> - Cari jawaban Brainly
│ 📚 *wiki* <query> - Cari di Wikipedia
│ 💡 *explain* <topic> - Penjelasan AI
│ 
│ 🎯 *code* <language> <task> - Generate kode
│ 🖼️ *ocr* [image] - Baca teks dari gambar
│ 🔊 *tts* <lang> <text> - Text to speech
│ 
╰━━━━━━━━━━━━━━━━━━⬣`
            
            await sock.sendMessage(from, { text: aiMenu })
    }
}
