import type { SongInfo } from '@ddradar/core/api/song'
import type { NuxtConfig } from '@nuxt/types'
import fetch from 'node-fetch'

const name = 'DDRadar'
const description = 'DDR Score Tracker'

/* eslint-disable no-process-env */
const {
  APPINSIGHTS_INSTRUMENTATIONKEY: instrumentationKey,
  SONGS_API_URL: songsApiUri,
} = process.env
/* eslint-enable no-process-env */

const configuration: NuxtConfig = {
  target: 'static',
  head: {
    titleTemplate: titleChunk =>
      titleChunk ? `${titleChunk} - DDRadar` : 'DDRadar',
    meta: [
      {
        name: 'keywords',
        content:
          'Dance Dance Revolution,DDR,ダンレボ,ダンスダンスレボリューション',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon alternate', type: 'image/png', href: '/favicon.png' },
    ],
  },
  loading: { color: '#fff' },
  css: ['~/assets/css/styles.scss'],
  plugins: ['~/plugins/application-insights.client.ts'],
  buildModules: ['@nuxt/typescript-build', 'nuxt-typed-vuex'],
  modules: [
    ['nuxt-buefy', { css: false }],
    '@nuxt/http',
    '@nuxtjs/pwa',
    'nuxt-i18n',
  ],
  pwa: {
    manifest: {
      name,
      short_name: name,
      description,
      theme_color: '#ff8c00',
      lang: 'ja',
      display: 'standalone',
      start_url: '/',
    },
    meta: {
      name,
      description,
      theme_color: '#ff8c00',
      lang: 'ja',
      twitterCard: 'summary',
    },
  },
  /** nuxt-i18n settings */
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', flag: 'us', name: 'English' },
      { code: 'ja', iso: 'ja-JP', flag: 'jp', name: '日本語' },
    ],
    defaultLocale: 'ja',
    strategy: 'no_prefix',
    vueI18n: { fallbackLocale: 'ja' },
    vueI18nLoader: true,
  },
  publicRuntimeConfig: {
    /** Application Insights Instrumentation Key */
    instrumentationKey,
  },
  build: {
    transpile: [/typed-vuex/, /@ddradar\/core/],
    extend(config, { isClient }) {
      if (isClient) config.devtool = 'source-map'
      config.externals = ['moment']
    },
  },
  generate: {
    exclude: [/^\/.auth\//],
    async routes() {
      if (!songsApiUri) return []
      const res = await fetch(songsApiUri)
      const songs: SongInfo[] = await res.json()
      return songs.map(s => ({ route: `/songs/${s.id}`, payload: s }))
    },
  },
}

export default configuration
