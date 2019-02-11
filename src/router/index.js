import Vue from 'vue'
import Router from 'vue-router'
import Recommend from 'cpnts/recommend/recommend'
import Rank from 'cpnts/rank/rank'
import Singer from 'cpnts/singer/singer'
import MusicList from 'cpnts/music-list/music-list'
import RankDetail from 'cpnts/rank-detail/rank-detail'
import SingerDetail from 'cpnts/singer-detail/singer-detail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: MusicList
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children : [
        {
          path: ':id',
          component: RankDetail
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [{
        path: ':id',
        component: SingerDetail
      }]
    }
  ]
})
