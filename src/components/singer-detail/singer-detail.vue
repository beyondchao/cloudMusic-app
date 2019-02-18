<template>
    <transition name="slide">
        <div class="music-list">
            <div class="header" ref="header">
                <div class="headerFilter" ref="headerFilter"></div>
                <div class="back" @click="back">
                    <i class="fa fa-angle-left"></i>
                </div>
                <div class="text">{{headerTiTle}}</div>
            </div>
            <scroll class="list"
            :probe-type="probeType"
            @scroll="scroll"
            :listen-scroll="listenScroll"
            ref="list">
                <div class="music-list-wrapper">
                    <div class="bg-image" ref="image" :style="bgStyle">
                        <div class="filter"></div>
                        <div class="text">
                            <h2 class="list-title">{{title}}</h2>
                        </div>
                    </div>
                    <div class="song-list-wrapper">
                        <div class="sequence-play"  v-show="listDetail.length">
                            <i class="iconfont icon-bofangicon"></i>
                            <span class="text">播放全部</span>
                            <span class="count">(共{{listDetail.length}}首)</span>
                        </div>
                        <song-list :songs="listDetail" @select="selectItem"></song-list>
                    </div>
                </div>
                <div v-show="!this.listDetail.length" class="loading-content">
                    <loading></loading>
                </div>
            </scroll>
        </div>
    </transition>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'common/js/config'
import {createSong} from 'common/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import SongList from 'base/song-list/song-list'

const RESERVED_HEIGHT = 44

export default {
    data () {
        return {
            listDetail: [],
            node: null,
            scrollY: 0,
            headerTiTle: '歌手'
        }
    },
    created () {
        //console.log(this.singer)
        this.probeType = 3
        this.listenScroll = true
        if (!this.singer.id) {
            this.$router.push('/singer')
        }
        this._getDetail(this.singer.id)
    },
    mounted () {
        this.imageHeight = this.$refs.image.clientHeight
        this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    },
    computed: {
        headerTitleTouchDown () {
            if (this.singer.aliaName) {
                return `${this.singer.name}(${this.singer.aliaName})`
            } else {
                return this.singer.name
            }
        },
        bgStyle () {
            return `background-image: url(${this.singer.avatar})`
        },
        title () {
            return this.headerTitleTouchDown
        },
        ...mapGetters([
            'singer'
        ])
    },
    methods: {
        back () {
            this.$router.go(-1);
        },
        scroll (pos) {
            this.scrollY = pos.y
        },
        _getDetail (id) {
            if (!id) {
                this.$router.push('/singer')
                return
            }
            getSingerDetail(id).then((res) => {
                if (res.status === ERR_OK) {
                    //console.log(res.data.hotSongs)
                    this.node = res.data.hotSongs
                }
            })
        },
        _normallizeSongs (songs) {
            let ret = []
            songs.forEach((item) => {
                ret.push(createSong(item))
            })
            return ret
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
    components: {
        Scroll,
        Loading,
        SongList
    },
    watch: {
        node (val) {
            this.listDetail = this._normallizeSongs(val)
            //console.log(this.listDetail)
        },
        scrollY (newY) {
            let percent = Math.abs(newY / this.imageHeight)
            if (percent > 1) {
                percent = 1
            }
            if (newY < this.minTranslateY) {
                this.headerTiTle = this.headerTitleTouchDown
            } else {
                this.headerTiTle = "歌手"
            }
            if (newY < 0) {
                this.$refs.headerFilter.style.backgroundImage = `url(${this.singer.avatar})`
                this.$refs.headerFilter.style.filter = `opacity(${percent})  blur(30px)`
            } else {
                this.$refs.header.style.background = 'rgba(212, 68, 57, 0)'
            }
        }
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
    opacity: 0;
    transform: translate3d(30%, 0, 0)
}
.music-list {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1000;
    background: $color-background;
    .header {
        position: fixed;
        width: 100%;
        top: 0;
        z-index: 100;
        height: 44px;
        overflow: hidden;
        .headerFilter {
            position: absolute;
            width: 900%;
            height: 100%;
            background-position: top left;
            background-size: cover;
        }
        .back {
            position:absolute;
            color: #fff;
            left: 4px;
            text-shadow: 1px 1px 1px #000;
            .fa-angle-left {
                padding: 5px 10px;
                font-size: 30px;
            }
        }
        .text {
            position: absolute;
            left: 38px;
            line-height: 44px;
            font-size: $font-size-medium-x;
            color: #fff;
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
                padding-top: 75%;
                transform-origin: top;
                background-size: cover;
                background-position: 0 30%;
                .filter {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    width: 100%;
                    background: #000;
                    opacity: 0.2;
                }
                .text {
                    position: absolute;
                    width: 80%;
                    .list-title {
                        position: absolute;
                        bottom: 40px;
                        left: 20px;
                        font-weight: bold;
                        font-style: italic;
                        font-size: $font-size-large-s;
                        letter-spacing: 2px;
                        color: #fff;
                    }
                }
            }
            .song-list-wrapper {
                padding: 40px 0 20px 0;
                width: 100%;
                position: relative;
                top: 0;
                background: $color-background;
                .sequence-play {
                    position: absolute;
                    border-radius: 10px;
                    background: inherit;
                    width: 100%;
                    top: -10px;
                    display: flex;
                    align-items: center;
                    height: 40px;
                    border-bottom: 1px solid rgb(228, 228, 228);
                    .iconfont {
                        padding-left: 16px;
                    }
                    .text {
                        padding-left: 14px;
                        font-size: $font-size-medium-x;
                    }
                    .count {
                        font-size: $font-size-medium;
                        color: $color-text-g;
                    }
                }

            }
        }
    }
}
</style>
