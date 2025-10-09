//src/main.js
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Importa los íconos necesarios
import {
  faFan,
  faPowerOff,
  faThermometerHalf,
  faSmog,
  faChartLine,
  faMobileScreen,
  faGear,
  faChevronDown,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons'

// Agrega íconos a la librería
library.add(
  faFan,
  faPowerOff,
  faThermometerHalf,
  faSmog,
  faChartLine,
  faMobileScreen,
  faGear,
  faChevronDown,
  faCalendarDays,
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Registra el componente global de FontAwesome
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
