<template>
    <div class="player" v-if="playlist.length > 0">
        <transition name="normal">
            <div class="normal-play" v-if="fullScreen">
                <div class="background">
                    <div class="filter"></div>
                    <img :src="currentSong.image" width="100%" height="100%" />
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="fa fa-arrow-left"></i>
                    </div>
                    <h1 class="title">{{currentSong.name}}</h1>
                    <h2 class="subTitle">{{currentSong.singer}}</h2>
                </div>
                <div class="middle" @click="changeMiddle">
                    <transition name="middleL">
                        <div class="middle-l" v-show="currentShow === 'cd'">
                            <div class="cd-wrapper">
                                <div class="cd" :class="cdCls">
                                    <img class="image" v-lazy="currentSong.image" />
                                </div>
                                <div class="metalBar">
                                    <!-- <img class="image" :src="metalBar" /> -->
                                </div>
                            </div>
                        </div>
                    </transition>
                    <transition class="middleR">
                        <scroll :probe-type="3" class="middle-r" ref="lyricList"  v-show="currentShow === 'lyric'">
                            <div class="lyric-wrapper">
                                <div class="currentLyric" v-if="currentLyric">
                                    <p ref="lyricLine" class="text" :class="{'current': currentLineNum === index}"
                                    v-for="(line, index) in currentLyric.lines" :key="line.key">
                                        {{line.txt}}
                                    </p>
                                </div>
                                <p class="no-lyric" v-if="currentLyric === null">纯音乐，请欣赏</p>
                            </div>
                        </scroll>
                    </transition>
                </div>
                <div class="bottom">
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :percent="percent" @percentChange="percentChange" @percentChangeEnd="percentChangeEnd"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left" >
                        <i class="iconfont mode" :class="iconMode" @click="changeMode"></i>
                        </div>
                        <div class="icon i-left" >
                        <i class="iconfont icon-prev" @click="prev"></i>
                        </div>
                        <div class="icon i-center" >
                        <i class="fa" @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" >
                        <i class="iconfont icon-test" @click="next"></i>
                        </div>
                        <div class="icon i-right">
                        <i class="iconfont"  @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen">
                <div class="icon" @click.stop="getFullScreen">
                    <img :class="cdCls" :src="currentSong.image" width="40" height="40" />
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <div class="desc" v-html="currentSong.singer"></div>
                </div>
                <div class="control" @click.stop="togglePlaying">
                    <progress-circle :radius="radius" :percent="percent">
                        <i class="fa" :class="miniIcon"></i>
                    </progress-circle>
                </div>
                <div class="control">
                    <i class="iconfont icon-caidan1"></i>
                </div>
            </div>
        </transition>

        <audio id="music-audio" ref="audio" @canplay="ready"  @ended="end" autoplay @timeupdate="updateTime"></audio>
    </div>
</template>

<script>
import ProgressCircle from 'base/progress-circle/progress-circle'
import ProgressBar from 'base/progress-bar/progress-bar'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'

import {mapGetters, mapMutations, mapActions} from 'vuex'
import {getSong, getLyric} from 'api/song'
import {playMode, ERR_OK} from 'common/js/config'
import {shuffle} from 'common/js/utl'

