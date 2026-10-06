import { useEffect, useMemo, useRef, useState } from 'react'

import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  Check,
  Clipboard,
  FileSearch,
  Home,
  Languages,
  LoaderCircle,
  Mic,
  Moon,
  ScanLine,
  ScanText,
  Sparkles,
  Square,
  Sun,
  Volume2,
  WandSparkles,
} from 'lucide-react'

import { createWorker } from 'tesseract.js'


const LANGUAGES = [
  ['English', 'eng_Latn', 'en-IN'],
  ['Hindi', 'hin_Deva', 'hi-IN'],

  ['Bengali', 'ben_Beng', 'bn-IN'],
  ['Assamese', 'asm_Beng', 'as-IN'],

  ['Gujarati', 'guj_Gujr', 'gu-IN'],
  ['Kannada', 'kan_Knda', 'kn-IN'],

  ['Malayalam', 'mal_Mlym', 'ml-IN'],
  ['Marathi', 'mar_Deva', 'mr-IN'],

  ['Odia', 'ory_Orya', 'or-IN'],
  ['Punjabi', 'pan_Guru', 'pa-IN'],

  ['Tamil', 'tam_Taml', 'ta-IN'],
  ['Telugu', 'tel_Telu', 'te-IN'],

  ['Urdu', 'urd_Arab', 'ur-IN'],
  ['Nepali', 'npi_Deva', 'ne-NP'],

  ['Sanskrit', 'san_Deva', 'hi-IN'],
  ['Maithili', 'mai_Deva', 'hi-IN'],

  ['Dogri', 'doi_Deva', 'hi-IN'],
  ['Konkani', 'gom_Deva', 'hi-IN'],

  ['Bodo', 'brx_Deva', 'hi-IN'],
  ['Kashmiri', 'kas_Arab', 'ur-IN'],

  ['Manipuri', 'mni_Beng', 'bn-IN'],
  ['Santali', 'sat_Olck', 'hi-IN'],

  ['Sindhi', 'snd_Arab', 'ur-IN'],
]


const SAMPLE =
  'नमस्ते! मुझे रेलवे स्टेशन जाने में मदद चाहिए।'

const MODES = [
  'General',
  'Healthcare',
  'Government',
  'Education',
  'Travel',
]


const NAV_CARDS = [
  {
    icon: Home,
    title: 'Home',
    subtitle: 'Overview & AI workspace',
    badge: 'LIVE',
    accent: 'orange',
  },

  {
    icon: Languages,
    title: 'Translator',
    subtitle: '23 Indian language options',
    badge: 'AI',
    accent: 'cyan',
  },

  {
    icon: Mic,
    title: 'Voice AI',
    subtitle: 'Speak, translate & listen',
    badge: 'MIC',
    accent: 'green',
  },

  {
    icon: ScanText,
    title: 'Smart Scan',
    subtitle: 'Image OCR & simple mode',
    badge: 'OCR',
    accent: 'yellow',
  },
]




