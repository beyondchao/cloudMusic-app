<template>
    <div class="rank" ref="rank">
        <scroll class="toplist" ref="scroll">
            <ul>
                <li class="item" v-for="item in yunTopList" :key="item.id" @click="selectItem(item)">
                    <div class="icon">
                        <img v-lazy="item.coverImgUrl" width="100" height="100">
                    </div>
                    <ul class="song-list">
                        <li class="song" v-for="(song,index) in item.top" :key="song.id">
                            <span>{{index + 1}}.</span>
                            <span>{{song.name}} - {{song.ar[0].name}}</span>
                        </li>
                    </ul>
                </li>
            </ul>
            <div v-show="showLoading" class="loading-content">
                <loading></loading>
            </div>
        </scroll>
        <router-view></router-view>
    </div>
</template>

<script>
import {getTop} from 'api/rank'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {mapMutations} from 'vuex'

const YUNMUSIC_TOP = [0,1,2,3,4,5,6,7,8,9,10,11,22,23]

export default {
    data () {
        return {
            yunTopList: [],
            showLoading: true
        }
    },
    created () {
        this._getTopList()
    },
    methods: {
        _getTopList () {
            for (let i=0; i<YUNMUSIC_TOP.length; i++){
                getTop(YUNMUSIC_TOP[i]).then((res) => {
                    let list = res.data.playlist
                    list.top = res.data.playlist.tracks.slice(0,3)
                    this.yunTopList.push(list)
                    //console.log(this.yunTopList)
                })
                if (i === YUNMUSIC_TOP.length - 1) {
                     this.showLoading = false
                }
            }
            
        },
        selectItem(item) {
            this.$router.push({
                  path: `/rank/${item.id}`
            })
            this.setTopList(item)
        },
        ...mapMutations({
            setTopList: 'SET_TOP_LIST'
        })
    },
    components: {
        Scroll,
        Loading
    }

}
</script>

<style lang="scss">
@import "~common/scss/variable.scss";
@import "~common/scss/mixin.scss";

.rank {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    .toplist {
        height: 100%;
        overflow: hidden;
        padding-top: 5px;
        .item {
            display: flex;
            margin: 0 10px;
            padding: 3px 0;
            height: 100px;
            border-bottom: 1px solid rgb(228,228,228);
            &:last-child {
                padding-bottom: 20px;
            }
            .icon {
                flex: 0 0 100px;
                width: 100px;
                height: 100px;
                img {
                    border-radius: 3px;
                }
            }
            .song-list {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                font-size: $font-size-small-x;
                padding: 0 20px;
                height: 100px;
                color: $color-text;
                .song {
                    @include no-wrap(); 
                    line-height:30px;
                }
              
            }
        }
        .loading-content {
            position: fixed;
            width: 100%;
            top: 70%;
            transform: translateY(-50%)
        }
    }
}




</style>
