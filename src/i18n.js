import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import es from './locales/es.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import fr from './locales/fr.json'
import pt from './locales/pt.json'
import zhCN from './locales/zh-CN.json'
import ar from './locales/ar.json'
import it from './locales/it.json'
import ru from './locales/ru.json'
import hi from './locales/hi.json'
import nl from './locales/nl.json'
import tr from './locales/tr.json'
import ko from './locales/ko.json'
import id from './locales/id.json'
import vi from './locales/vi.json'
import pl from './locales/pl.json'
import th from './locales/th.json'
import sv from './locales/sv.json'
import el from './locales/el.json'
import ro from './locales/ro.json'
import cs from './locales/cs.json'
import hu from './locales/hu.json'
import bn from './locales/bn.json'
import he from './locales/he.json'

export const SUPPORTED_LOCALES = [
    'en', 'es', 'de', 'ja', 'fr', 'pt', 'zh-CN', 'ar', 'it', 'ru', 'hi', 'nl', 'tr', 'ko', 'id', 'vi', 'pl', 'th', 'sv', 'el', 'ro', 'cs', 'hu', 'bn', 'he'
]

const messages = {
    en, es, de, ja, fr, pt, 'zh-CN': zhCN, ar, it, ru, hi, nl, tr, ko, id, vi, pl, th, sv, el, ro, cs, hu, bn, he
}

const i18n = createI18n({
    legacy: false, // Must be false to use Composition API
    locale: 'en', // Set default locale
    fallbackLocale: 'en',
    messages
})

export default i18n