function LanguageDropdown({
  value,
  onChange,
  label,
  compact = false,
  alignRight = false,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected =
    LANGUAGES.find(lang => lang[1] === value) || LANGUAGES[0]

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang[0]
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (compact) {
    return (
      <div className="navLanguage">

        <button
          className="navLanguageBtn"
          onClick={() => setOpen(v => !v)}
          type="button"
        >
          <span>{selected[0]}</span>
          <span className={open ? 'dropdownArrow rotate' : 'dropdownArrow'}>
            ⌄
          </span>
        </button>


        {open && (
          <div className="navLanguageMenu">

            {LANGUAGES.map(lang => (
              <button
                type="button"
                key={lang[1]}
                className={value === lang[1] ? 'active' : ''}
                onClick={() => {
                  onChange(lang[1])
                  setOpen(false)
                }}
              >
                {lang[0]}
              </button>
            ))}

          </div>
        )}

      </div>
    )
  }


  return (
    <div
      className={`languageSelect customLanguageWrap ${
        alignRight ? 'alignRight' : ''
      }`}
    >

      <span>{label}</span>


      <button
        type="button"
        className={`customLanguageBtn ${
          alignRight ? 'rightLangBtn' : ''
        }`}
        onClick={() => setOpen(v => !v)}
      >

        <strong>{selected[0]}</strong>

        <span
          className={
            open
              ? 'dropdownArrow rotate'
              : 'dropdownArrow'
          }
        >
          ⌄
        </span>

      </button>


      {open && (
        <div
          className={`customLanguageMenu ${
            alignRight ? 'targetMenu' : ''
          }`}
        >

          <div className="languageSearchBox">

            <input
              type="text"
              placeholder="Search language..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />

          </div>


          <div className="languageOptions">

            {filteredLanguages.map(lang => (

              <button
                type="button"
                key={lang[1]}
                className={
                  value === lang[1]
                    ? 'languageOption active'
                    : 'languageOption'
                }
                onClick={() => {
                  onChange(lang[1])
                  setOpen(false)
                  setSearch('')
                }}
              >
                <i />

                <span>{lang[0]}</span>

              </button>

            ))}

          </div>

        </div>
      )}

    </div>
  )
}



function App() {

  const [source, setSource] =
    useState('hin_Deva')

  const [target, setTarget] =
    useState('eng_Latn')

  const [text, setText] =
    useState(SAMPLE)

  const [translated, setTranslated] =
    useState('')

  const [simple, setSimple] =
    useState('')

  const [context, setContext] =
    useState('General')

  const [busy, setBusy] =
    useState(false)

  const [listening, setListening] =
    useState(false)

  const [ocrBusy, setOcrBusy] =
    useState(false)

  const [toast, setToast] =
    useState('')

  const [darkScene, setDarkScene] =
    useState(true)

  const [sceneTilt, setSceneTilt] =
    useState({
      x: 0,
      y: 0,
    })


  const fileRef = useRef(null)
  const recognitionRef = useRef(null)
const utteranceRef = useRef(null)
const voicesRef = useRef([])

useEffect(() => {
  if (!('speechSynthesis' in window)) return

  const synth = window.speechSynthesis

  const loadVoices = () => {
    voicesRef.current = synth.getVoices()

    console.log(
      'TTS voices loaded:',
      voicesRef.current.length
    )
  }

  loadVoices()

  synth.addEventListener(
    'voiceschanged',
    loadVoices
  )

  return () => {
    synth.cancel()

    try {
      recognitionRef.current?.abort()
    } catch {
      // ignore cleanup error
    }

    synth.removeEventListener(
      'voiceschanged',
      loadVoices
    )
  }
}, [])

  const sourceInfo = useMemo(
    () => LANGUAGES.find(x => x[1] === source),
    [source]
  )


  const targetInfo = useMemo(
    () => LANGUAGES.find(x => x[1] === target),
    [target]
  )



  const flash = message => {

    setToast(message)

    window.setTimeout(
      () => setToast(''),
      2200
    )
  }




  async function translate() {

    if (!text.trim()) return

    setBusy(true)
    setSimple('')

    try {

      const res = await fetch(
        '/api/translate',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            text,
            source_lang: source,
            target_lang: target,
            context,
          }),
        }
      )


      const data = await res.json()


      if (!res.ok) {

        throw new Error(
          data.detail ||
          data.error ||
          'Translation failed'
        )
      }


      setTranslated(
        data.translation
      )

    } catch (error) {

      flash(error.message)

    } finally {

      setBusy(false)
    }
  }



  

  async function simplify() {

    const value =
      translated || text


    if (!value.trim()) return


    setBusy(true)


    try {

      const res = await fetch(
        '/api/simplify',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            text: value,

            lang:
              translated
                ? target
                : source,

            context,
          }),
        }
      )


      const data = await res.json()


      if (!res.ok) {

        throw new Error(
          data.detail ||
          data.error ||
          'Simplification failed'
        )
      }


      setSimple(
        data.simple_text
      )

    } catch (error) {

      flash(error.message)

    } finally {

      setBusy(false)
    }
  }




  function swap() {

    setSource(target)
    setTarget(source)

    setText(
      translated || text
    )

    setTranslated(text)

    setSimple('')
  }


 function speak(value, locale) {
  const speechText =
    typeof value === 'string'
      ? value.trim()
      : ''

  if (!speechText) {
    return flash('Nothing to read')
  }

  if (!('speechSynthesis' in window)) {
    return flash(
      'Text-to-speech is not supported in this browser'
    )
  }

  const synth = window.speechSynthesis

  // Stop old playback
  synth.cancel()

  // Chrome can sometimes remain paused
  if (synth.paused) {
    synth.resume()
  }

  const speechLocale =
    locale || 'en-IN'

  const baseLanguage =
    speechLocale
      .split('-')[0]
      .toLowerCase()

  const voices =
    voicesRef.current.length
      ? voicesRef.current
      : synth.getVoices()

  const matchingVoices =
    voices.filter(voice => {
      const voiceLang =
        voice.lang.toLowerCase()

      return (
        voiceLang ===
          speechLocale.toLowerCase() ||
        voiceLang.startsWith(
          baseLanguage
        )
      )
    })

  // Prefer good Chrome / Windows voices
  const preferredVoice =
    matchingVoices.find(voice =>
      /google|microsoft|natural|online/i.test(
        voice.name
      )
    ) ||
    matchingVoices[0] ||
    null

  let retryDone = false

  const playSpeech = (
    forcedVoice = null
  ) => {
    const utterance =
      new SpeechSynthesisUtterance(
        speechText
      )

    utterance.lang =
      speechLocale

    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    /*
      First attempt:
      DON'T force voice.

      This behaves exactly like the
      console test that worked for you.
    */
    if (forcedVoice) {
      utterance.voice =
        forcedVoice
    }

    // Keep object alive
    utteranceRef.current =
      utterance

    let startedAt = 0

    utterance.onstart = () => {
      startedAt =
        performance.now()

      console.log(
        'TTS started:',
        {
          language:
            utterance.lang,

          voice:
            utterance.voice?.name ||
            'Browser default'
        }
      )

      flash(
        'Playing translation...'
      )
    }

    utterance.onend = () => {
      const duration =
        startedAt
          ? performance.now() -
            startedAt
          : 0

      console.log(
        'TTS finished:',
        `${Math.round(duration)}ms`
      )

      /*
        Sometimes Chrome reports
        "finished" immediately without
        producing audio.

        In that case retry with an
        explicit matching voice.
      */
      if (
        !retryDone &&
        duration < 350 &&
        preferredVoice &&
        forcedVoice === null
      ) {
        retryDone = true

        console.log(
          'Retrying TTS with:',
          preferredVoice.name,
          preferredVoice.lang
        )

        window.setTimeout(() => {
          playSpeech(
            preferredVoice
          )
        }, 150)

        return
      }

      utteranceRef.current =
        null

      flash(
        'Playback finished'
      )
    }

    utterance.onerror = event => {
      console.error(
        'TTS error:',
        event.error
      )

      /*
        If automatic browser voice fails,
        retry once with matching voice.
      */
      if (
        !retryDone &&
        preferredVoice &&
        forcedVoice === null
      ) {
        retryDone = true

        window.setTimeout(() => {
          playSpeech(
            preferredVoice
          )
        }, 150)

        return
      }

      utteranceRef.current =
        null

      flash(
        `Speech error: ${event.error}`
      )
    }

    synth.speak(
      utterance
    )
  }


  window.setTimeout(() => {
    playSpeech()
  }, 150)
}
  
