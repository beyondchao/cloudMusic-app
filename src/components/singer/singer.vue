<template>
    <div class="singer" ref="singer">
        <list-view :data="this.singers" @select="selectSinger"  ref="list"></list-view>
        <router-view></router-view>
    </div>
</template>

<script>
import {getSingers} from 'api/singer'
import {ERR_OK} from 'common/js/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
import {playlistMixin} from 'common/js/mixin'
import {mapMutations} from 'vuex'

const pinyin = require('pinyin')
const HOT_NAME = '热门'
const HOT_SINGERS = 10

export default {
    // mixins: [playlistMixin],
    data () {
        return {
            singers: []
        }
    },
    created () {
        this._getSingers()
    },
    methods: {
        selectSinger (singer) {
            this.$router.push(`/singer/${singer.id}`)
            this.setSinger(singer)
        },
        _getSingers () {
            getSingers().then((res) => {
                if(res.status === ERR_OK){
                   let s= res.data.artists
                   s.map((item) => {
                       let py = pinyin(item.name[0], {
                           style: pinyin.STYLE_FIRST_LETTER
                       })
                       item.initial = py[0][0].toUpperCase()
                       
                   })
                    this.singers = this._normallizeSinger(s)
                   //console.log(this.singers)
                }
            })
        },
        _normallizeSinger (list) {
            let map = {
                hot: {
                    title: HOT_NAME,
                    items: []
                }
            }
            list.forEach((item, index) => {
                if(index < HOT_SINGERS) {
                    map.hot.items.push(new Singer({
                        id: item.id,
                        name: item.name,
                        avatar: item.img1v1Url,
                        aliaName: item.alias.join(' / ')
                    }))
                }

                const key = item.initial
                if(!map[key]) {
                    map[key] = {
                        title: key,
                        items: []
                    }
                }
                map[key].items.push(new Singer({
                    id: item.id,
                    name: item.name,
                    avatar: item.img1v1Url,
                    aliaName: item.alias[0]
                }))
            }) 

            let hot = []
            let ret = []
            for (const key in map) {
                let val = map[key]
                if(val.title.match(/[A-Z]/)) {
                    ret.push(val)
                } else if (val.title === HOT_NAME) {
                    hot.push(val)
                }
            }
            ret.sort((a, b) => {
                return a.title.charCodeAt(0) - b.title.charCodeAt(0)
            })
            // console.log(ret)
            // console.log(hot)
            return hot.concat(ret)
        },
        ...mapMutations({
            setSinger: 'SET_SINGER'
        })
    },
    components: {
            ListView
        }   

}
</script>

<style lang="scss" scoped>
.singer {
    position: fixed;
    top: 88px;
     width: 100%;
     bottom: 0;
}
</style>
