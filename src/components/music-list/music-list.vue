<template>
    <transition name="slide" mode="out-in">
        <div class="music-list">
            <div class="header" ref="header">
                <div class="headerFilter"  ref="headerFilter"></div>
                <div class="back" @click="back">
                    <i class="fa fa-angle-left"></i>
                </div>
                <div class="text">
                    <h1 class="title">{{headerTitle}}</h1>
                </div>
            </div>
            <scroll class="list"
            :probe-type="probeType"
            :listen-scroll="listenScroll"
            @scroll="scroll"
            :data="listDetail"
             ref="list">
                <div class="music-list-wrapper">
                    <div class="bg-image" :style="bgStyle" ref="bgImage">
                        <div class="filter"></div>
                        <div class="text">
                            <h2 class="list-title">{{title}}</h2>
                            <p class="play-count" v-if="playCount">
                                <i class="fa fa-headphones"></i>
                                {{playCount}}
                            </p>
                        </div>
                    </div>
                    <div class="song-list-wrapper">
                        <div class="sequence-play" v-show="listDetail.length">
                            <i class="iconfont icon-bofangicon"></i>
                            <span class="text">播放全部</span>
                            <span class="count">(共{{listDetail.length}}首)</span>
                        </div>
                        <song-list :songs="listDetail" @select="selectItem"></song-list>
                    </div>
                </div>
                <div class="loading-content" v-show="!listDetail.length">
                    <loading></loading>
                </div>
            </scroll>
        </div>
    </transition>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import {getRecommendListDetail} from 'api/recommend'
import {ERR_OK} from 'common/js/config'
import {mapGetters, mapActions} from 'vuex'
import SongList from 'base/song-list/song-list'
import {createRecommendListSong} from 'common/js/song'
import Loading from 'base/loading/loading'

const RESERVED_HEIGHT = 40

export default {
    data () {
        return {
            listDetail: [],
            scrollY: 0,
            headerTitle: '歌单'
        }
    },
    created () {
        //console.log(this.musicList)
        this._getRecommendListDetail(this.musicList.id);
        this.probeType = 3
        this.listenScroll = true
    },
    mounted () {
        this.imageHeight = this.$refs.bgImage.clientHeight
        this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    },
    computed: {
        playCount () {
            if (!this.musicList.playCount) {
                return
            }
            if (this.musicList.playCount < 1e5) {
                return Math.floor(this.musicList.playCount)
            } else {
                return Math.floor(this.musicList.playCount / 10000) + "万"
            }
        },
        title () {
            return this.musicList.name
        },
        bgStyle () {
            return `background-image: url(${this.musicList.picUrl})`
        },
        ...mapGetters([
            'musicList',
            'playlist',
            'currentSong',
            'fullScreen'
        ])
    },
    methods: {
        back () {
            this.$router.go(-1)
        },
        scroll (pos) {
            this.scrollY = pos.y
        },
        selectItem (item, index) {
            this.selectPlay({
                list: this.listDetail,
                index: index
            })
           // console.log(this.playlist)
            console.log(this.currentSong)
            //console.log(this.fullScreen)
        },
        _getRecommendListDetail (id) {
            if (!id) {
                this.$router.push('/recommend')
                return
            }
            getRecommendListDetail(id).then((res) => {
                if (res.status === ERR_OK) {
                    //console.log(res.data.playlist.tracks)
                    this.listDetail = res.data.playlist.tracks.map((item) => {
                        return createRecommendListSong(item)
                    })
                    // console.log(this.listDetail)
                } else {
                    console.error('getRecommendlistDetail 失败')
                }
            })
        },
        ...mapActions([
            'selectPlay'
        ])
    },
    watch: {
        scrollY (newY) {
            let percent = Math.abs(newY / this.imageHeight)
            if (percent > 1) {
                percent = 1
            }
            if (newY < this.minTranslateY + RESERVED_HEIGHT - 20) {
                this.headerTitle = this.title
            } else {
                this.headerTitle = "歌单"
            }
            if (newY < 0) {
                this.$refs.headerFilter.style.backgroundImage = `url(${this.musicList.picUrl})`
                this.$refs.headerFilter.style.filter = `opacity(${percent})  blur(12px)`
            } else {
                this.$refs.header.style.background =   'rgba(212, 57, 68, 0)'
            }
        }
    },
    components: {
        Scroll,
        SongList,
        Loading
    },
    
}
</script>

<style lang="scss" scoped>
@import "~common/scss/variable";
@import "~common/scss/mixin";

.slide-enter-active, .slide-leave-active {
    transition: all 0.2s
}
.slide-enter, .slide-leave-to {
    transform: translate3d(30%, 0, 0);
    opacity: 0;
}

.music-list {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 1000;
    left: 0;
    right: 0;
    background: $color-background;
    .header {
        position: fixed;
        height: 44px;
        top: 0;
        width: 100%;
        color: #fff;
        z-index: 100;
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
            top: 0;
            left: 4px;
            text-shadow: 1px 1px 1px #000;
            .fa-angle-left {
                padding: 5px 10px;
                font-size: 30px;
            }
        }
        .text {
            position: absolute;
            left: 36px;
            line-height: 44px;
            font-size: $font-size-medium-x;
            text-shadow: 1px 1px 1px #000;
            @include no-wrap();    
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
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                    opacity: 0.2;
                }
                .text {
                    position: absolute;
                    width: 88%;
                    height: 40px;
                    bottom:50px;
                    left:15px;
                    color: #fff;
                    .play-count {
                        position: absolute;
                        bottom: -15px;
                        font-size: $font-size-small;
                    }
                    .list-title {
                        position: absolute;
                        bottom: 0;
                        font-size: $font-size-medium-x;
                        line-height: 18px;
                        font-weight: bold;
                        letter-spacing: 1px;
                    }
                }
            }
            .song-list-wrapper {
                padding: 41px 0 20px 0;
                border-radius: 10px;
                position: relative;
                top: -20px;
                background: $color-background;
                .sequence-play {
                    position: absolute;
                    top: 0;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 40px;
                    padding-left: 16px;
                    border-bottom: 1px solid rgb(228, 228, 228);
                    .iconfont {
                        font-size: 18px;
                        color: $color-text;
                        padding-right: 24px;
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
            width: 100%;
            top: 70%;
            transform: translateY(-50%)
        }
    }
}
</style>
