import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const PORT = Number(process.env.PORT || 5000)

const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ||
  'openrouter/free'

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,http://localhost:5174'
)
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)



const LANGUAGE_NAMES = {
  eng_Latn: 'English',
  hin_Deva: 'Hindi',
  ben_Beng: 'Bengali',
  asm_Beng: 'Assamese',
  guj_Gujr: 'Gujarati',
  kan_Knda: 'Kannada',
  mal_Mlym: 'Malayalam',
  mar_Deva: 'Marathi',
  ory_Orya: 'Odia',
  pan_Guru: 'Punjabi',
  tam_Taml: 'Tamil',
  tel_Telu: 'Telugu',
  urd_Arab: 'Urdu',
  npi_Deva: 'Nepali',
  san_Deva: 'Sanskrit',
  mai_Deva: 'Maithili',
  doi_Deva: 'Dogri',
  gom_Deva: 'Konkani',
  brx_Deva: 'Bodo',
  kas_Arab: 'Kashmiri',
  mni_Beng: 'Manipuri',
  sat_Olck: 'Santali',
  snd_Arab: 'Sindhi'
}



app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        ALLOWED_ORIGINS.includes('*') ||
        ALLOWED_ORIGINS.includes(origin)
      ) {
        callback(null, true)
        return
      }

      callback(
        new Error('Origin not allowed by CORS')
      )
    }
  })
)

app.use(
  express.json({
    limit: '1mb'
  })
)



function cleanText(value, max = 4000) {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .trim()
    .slice(0, max)
}

function sleep(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  )
}