export default {
    data () {
        return {
            url: '',
            currentShow: 'cd',
            songReady: false,
            currentLyric: null,
            currentLineNum: 0,
            duration: 0,
            percent: 0,
            currentTime: 0,
            radius: 32
        }
    },
    computed: {
        iconMode () {
            if (this.mode === playMode.sequence) {
                return 'icon-next'
            } else if (this.mode === playMode.loop) {
                return 'icon-loop'
            } else {
                return 'icon-random'
            }
        },
        miniIcon () {
            return this.playing ? 'fa-pause' : 'fa-play'
        },
        cdCls () {
            return this.playing? 'play' : 'play pause'
        },
        metalBar () {
            return '../../common/image/bar.jpg'
        },
        playIcon () {
            return this.playing ? 'fa-pause-circle-o' : 'fa-play-circle-o'
        },
        ...mapGetters([
            'playlist',
            'fullScreen',
            'currentSong',
            'playing',
            'currentIndex',
            'mode',
            'sequenceList',
            'favoriteList'
        ])
    },
    create () {
        this.move = false
    },
    mounted () {
        
    },
    watch: {
        currentSong (newVal, oldVal) {
            if (!newVal.id) {
                return
            }
            if (newVal.id === oldVal.id) {
                return
            }
            //this.$refs.audio.pause()
            //this.$refs.audio.currentTime = 0
            this._getSong(newVal.id)
        },
        url (newVal) {
            this._getLyric(this.currentSong.id)
            this.$refs.audio.src = newVal
            let stop = setInterval(() => {
                this.duration = this.$refs.audio.duration
                if (this.duration) {
                    clearInterval(stop)
                }
            },150)
            this.setPlayingState(true)
        },
        currentTime () {
            this.percent = this.currentTime / this.duration
        }
    },
    methods: {
        _getSong (id) {
            getSong(id).then((res) => {
                this.url = res.data.data[0].url
            })
        },
        back () {
            this.setFullScreen(false)
        },
        _getLyric (id) {
            if (this.currentLyric) {
                this.currentLyric = null
            }
            getLyric(id).then((res) => {
                if (res.status === ERR_OK) {
                    console.log(res.data)
                    if (!res.data.nolyric) {
                        this.currentLyric = new Lyric(res.data.lrc.lyric, this.handleLyric)
                    }
                }
            })
        },
        handleLyric ({lineNum, txt}) {
            this.currentLineNum = lineNum
            if (lineNum > 5) {
                let lineEl = this.$refs.lyricLine[lineNum - 5]
                this.$refs.lyricList.scrollToElement(lineEl, 1000)
            } else {
                if (this.$refs.lyricList) {
                    this.$refs.lyricList.scrollTo(0, 0, 1000)
                }
            }

        },
        changeMiddle () {
            if (this.currentShow === 'cd') {
                this.currentShow = 'lyric'
            } else {
                this.currentShow = 'cd'
            }
            console.log(this.currentShow)
        },
        format (interval) {
            interval = interval | 0
            let minute = interval / 60 | 0
            if (minute < 10) {
                minute = '0' + minute
            }
            let second = interval % 60
            if (second < 10) {
                second = '0' + second
            }
            return minute + ':' + second
        },
        percentChange (percent) {
            this.move = true
            const currentTime = this.duration * percent
            this.currentTime = currentTime
            if (this.currentLyric) {
                this.currentLyric.seek(currentTime * 1000)
            }
        },
        percentChangeEnd (percent) {
            this.move = false
            const currentTime = this.duration * percent
            this.$refs.audio.currentTime = currentTime
            if (this.currentLyric) {
                this.currentLyric.seek(currentTime * 1000)
            }
        },
        updateTime (e) {
            if (this.move) {
                return
            }
            this.currentTime = e.target.currentTime
        },
        getFavoriteIcon (song) {
            if (this.isFavorite(song)) {
                return 'icon-like'
            }
            return 'icon-dislike'
        },
        toggleFavorite (song) {
            if (this.isFavorite(song)) {
                this.deleteFavoriteList(song)
            } else {
                this.saveFavoriteList(song)
            }
        },
        isFavorite (song) {
            const index = this.favoriteList.findIndex((item) => {
                return item.id === song.id
            })
            return index > -1
        },
        changeMode () {
            const mode = (this.mode + 1) % 3
            this.setPlayMode(mode)
            let list = null
            if (mode === playMode.random) {
                list = shuffle(this.sequenceList)
            } else {
                list = this.sequenceList
            }
            this._resetCurrentIndex(list)
            this.setPlaylist(list)
        },
        _resetCurrentIndex (list) {
            let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
            })
            this.setCurrentIndex(index)
        },
        end () {
            if (this.mode === playMode.loop) {
                this.loop()
            } else {
                this.next()
            }
        },
        loop () {
            this.$refs.audio.currentTime = 0
            this.$refs.audio.play()
            if (this.currentLyric) {
                this.currentLyric.seek()
            }
        },
        ready () {
            this.songReady = true
            this.savePlayHistory(this.currentSong)
        },
        next () {
            if (!this.songReady) {
                return
            }
            if (this.playlist.length === 1) {
                this.loop()
                return
            } else {
                let index = this.currentIndex + 1
                if (index === this.playlist.length) {
                    index = 0
                }
                this.setCurrentIndex(index)
                // this.$refs.audio.play()
                if (!this.playing) {
                    this.togglePlaying()
                }
            }
            this.songReady = false
        },
        prev () {
            if (!this.songReady) {
                return
            }
            this.songReady = false
            let index = this.currentIndex - 1
            if (index === -1) {
                index = this.playlist.length - 1
            }
            this.setCurrentIndex(index)
            if (!this.playing) {
                this.togglePlaying()
            }
            this.songReady = false
        },
        togglePlaying () {
            const audio = this.$refs.audio
            this.setPlayingState(!this.playing)
            this.playing ? audio.play() : audio.pause()
            if (this.currentLyric) {
                this.currentLyric.togglePlay()
            }
        },
        getFullScreen () {
            this.setFullScreen(true)
        },
        ...mapMutations({
            setFullScreen: 'SET_FULL_SCREEN',
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayMode: 'SET_PLAY_MODE',
            setPlaylist: 'SET_PLAYLIST'
        }),
        ...mapActions([
            'saveFavoriteList',
            'deleteFavoriteList',
            'savePlayHistory'
        ])
    },
    components: {
        Scroll,
        ProgressBar,
        ProgressCircle
    }

}
</script>