function startVoice() {
  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition

  if (!Recognition) {
    return flash(
      'Voice input works best in Chrome or Edge'
    )
  }

  /*
    If already listening,
    second click stops recording.
  */
  if (
    listening &&
    recognitionRef.current
  ) {
    try {
      recognitionRef.current.stop()
    } catch {
      // ignore
    }

    recognitionRef.current =
      null

    setListening(false)

    flash('Voice input stopped')

    return
  }

  /*
    Stop Listen/TTS before microphone
    starts so speaker audio doesn't get
    captured by the microphone.
  */
  if (
    'speechSynthesis' in window
  ) {
    window.speechSynthesis.cancel()
  }

  const recognition =
    new Recognition()

  recognitionRef.current =
    recognition

  recognition.lang =
    sourceInfo?.[2] ||
    'hi-IN'

  recognition.interimResults =
    false

  recognition.continuous =
    false

  recognition.maxAlternatives =
    1

  recognition.onstart = () => {
    setListening(true)

    flash(
      `Listening in ${
        sourceInfo?.[0] ||
        'selected language'
      }...`
    )

    console.log(
      'Speech recognition started:',
      recognition.lang
    )
  }

  recognition.onresult = event => {
    const transcript =
      event.results?.[0]?.[0]
        ?.transcript
        ?.trim()

    console.log(
      'Voice transcript:',
      transcript
    )

    if (transcript) {
      setText(transcript)

      /*
        Remove old result so stale
        translation isn't displayed.
      */
      setTranslated('')
      setSimple('')

      flash('Voice captured')
    }
  }

  recognition.onerror = event => {
    console.log(
      'Speech recognition error:',
      event.error
    )

    setListening(false)

    recognitionRef.current =
      null

    if (
      event.error ===
      'not-allowed'
    ) {
      flash(
        'Microphone permission is blocked'
      )
    }

    else if (
      event.error ===
      'no-speech'
    ) {
      flash(
        'No speech detected. Please speak again.'
      )
    }

    else if (
      event.error ===
      'audio-capture'
    ) {
      flash(
        'Microphone not detected'
      )
    }

    else if (
      event.error ===
      'network'
    ) {
      flash(
        'Speech recognition needs internet access'
      )
    }

    else if (
      event.error ===
      'aborted'
    ) {
      // Normal when user stops it
      console.log(
        'Voice recognition stopped'
      )
    }

    else {
      flash(
        `Microphone error: ${event.error}`
      )
    }
  }

  recognition.onend = () => {
    console.log(
      'Speech recognition ended'
    )

    recognitionRef.current =
      null

    setListening(false)
  }

  try {
    recognition.start()
  } catch (error) {
    console.error(
      'Could not start microphone:',
      error
    )

    recognitionRef.current =
      null

    setListening(false)

    flash(
      'Could not start microphone'
    )
  }
}