async function requestOpenRouter(messages) {
  const apiKey = (
    process.env.OPENROUTER_API_KEY || ''
  ).trim()

  if (!apiKey) {
    const error = new Error(
      'OPENROUTER_API_KEY is missing in backend/.env'
    )

    error.status = 503

    throw error
  }

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${apiKey}`,

        'HTTP-Referer':
          'http://localhost:5174',

        'X-Title':
          'Anuvaad AI'
      },

      body: JSON.stringify({
        model:
          OPENROUTER_MODEL,

        messages,

        temperature:
          0.2,

        max_tokens:
          1200
      })
    }
  )

  const data = await response
    .json()
    .catch(() => ({}))

  if (!response.ok) {
    console.error(
      '[OpenRouter error]',
      data
    )

    const message =
      data?.error?.message ||
      data?.message ||
      `OpenRouter failed (${response.status})`

    const error =
      new Error(message)

    error.status =
      response.status

    throw error
  }

  const text =
    data?.choices?.[0]?.message?.content

  if (
    typeof text !== 'string' ||
    !text.trim()
  ) {
    const error = new Error(
      'OpenRouter returned an empty response'
    )

    error.status = 502

    throw error
  }

  return {
    text:
      text.trim(),

    model:
      data?.model ||
      OPENROUTER_MODEL
  }
}



async function openRouterGenerate(
  messages
) {
  let lastError = null

  for (
    let attempt = 1;
    attempt <= 3;
    attempt++
  ) {
    try {
      console.log(
        `[OpenRouter] attempt ${attempt}`
      )

      return await requestOpenRouter(
        messages
      )
    } catch (error) {
      lastError = error

      console.warn(
        '[OpenRouter error]',
        error.message
      )

      const temporary =
        error.status === 429 ||
        error.status === 500 ||
        error.status === 502 ||
        error.status === 503 ||
        error.status === 504

      if (!temporary) {
        throw error
      }

      if (attempt < 3) {
        const delay =
          attempt * 1200

        console.log(
          `[OpenRouter] retry in ${delay}ms`
        )

        await sleep(delay)
      }
    }
  }

  const error = new Error(
    'AI service is temporarily busy. Please try again.'
  )

  error.status = 503

  error.originalMessage =
    lastError?.message

  throw error
}



app.get('/', (_req, res) => {
  res.json({
    name:
      'Anuvaad AI',

    status:
      'online',

    backend:
      'Node.js + Express',

    provider:
      'OpenRouter',

    model:
      OPENROUTER_MODEL
  })
})



app.get(
  '/api/health',
  (_req, res) => {
    res.json({
      status:
        'ok',

      name:
        'Anuvaad AI',

      backend:
        'Node.js + Express',

      provider:
        'OpenRouter',

      model:
        OPENROUTER_MODEL,

      apiConfigured:
        Boolean(
          (
            process.env
              .OPENROUTER_API_KEY ||
            ''
          ).trim()
        )
    })
  }
)


app.post(
  '/api/translate',
  async (req, res, next) => {
    try {
      const text =
        cleanText(
          req.body?.text
        )

      const sourceLang =
        cleanText(
          req.body?.source_lang,
          80
        )

      const targetLang =
        cleanText(
          req.body?.target_lang,
          80
        )

      const context =
        cleanText(
          req.body?.context ||
            'General',
          80
        ) || 'General'

      if (
        !text ||
        !sourceLang ||
        !targetLang
      ) {
        return res
          .status(400)
          .json({
            detail:
              'text, source_lang and target_lang are required'
          })
      }

      if (
        sourceLang ===
        targetLang
      ) {
        return res.json({
          translation:
            text,

          engine:
            'identity',

          context
        })
      }

      const source =
        LANGUAGE_NAMES[sourceLang] ||
        sourceLang

      const target =
        LANGUAGE_NAMES[targetLang] ||
        targetLang

      const messages = [
        {
          role:
            'system',

          content:
            `You are the translation engine for Anuvaad AI.

Translate text accurately from ${source} to ${target}.

Rules:
- Preserve meaning and intent.
- Preserve names, numbers, dates and proper nouns.
- Use natural everyday ${target}.
- Understand Hinglish and code-mixed Indian language input.
- Preserve useful line breaks.
- Do not explain anything.
- Do not add quotation marks.
- Return ONLY the translated text.`
        },

        {
          role:
            'user',

          content:
            `Context: ${context}

Text:
${text}`
        }
      ]

      const result =
        await openRouterGenerate(
          messages
        )

      res.json({
        translation:
          result.text,

        engine:
          result.model,

        provider:
          'OpenRouter',

        context
      })
    } catch (error) {
      next(error)
    }
  }
)



app.post(
  '/api/simplify',
  async (req, res, next) => {
    try {
      const text =
        cleanText(
          req.body?.text
        )

      const lang =
        cleanText(
          req.body?.lang,
          80
        )

      const context =
        cleanText(
          req.body?.context ||
            'General',
          80
        ) || 'General'

      if (!text || !lang) {
        return res
          .status(400)
          .json({
            detail:
              'text and lang are required'
          })
      }

      const language =
        LANGUAGE_NAMES[lang] ||
        lang

      const messages = [
        {
          role:
            'system',

          content:
            `You are Simple Mode inside Anuvaad AI.

Rewrite text in very simple, clear ${language}.

Rules:
- Preserve the original meaning.
- Do not add facts.
- Use common everyday words.
- Prefer short sentences.
- Preserve names, numbers and dates.
- If already simple, make minimal changes.
- Return ONLY the simplified text.`
        },

        {
          role:
            'user',

          content:
            `Context: ${context}

Text:
${text}`
        }
      ]

      const result =
        await openRouterGenerate(
          messages
        )

      res.json({
        simple_text:
          result.text,

        engine:
          result.model,

        provider:
          'OpenRouter'
      })
    } catch (error) {
      next(error)
    }
  }
)

/* =====================================================
   ERROR HANDLER
===================================================== */

app.use(
  (
    error,
    _req,
    res,
    _next
  ) => {
    console.error(
      '[Backend error]',
      error
    )

    if (
      error.status === 401
    ) {
      return res
        .status(401)
        .json({
          detail:
            'Invalid OpenRouter API key.'
        })
    }

    if (
      error.status === 402
    ) {
      return res
        .status(402)
        .json({
          detail:
            'OpenRouter credits are unavailable.'
        })
    }

    if (
      error.status === 429
    ) {
      return res
        .status(429)
        .json({
          detail:
            'OpenRouter rate limit reached. Please try again later.'
        })
    }

    if (
      error.status === 503
    ) {
      return res
        .status(503)
        .json({
          detail:
            'AI service is temporarily busy. Please try again.'
        })
    }

    res
      .status(
        error.status || 500
      )
      .json({
        detail:
          error.message ||
          'Something went wrong'
      })
  }
)

/* =====================================================
   START SERVER
===================================================== */

app.listen(
  PORT,
  () => {
    console.log(
      `Anuvaad AI backend running on http://localhost:${PORT}`
    )

    console.log(
      'Provider: OpenRouter'
    )

    console.log(
      `Model: ${OPENROUTER_MODEL}`
    )
  }
)