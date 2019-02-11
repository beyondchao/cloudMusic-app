<template>
    <transition name="slide">
       <div class="music-list">
           <div class="header" ref="header">
               <div class="headerFilter" ref="headerFilter"></div>
               <div class="back" @click="back">
                   <i class="fa fa-angle-left"></i>
               </div>
               <div class="text">
                   <h1 class="title">{{headerTitle}}</h1>
               </div>
           </div>
            <scroll class="list"
            @scroll="scroll"
            :listen-scroll="listenScroll"
            :probe-type="probeType"
            ref="list">
                <div class="music-list-wrapper">
                    <div class="bg-image" :style="bgStyle" ref="bgImage">
                        <div class="filter"></div>
                        <div class="text">
                            <h2 class="list-title">{{title}}</h2>
                            <p class="update">{{updateTime}}</p>
                        </div>
                    </div>
                    <div class="song-list-wrapper">
                        <div class="sequence-play" v-show="listDetail">
                            <i class="iconfont icon-bofangicon"></i>
                            <span class="text">播放全部</span>
                            <span class="count">(共{{this.listDetail.length}}首)</span>
                        </div>
                        <song-list :songs="listDetail" @select="selectItem"></song-list>
                    </div>
                </div>
                <div v-show="!listDetail.length" class="loading-content">
                    <loading></loading>
                </div>
            </scroll>
        </div> 
    </transition>
</template>

<script>
import {mapGetters,mapActions} from 'vuex'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {createSong} from 'common/js/song'
import SongList from 'base/song-list/song-list'


const RESERVED_HEIGHT = 44

export default {
    data () {
        return {
            headerTitle: '排行榜',
            listDetail: [],
            scrollY: 0
        }
    },
    created () {
       
        if (!this.topList.id) {
                this.$router.push({
                    path: '/rank'
                })
            }
        this._normalLizeSongs(this.topList.tracks) 
        //console.log(this.listDetail)
       
        this.probeType = 3
        this.listenScroll = true
    },
    methods: {
        back () {
            this.$router.go(-1);
        },
        scroll (pos) {
            this.scrollY = pos.y
        },
        _normalLizeSongs　(list) {
            if (!this.topList.id) {
                this.$router.push({
                    path: '/rank'
                })
                return
            }
            let ret = []
            list.forEach((item) => {
                ret.push(createSong(item))
            })
            this.listDetail = ret
        },
        selectItem (item, index) {
            this.selectPlay({
                list: this.listDetail,
                index: index
            })
        },
        ...mapActions ([
            'selectPlay'
        ])
    },
    mounted () {
        this.imageHeight = this.$refs.bgImage.clientHeight
        this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    },
    computed: {
        title () {
            return this.topList.name
        },
        bgStyle () {
            return `background-image: url(${this.topList.coverImgUrl})`
        },
        headerTitleTouchDown () {
            return this.topList.name
        },
        updateTime () {
           let time = new Date(this.topList.updateTime)
           let year = time.getFullYear()
           let month = time.getMonth() + 1
           let day = time.getDate()
           return `最近更新:${year}/${month}/${day}`
        },
        ...mapGetters([
                'topList'
            ])
    },
    watch: {
        scrollY (newY) {
            let percent = Math.abs(newY / this.imageHeight)
             if (percent > 1) {
                percent = 1
            }
            if (newY < this.minTranslateY + RESERVED_HEIGHT -20) {
                this.headerTitle = this.headerTitleTouchDown
            } else {
                this.headerTitle = "排行榜"
            }
            if (newY < 0) {
                this.$refs.headerFilter.style.backgroundImage = `url(${this.topList.coverImgUrl})`
                this.$refs.headerFilter.style.filter = `opacity(${percent})`
            
            } else {
                this.$refs.header.style.background = `rgba(212, 68, 57, 0)`
            }
        }
    },
    components: {
        Scroll,
        Loading,
        SongList
    }

}
</script>

<style lang="scss" scoped>
@import '~common/scss/variable';
@import '~common/scss/mixin';

.slide-enter-active, .slide-leave-active {
    transition: all 0.2s
}
.slide-enter, .slide-leave-to {
    transform: translate3d(30%, 0, 0);
    opacity: 0;
}

.music-list {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $color-background;
    .header {
        position: fixed;
        z-index: 100;
        top: 0;
        width: 100%;
        height: 44px;
        overflow: hidden;
        .headerFilter {
            position: absolute;
            width: 1000%;
            height: 100%;
            background-position: top;
            background-size: cover;
        }
        .back {
            position: absolute;
            left: 4px;
            top: 0;
            text-shadow: 1px 1px 1px #000;
            .fa-angle-left {
                padding: 5px 10px;
                font-size: 30px;
                color: #fff;
            }
        }
        .text {
            position: absolute;
            color: #fff;
            left: 38px;
            line-height: 44px;
            font-size: $font-size-medium-x;
            text-shadow: 1px 1px 1px #000;
            @include no-wrap()
        }
    }
    .list {
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100%;
        background: $color-background;
        .music-list-wrapper {
            .bg-image {
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 75%;
                transform-origin: top;
                background-size: cover;
                background-position: 0 30%;
                .filter {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    background: black;
                    opacity: 0.2;
                }
                .text {
                    position: absolute;
                    width: 80%;
                    height: 40px;
                    left: 20px;
                    bottom: 40px;
                    color: #fff;
                    .list-title {
                        position: absolute;
                        bottom: 0;
                        font-style: italic;
                        font-size: $font-size-large;
                        line-height: 18px;
                        font-weight: bold;
                        letter-spacing: 1px;
                    }
                    .update {
                        position: absolute;
                        top: 45px;
                        line-height: 14px;
                        font-size: $font-size-small;
                    }
                }
            }
            .song-list-wrapper {
                padding: 40px 0 20px 0;
                border-radius: 10px;
                position: relative;
                top: -10px;
                background: $color-background;
                .sequence-play {
                    position: absolute;
                    top: 0px;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 40px;
                    padding-left: 16px;
                    border-bottom: 1px solid rgb(228,228,228);
                    .iconfont {
                        font-size: 18px;
                        color: $color-text;
                        padding-right: 14px;
                    }
                    .text {
                        font-size: $font-size-medium-x;
                    }
                    .count {
                        font-size: $font-size-medium;
                        color: $color-text-g;
                    }
                }
            }
        }
        .loading-content {
            position: fixed;
            top: 70%;
            width: 100%;
            transform: translateY(-50%);
        }
    }
}


</style>
