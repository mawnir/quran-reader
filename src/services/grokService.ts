import Groq from 'groq-sdk'

const getClient = () => {
    return new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
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