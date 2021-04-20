<template>
  <div>
    <b-navbar type="is-primary">
      <template #brand>
        <b-navbar-item tag="nuxt-link" :to="{ path: '/' }">
          <img src="~assets/logo.svg" alt="DDRadar Logo" />
          <b>DDRadar</b>
        </b-navbar-item>
      </template>

      <template #start>
        <b-navbar-item tag="nuxt-link" to="/users">
          {{ $t('menu.user') }}
        </b-navbar-item>
        <b-navbar-dropdown
          v-for="m in menuList"
          :key="m.label"
          class="is-hidden-touch"
          :label="m.label"
          hoverable
          collapsible
        >
          <b-navbar-item
            v-for="i in m.items"
            :key="i.name"
            tag="nuxt-link"
            :to="i.to"
          >
            {{ i.name }}
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-dropdown
          class="is-hidden-touch"
          :label="$t('menu.name')"
          hoverable
          collapsible
        >
          <b-navbar-item tag="div" class="buttons are-small">
            <b-button
              v-for="(label, i) in nameIndexList"
              :key="label"
              type="is-text"
              tag="nuxt-link"
              :to="`/name/${i}`"
            >
              {{ label }}
            </b-button>
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>

      <template #end>
        <b-navbar-dropdown right collapsible>
          <template #default>
            <b-navbar-item
              v-for="locale in availableLocales"
              :key="locale.code"
              @click="$i18n.setLocale(locale.code)"
            >
              <flag :iso="locale.flag" :title="locale.name" />
            </b-navbar-item>
          </template>
          <template #label>
            <flag
              v-if="selectedLocale"
              :iso="selectedLocale.flag"
              :title="selectedLocale.name"
            />
          </template>
        </b-navbar-dropdown>
        <b-navbar-dropdown
          v-if="$accessor.isLoggedIn"
          :label="$accessor.name"
          hoverable
          right
        >
          <b-navbar-item tag="div">
            <div class="buttons">
              <b-button
                icon-left="account"
                type="is-info"
                tag="nuxt-link"
                :to="userPage"
              >
                {{ $t('menu.mypage') }}
              </b-button>
              <b-button type="is-warning" tag="a" href="/.auth/logout">
                {{ $t('menu.logout') }}
              </b-button>
            </div>
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-dropdown v-else :label="$t('menu.login')" hoverable right>
          <b-navbar-item tag="div">
            <div class="buttons">
              <b-button
                icon-left="twitter"
                type="is-info"
                tag="a"
                :href="`/.auth/login/twitter?post_login_redirect_uri=${$route.path}`"
              >
                {{ $t('login.twitter') }}
              </b-button>
              <b-button
                icon-left="github"
                type="is-dark"
                tag="a"
                :href="`/.auth/login/github?post_login_redirect_uri=${$route.path}`"
              >
                {{ $t('login.github') }}
              </b-button>
            </div>
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>
    </b-navbar>

    <div>
      <b-loading :active.sync="$fetchState.pending" />
      <nuxt />
    </div>

    <footer class="footer">
      <div class="content has-text-centered">
        <i18n path="footer.text" tag="p">
          <template #twitter>
            <a href="https://twitter.com/nogic1008" target="_blank">
              {{ $t('footer.twitter') }}
            </a>
          </template>
          <template #github>
            <a href="https://github.com/ddradar/ddradar/issues" target="_blank">
              {{ $t('footer.github') }}
            </a>
          </template>
        </i18n>
      </div>
    </footer>
  </div>
</template>

<i18n>
{
  "ja": {
    "menu": {
      "user": "ユーザーを探す",
      "single": "レベル(SINGLE)",
      "double": "レベル(DOUBLE)",
      "series": "バージョン",
      "course": "コースデータ",
      "nonstop": "NONSTOP({series})",
      "grade": "段位認定({series})",
      "name": "曲名",
      "mypage": "マイページ",
      "logout": "ログアウト",
      "login": "ログイン"
    },
    "login": {
      "twitter": "Twitterでログイン",
      "github": "GitHubでログイン"
    },
    "footer": {
      "text": "不具合を発見した、または新機能の要望がある場合には、{twitter}または{github}にてご報告ください。",
      "twitter": "作者のTwitter",
      "github": "Githubのissue"
    }
  },
  "en": {
    "menu": {
      "user": "Find User",
      "single": "Lv(SINGLE)",
      "double": "Lv(DOUBLE)",
      "series": "Version",
      "course": "Courses",
      "nonstop": "NONSTOP({series})",
      "grade": "GRADE({series})",
      "name": "Name",
      "mypage": "MyPage",
      "logout": "Logout",
      "login": "Login"
    },
    "login": {
      "twitter": "Login via Twitter",
      "github": "Login via GitHub"
    },
    "footer": {
      "text": "Did you find a bug or have an idea? Please report on {twitter} or {github}.",
      "twitter": "Twitter",
      "github": "GitHub"
    }
  }
}
</i18n>

<script lang="ts">
import { Song } from '@ddradar/core'
import type { LocaleObject } from 'nuxt-i18n'
import { Component, Vue } from 'nuxt-property-decorator'

import { shortenSeriesName } from '~/api/song'
import Flag from '~/components/pages/Flag.vue'

@Component({ components: { Flag }, fetchOnServer: false })
export default class DefaultLayout extends Vue {
  get userPage() {
    return `/users/${this.$accessor.user?.id}`
  }

  get menuList() {
    const seriesList = [...Song.seriesSet]
    return [
      {
        label: this.$t('menu.single'),
        items: [...Array(19).keys()].map(i => ({
          name: `LEVEL ${i + 1}`,
          to: `/single/${i + 1}`,
        })),
      },
      {
        label: this.$t('menu.double'),
        items: [...Array(19).keys()].map(i => ({
          name: `LEVEL ${i + 1}`,
          to: `/double/${i + 1}`,
        })),
      },
      {
        label: this.$t('menu.series'),
        items: seriesList
          .map((name, i) => ({
            name,
            to: `/series/${i}`,
          }))
          .reverse(),
      },
      {
        label: this.$t('menu.course'),
        items: [16, 17]
          .map(i => [
            {
              name: this.$t('menu.nonstop', {
                series: shortenSeriesName(seriesList[i]),
              }),
              to: `/nonstop/${i}`,
            },
            {
              name: this.$t('menu.grade', {
                series: shortenSeriesName(seriesList[i]),
              }),
              to: `/grade/${i}`,
            },
          ])
          .flat(),
      },
    ]
  }

  get nameIndexList() {
    return [...Song.nameIndexMap.values()]
  }

  get selectedLocale() {
    return (this.$i18n.locales as (string | LocaleObject)[]).find(
      (i): i is LocaleObject =>
        typeof i === 'object' && i.code === this.$i18n.locale
    )
  }

  get availableLocales() {
    return (this.$i18n.locales as (string | LocaleObject)[]).filter(
      (i): i is LocaleObject =>
        typeof i === 'object' && i.code !== this.$i18n.locale
    )!
  }

  /** Get Login user info */
  async fetch() {
    await this.$accessor.fetchUser()
    if (this.$accessor.auth && !this.$accessor.isLoggedIn)
      this.$router.push('/profile')
  }
}
</script>
