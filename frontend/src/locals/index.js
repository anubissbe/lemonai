// index.js
import { createI18n } from 'vue-i18n'
import en from './lang/en'
import zh from './lang/zh'
import de from './lang/de'
import es from './lang/es'
import fr from './lang/fr'
import ja from './lang/ja'
import kr from './lang/kr'
import pt from './lang/pt'
import tr from './lang/tr'
import tw from './lang/tw'
import vi from './lang/vi'
import nl from './lang/nl'

const messages = {
  en,
  zh,
  de,
  es,
  fr,
  ja,
  kr,
  pt,
  tr,
  tw,
  vi,
  nl,
}
const language = (navigator.language || 'en').toLocaleLowerCase() // Detect browser language
const i18n = createI18n({
  locale: localStorage.getItem('lang') || language.split('-')[0] || 'en', // Prefer saved locale, otherwise use browser language
  fallbackLocale: 'en', // Use English as fallback
  messages,
  legacy: false, // Prevent legacy-mode runtime warnings
})

export default i18n

