import { Configuration } from '@nuxt/types'

const title = 'DDRadar'
const description = 'DDR Score Tracker'

const configuration: Configuration = {
  mode: 'universal',
  target: 'static',
  head: {
    title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: description,
      },
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon alternate', type: 'image/png', href: '/favicon.png' },
    ],
  },
  loading: { color: '#fff' },
  css: ['~/assets/css/styles.scss'],
  plugins: [],
  buildModules: ['@nuxt/typescript-build', 'nuxt-typed-vuex'],
  modules: [['nuxt-buefy', { css: false }], '@nuxt/http', '@nuxtjs/pwa'],
  pwa: {
    manifest: {
      name: title,
      short_name: title,
      description,
      theme_color: '#ff8c00',
      lang: 'ja',
      display: 'standalone',
      scope: '/',
      start_url: '/',
    },
    meta: {
      name: title,
      description,
      theme_color: '#ff8c00',
      lang: 'ja',
    },
  },
  build: {
    transpile: [/typed-vuex/],
    extend(config, { isClient }) {
      if (isClient) config.devtool = 'source-map'
    },
  },
}

export default configuration
