import Groq from 'groq-sdk'

/** localStorage key used to persist the user-supplied Groq API key */
export const GROK_API_KEY_STORAGE = 'groq_api_key'

const getClient = () => {
    const apiKey =
        localStorage.getItem(GROK_API_KEY_STORAGE) || ""
    return new Groq({
        apiKey,
        dangerouslyAllowBrowser: true,
    })
}

export const explainWord = async (
    word: string,
    fullVerse: string,
    surah: string,
): Promise<string[]> => {
    const groq = getClient()

    const prompt = `
You are an expert in Quranic Arabic and tafsir.

Explain the word "${word}" as used in this verse from Surah ${surah}: "${fullVerse}"

Respond ONLY with valid JSON, no extra text, in exactly this shape:
{"explanation": ["point 1", "point 2", "point 3"]}

Write 2-4 short points in Arabic, each under 20 words, covering:
- the word's literal meaning
- any relevant tafsir insight if useful
`

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-120b',
            response_format: { type: 'json_object' },
        })

        const jsonText = completion.choices[0]?.message?.content
        if (!jsonText) throw new Error('No explanation returned from Groq')

        const parsed = JSON.parse(jsonText)
        return Array.isArray(parsed.explanation) ? parsed.explanation : []
    } catch (e) {
        console.error('Failed to generate explanation', e)
        throw new Error('Could not generate explanation.')
    }
}

/**
 * Translates an English translation of a Quranic word into Arabic using Groq.
 */
export const translateEnglishToArabic = async (
    englishWord: string,
    arabicWord?: string,
): Promise<string> => {
    const groq = getClient()

    const prompt = `
Translate the following English word/phrase into clear Arabic: "${englishWord}"
${arabicWord ? `Context (Original Quranic Arabic word): "${arabicWord}"` : ''}

Respond ONLY with valid JSON, no extra text, in exactly this shape:
{"translation": "الترجمة بالعربية"}
`

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-120b',
            response_format: { type: 'json_object' },
        })

        const jsonText = completion.choices[0]?.message?.content
        if (!jsonText) throw new Error('No translation returned from Groq')

        const parsed = JSON.parse(jsonText)
        return parsed.translation || ''
    } catch (e) {
        console.error('Failed to translate word', e)
        throw new Error('Could not translate word.')
    }
}