async function runOcr(file) {
  if (!file) return

  setOcrBusy(true)

  try {
    const worker =
      await createWorker('eng')

    const result =
      await worker.recognize(file)

    await worker.terminate()

    setText(
      result.data.text.trim()
    )

    setTranslated('')
    setSimple('')

    flash(
      'Text extracted from image'
    )
  } catch (error) {
    console.error(
      'OCR error:',
      error
    )

    flash(
      `OCR failed: ${error.message}`
    )
  } finally {
    setOcrBusy(false)
  }
}
 

  async function copy(value) {

    if (!value) return


    await navigator
      .clipboard
      .writeText(value)


    flash(
      'Copied to clipboard'
    )
  }



  function handleSceneMove(event) {

    const rect =
      event.currentTarget
        .getBoundingClientRect()


    const x =
      (
        event.clientX -
        rect.left
      ) /
      rect.width -
      0.5


    const y =
      (
        event.clientY -
        rect.top
      ) /
      rect.height -
      0.5


    setSceneTilt({
      x: x * 7,
      y: y * -6,
    })
  }




  return (

    <main
      className={
        darkScene
          ? 'appShell'
          : 'appShell lightScene'
      }
    >


      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="topbar">

        <div className="topbarInner">


          <div className="brandLockup">

            <div className="brandShield">
              <Languages size={21} />
            </div>

            <strong>
              ANUVAAD AI
            </strong>

            <span className="aiChip">
              AI
            </span>

          </div>



          <nav className="topLinks">

            <a
              className="active"
              href="#home"
            >
              <Home size={16} />
              Home
            </a>


            <a href="#translator">
              <Languages size={16} />
              Translator
            </a>


            <a href="#voice">
              <Mic size={16} />
              Voice AI
            </a>


            <a href="#scan">
              <ScanLine size={16} />
              Smart Scan
            </a>

          </nav>



          <div className="topActions">

            <button
              className="squareAction"
              type="button"
              title="Toggle page tone"
              onClick={() =>
                setDarkScene(
                  value => !value
                )
              }
            >

              {darkScene
                ? <Sun size={18} />
                : <Moon size={18} />
              }

            </button>



            <button
              className="voiceAction"
              type="button"
              onClick={startVoice}
            >
              <Mic size={16} />
              Voice AI
            </button>



            <LanguageDropdown
              value={source}
              onChange={setSource}
              compact
            />

          </div>

        </div>


        <div className="accentTrack">
          <span />
          <span />
        </div>

      </header>



      {/* =================================================
          STATUS STRIP
      ================================================= */}

      <div className="statusStrip">

        <div>

          <i />

          Anuvaad AI Production Workspace

          <b>•</b>

          Context-aware AI

          <b>•</b>

          Voice + OCR

          <b>•</b>

          23 Languages

        </div>

      </div>



      {/* =================================================
          DASHBOARD TABS
      ================================================= */}

      <section
        className="dashboardTabs shell"
        id="home"
      >

        {NAV_CARDS.map(
          (
            {
              icon: Icon,
              title,
              subtitle,
              badge,
              accent,
            },
            index
          ) => (

            <button
              type="button"
              key={title}
              className={
                `dashTab ${
                  index === 0
                    ? 'selected'
                    : ''
                } ${accent}`
              }

              onClick={() => {

                const destination =
                  index === 0
                    ? '#home'
                    : '#translator'


                document
                  .querySelector(
                    destination
                  )
                  ?.scrollIntoView({
                    behavior:
                      'smooth',
                  })
              }}
            >

              <span className="tabIcon">
                <Icon size={18} />
              </span>


              <span className="tabText">

                <strong>
                  {title}
                </strong>

                <small>
                  {subtitle}
                </small>

              </span>


              <em>
                {badge}
              </em>

            </button>

          )
        )}

      </section>



      {/* =================================================
          HERO
      ================================================= */}

      <section className="heroFrame shell">


        <div className="heroCopy">


          <div className="heroKicker">

            <i />

            NEXT-GEN MULTILINGUAL
            COMMUNICATION AI

          </div>



          <h1>

            Speak freely.

            <br />

            <span>
              Understand everyone.
            </span>

          </h1>



          <p>

            Translate real conversations
            across Indian languages with
            voice input, smart OCR,
            natural speech output and an
            AI-powered Simple Mode.

          </p>



          <div className="heroCtas">

            <button
              type="button"
              className="ctaPrimary"
              onClick={() =>
                document
                  .querySelector(
                    '#translator'
                  )
                  ?.scrollIntoView({
                    behavior:
                      'smooth',
                  })
              }
            >

              <Languages size={18} />

              START TRANSLATING

              <ArrowRight size={18} />

            </button>



            <button
              type="button"
              className="ctaSecondary"
              onClick={startVoice}
            >

              <Mic size={18} />

              LIVE VOICE AI

            </button>

          </div>



          <div className="heroChecks">

            <span>
              <Check size={15} />
            OPENROUTER API
            </span>


            <span>
              <Check size={15} />
              23 Language Options
            </span>


            <span>
              <Check size={15} />
              Browser Voice + OCR
            </span>

          </div>

        </div>



        {/* =================================================
            LANGUAGE NEURAL SPACE
        ================================================= */}

        <div
          className="scenePanel"
          onMouseMove={
            handleSceneMove
          }
          onMouseLeave={() =>
            setSceneTilt({
              x: 0,
              y: 0,
            })
          }
        >


          <div className="sceneTopTags">

            <span>
              <i />
              LANGUAGE NEURAL SPACE
            </span>


            <span className="green">

              <i />

              LIVE VOICE ROUTER

            </span>

          </div>



          <div
            className="spatialStage neuralStage"

            style={{
              transform:
                `perspective(900px)
                 rotateY(${sceneTilt.x}deg)
                 rotateX(${sceneTilt.y}deg)`
            }}
          >


            {/* grid */}

            <div className="gridFloor" />



            {/* particles */}

            <div className="sceneParticles">

              {Array
                .from({
                  length: 18,
                })
                .map(
                  (_, index) => (

                    <i
                      key={index}

                      style={{

                        left:
                          `${(
                            index *
                            37
                          ) % 94}%`,

                        top:
                          `${(
                            index *
                            53
                          ) % 88}%`,

                        animationDelay:
                          `${
                            (
                              index %
                              7
                            ) *
                            0.3
                          }s`,
                      }}
                    />

                  )
                )}

            </div>



            {/* neural rings */}

            <div className="neuralRing ringOne" />

            <div className="neuralRing ringTwo" />

            <div className="neuralRing ringThree" />



            {/* connection lines */}

            <div className="connectionLine lineOne" />

            <div className="connectionLine lineTwo" />



            {/* center core */}

            <div className="languageCore">

              <Languages size={30} />

              <small>
                AI CORE
              </small>

            </div>



            {/* floating languages */}

            <div className="floatingLanguage langHindi">

              हिन्दी

              <small>
                HINDI
              </small>

            </div>



            <div className="floatingLanguage langTamil">

              தமிழ்

              <small>
                TAMIL
              </small>

            </div>



            <div className="floatingLanguage langBengali">

              বাংলা

              <small>
                BENGALI
              </small>

            </div>



            <div className="floatingLanguage langEnglish">

              A

              <small>
                ENGLISH
              </small>

            </div>


          </div>



          <div className="sceneFooterTags">

            <span>
              <Mic size={14} />
              Voice Capture
            </span>


            <span>
              <ScanText size={14} />
              Smart OCR
            </span>


            <span>
              <Volume2 size={14} />
              Speech Output
            </span>


            <span>
              <Sparkles size={14} />
              Simple Mode
            </span>

          </div>



          <div className="sceneHint">

            Interactive 3D
            • Move cursor

          </div>

        </div>

      </section>



      {/* =================================================
          TRANSLATOR
      ================================================= */}

      <section
        className="workspaceSection"
        id="translator"
      >

        <div className="workspaceInner shell">


          <div className="workspaceHeader">


            <div>

              <span className="sectionCode">

                02 / AI TRANSLATOR

              </span>


              <h2>

                Translate the way people
                actually speak.

              </h2>

            </div>



            <div className="contextSwitch">

              {MODES.map(
                mode => (

                  <button
                    type="button"
                    key={mode}

                    className={
                      context === mode
                        ? 'active'
                        : ''
                    }

                    onClick={() =>
                      setContext(mode)
                    }
                  >

                    {mode}

                  </button>

                )
              )}

            </div>

          </div>



          <div className="translatorCard">


            {/* LANGUAGE BAR */}

            <div className="languagebar">


              <LanguageDropdown
                label="FROM"
                value={source}
                onChange={setSource}
              />



              <button
                type="button"
                className="swap"
                onClick={swap}
                title="Swap languages"
              >

                <ArrowLeftRight
                  size={18}
                />

              </button>



              <LanguageDropdown
                label="TO"
                value={target}
                onChange={setTarget}
                alignRight
              />


            </div>



            {/* PANELS */}

            <div className="panels">


              {/* INPUT */}

              <div className="panel inputPanel">


                <div className="panelTop">

                  <span className="panelTag">

                    INPUT FEED

                  </span>


                  <span>

                    {text.length}
                    /4000

                  </span>

                </div>



                <textarea
                  value={text}

                  onChange={
                    e =>
                      setText(
                        e.target.value
                      )
                  }

                  placeholder="Type, speak or scan something…"

                  maxLength={4000}
                />



                <div
                  className="panelFooter"
                  id="voice"
                >


                  <button
                    type="button"
                    className={
                      listening
                        ? 'recording'
                        : ''
                    }

                    onClick={
                      startVoice
                    }
                  >

                    {listening
                      ? <Square size={16} />
                      : <Mic size={17} />
                    }

                    {listening
                      ? 'Listening…'
                      : 'Speak'
                    }

                  </button>



                  <button
                    type="button"
                    id="scan"

                    onClick={() =>
                      fileRef
                        .current
                        ?.click()
                    }

                    disabled={
                      ocrBusy
                    }
                  >

                    {ocrBusy
                      ? (
                        <LoaderCircle
                          className="spin"
                          size={17}
                        />
                      )
                      : (
                        <ScanText
                          size={17}
                        />
                      )
                    }

                    Scan image

                  </button>



                  <input
                    ref={fileRef}
                    hidden

                    type="file"

                    accept="image/*"

                    onChange={
                      e =>
                        runOcr(
                          e.target
                            .files?.[0]
                        )
                    }
                  />


                </div>

              </div>



              {/* OUTPUT */}

              <div className="panel outputPanel">


                <div className="panelTop">

                  <span className="panelTag greenTag">

                    AI OUTPUT

                  </span>


                  {translated && (

                    <span className="success">

                      <Check size={14} />

                      Ready

                    </span>

                  )}

                </div>



                {translated ? (

                  <p className="translation">

                    {translated}

                  </p>

                ) : (

                  <div className="emptyState">

                    <WandSparkles
                      size={34}
                    />

                    <strong>

                      Translation stream
                      waiting

                    </strong>

                    <span>

                      Natural,
                      context-aware output
                      will appear here.

                    </span>

                  </div>

                )}



                <div className="panelFooter rightActions">


                  <button
                    type="button"
                    onClick={() =>
                      speak(
                        translated,
                        targetInfo?.[2]
                      )
                    }
                  >

                    <Volume2 size={17} />

                    Listen

                  </button>



                  <button
                    type="button"
                    onClick={() =>
                      copy(
                        translated
                      )
                    }
                  >

                    <Clipboard size={17} />

                    Copy

                  </button>


                </div>

              </div>

            </div>



            {/* MAIN ACTIONS */}

            <div className="primaryActions">


              <button
                type="button"
                className="translateBtn"

                onClick={
                  translate
                }

                disabled={
                  busy ||
                  !text.trim()
                }
              >

                {busy
                  ? (
                    <LoaderCircle
                      className="spin"
                      size={20}
                    />
                  )
                  : (
                    <Languages
                      size={20}
                    />
                  )
                }

                TRANSLATE WITH AI

                <ArrowRight
                  size={19}
                />

              </button>



              <button
                type="button"
                className="simpleBtn"

                onClick={
                  simplify
                }

                disabled={
                  busy ||
                  (
                    !translated &&
                    !text
                  )
                }
              >

                <Sparkles
                  size={18}
                />

                EXPLAIN SIMPLY

              </button>


            </div>

          </div>



          {/* SIMPLE RESULT */}

          {simple && (

            <div className="simpleCard">

              <div className="simpleIcon">

                <Sparkles
                  size={20}
                />

              </div>


              <div>

                <span className="sectionCode">

                  SIMPLE MODE ·
                  {' '}
                  {context.toUpperCase()}

                </span>


                <h3>
                  Easy version
                </h3>


                <p>
                  {simple}
                </p>

              </div>

            </div>

          )}

        </div>

      </section>



      {/* =================================================
          SYSTEMS
      ================================================= */}

      <section className="systems shell">


        <div className="systemsTitle">

          <span className="sectionCode">

            03 / CORE SYSTEMS

          </span>


          <h2>

            One workspace.
            Four ways to break the
            language barrier.

          </h2>

        </div>



        <div className="systemGrid">


          <article>

            <div className="systemIcon orangeIcon">

              <Languages />

            </div>

            <b>
              Context Translation
            </b>

            <p>

              Natural output shaped
              by travel, healthcare,
              education and everyday
              use.

            </p>

            <span>
              LANGUAGE CORE
            </span>

          </article>



          <article>

            <div className="systemIcon greenIcon">

              <Mic />

            </div>

            <b>
              Live Voice AI
            </b>

            <p>

              Speak in your language,
              translate the result and
              play it back instantly.

            </p>

            <span>
              VOICE ROUTER
            </span>

          </article>



          <article>

            <div className="systemIcon cyanIcon">

              <FileSearch />

            </div>

            <b>
              Smart Visual Scan
            </b>

            <p>

              Extract text from
              notices, signs and
              images before
              translating.

            </p>

            <span>
              OCR SCANNER
            </span>

          </article>



          <article>

            <div className="systemIcon yellowIcon">

              <BadgeCheck />

            </div>

            <b>
              Simple Mode
            </b>

            <p>

              Turn formal or difficult
              wording into shorter,
              easier language.

            </p>

            <span>
              CLARITY LAYER
            </span>

          </article>


        </div>

      </section>



      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="siteFooter">

        <div className="shell footerInner">


          <div className="brandLockup small">

            <div className="brandShield">

              <Languages
                size={17}
              />

            </div>

            <strong>
              ANUVAAD AI
            </strong>

          </div>


          <span>

            Node.js + Express backend
            • OPENROUTER API
            • React + Vite

          </span>

        </div>

      </footer>



      {/* TOAST */}

      {toast && (

        <div className="toast">

          {toast}

        </div>

      )}


    </main>
  )
}


export default App