<style lang="scss">
@import '~common/scss/variable';
@import '~common/scss/mixin';

.player {
    .normal-play {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 150;
        background: $color-background;
        .background {
            position: absolute;
            left: -50%;
            top: -50%;
            width: 250%;
            height: 200%;
            z-index: -1;
            filter: blur(60px);
            .filter {
                position: absolute;
                width: 100%;
                height: 100%;
                opacity: 0.43;
                background: rgb(46, 41, 41);
                &.filterR-enter-active, &.filter-leave-active {
                    transition: all 0.3s
                }
                &.filterR-leave-to, &.filterR-enter {
                    opacity: 0
                }
                &.filterR-leave {
                    opacity: 0.4
                }
            }
        }
        .top {
            position: relative;
            margin-bottom: 25px;
            border-bottom: 1px solid transparent;
            border-image: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0)) 1;
            .back {
                position: absolute;
                top: 6px;
                left: 6px;
                z-index: 50;
                .fa-arrow-left {
                    display: block;
                    padding: 5px 9px;
                    font-size: 20px;
                    color: $color-text-l;
                }
            }
            .title {
                width: 70%;
                margin: 0 auto;
                padding-top: 10px;
                line-height: 20px;
                text-align: left;
                @include no-wrap();
                font-size: $font-size-large-s;
                font-weight: 400;
                color: $color-text-l;
            }
            .subTitle {
                @extend .title;
                font-size: $font-size-small-x;
                font-weight: normal;
                padding-top: 0;
                opacity: 0.6;
                letter-spacing: 1px;
            }
        }
        .middle {
            display: flex;
            align-items: center;
            position: fixed;
            width: 100%;
            top: 80px;
            bottom: 170px;
            white-space: nowrap;
            font-size: 0;
            .middle-l {
                display: inline-block;
                vertical-align: top;
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 80%;
                &.middleL-enter-active {
                    transition: all 0.3s
                }
                &.middleL-enter, .middleL-leave-to {
                    opacity: 0
                }
                .cd-wrapper {
                    position: absolute;
                    left: 10%;
                    top: 0;
                    width: 80%;
                    height: 100%;
                    overflow: hidden;
                    .cd {
                        width: 100%;
                        height: 100%;
                        box-sizing: border-box;
                        border: 55px solid transparent;
                        position: relative;
                        z-index: 1;
                        &.play {
                            animation: rotate 20s linear infinite;
                        }
                        &.pause {
                            animation-play-state: paused;
                        }
                    }
                    .cd::after {
                        content: "";
                        height: 150%;
                        width: 150%;
                        position: absolute;
                        top: -48px;
                        right:-48px;
                        z-index: -1;
                        background: linear-gradient(to right, rgba(0,0,0,1), rgba(0, 0, 0,0.2), rgba(0,0,0,1));
                        border-radius: 50% !important;
                        box-shadow: 0 0 1px 6px rgba(255, 255, 255, 0.2);
                    }
                    .image {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                    }
                }
            }
            .middle-r {
                display: inline-block;
                position: absolute;
                top: 0;
                vertical-align: top;
                width: 100%;
                height: 100%;
                overflow: hidden;
                &.middleR-enter-active, &.middleR-leave-active {
                    transition: all 0.3s;
                }
                &.middleR-enter, &.middle-leave-to {
                    opacity: 0;
                }
                .lyric-wrapper {
                    width: 80%;
                    margin: 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .text {
                        line-height: 40px;
                        color: $color-text-gg;
                        font-size: $font-size-medium-x;
                        &.current {
                            color: #fff;
                        }
                    }
                    .no-lyric {
                        line-height: 40px;
                        color: $color-text-ggg;
                        margin-top: 160px;
                        font-size: $font-size-large-s;
                    }
                }
            }
        }
        .bottom {
            position: absolute;
            width: 100%;
            bottom: 50px;
            .progress-wrapper {
                display: flex;
                align-items: center;
                width: 80%;
                margin: 0 auto;
                padding: 10px 0;
                .time {
                    color: $color-text-l;
                    font-size: $font-size-small;
                    flex: 0 0 3px;
                    &.time-l {
                        text-align: left;
                        padding-right: 5px;
                    }
                    &.time-r {
                        text-align: right;
                        color: $color-text-gg;
                        padding-left: 5px;
                    }
                }
                .progress-bar-wrapper {
                    flex: 1;
                    
                }
            }
            .operators {
                display: flex;
                align-items: center;
                .icon {
                flex: 1;
                color: $color-theme-l;
                &.disable {
                    color: $color-theme;
                }
                i {
                    font-size: 30px;
                }
                .mode {
                    font-size: 25px;
                }
                &.i-left {
                    text-align: right;
                }
                &.i-center {
                    padding: 0 20px;
                    text-align: center;
                    i {
                    font-size: 40px;
                    }
                }
                &.i-right {
                    text-align: left;
                }
                .icon-like {
                    color: $color-sub-theme;
                }
                }
            }
        }
    }
    .mini-player {
        display: flex;
        align-items: center;
        position: fixed;
        left: 0;
        bottom: 0;
        z-index: 100;
        width: 100%;
        height: 60px;
        background: #fff;
        &.mini-enter-active, &mini-leave-active {
            transition: all 0.3s;
        }
        &.mini-enter, &.mini-leave-to {
            opacity: 0;
        }
        .icon {
            flex: 0 0 40px;
            width: 40px;
            padding: 0 10px 0 20px;
            img {
                border-radius: 50%;
                &.play {
                    animation: rotate 10s linear infinite;
                }
                &.pause {
                    animation-play-state: paused;
                }
            }
        }
        .text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            overflow: hidden;
            .name {
                margin-bottom: 2px;
                line-height: 14px;
                @include no-wrap();
                font-size: $font-size-medium;
                color: $color-text;
            }
            .desc {
                font-size: $font-size-small;
                color: $color-text;
            }
        }
        .control {
            flex: 0 0 30px;
            width: 30px;
            padding: 0 10px;
            .icon-play-mini, icon-pause-mini, .icon-playlist, .iconfont {
                font-size: 30px;
                color: $color-theme-d;
            }
            .iconfont {
                position: relative;
                left: -5px;
                top: -5px;
            }
            .fa-play {
                color: $color-theme-d;
                font-size: 14px;
                position: absolute;
                left: 12px;
                top: 8.5px;
            }
            .fa-pause {
                color: $color-theme-d;
                font-size: 12px;
                position: absolute;
                left: 11px;
                top: 10px;
            }
        }
    }
}
@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
