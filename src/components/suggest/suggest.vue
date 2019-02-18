<template>
    <div class="suggest">
        <div class="search-suggest" v-show="searchShow && query">
            <p class="title">最佳匹配</p>
            <div @click="selectItem(suggest.artists[0])" class="search-suggest-item" v-if="suggest.artists" >
                <img v-lazy="suggest.artists[0].img1v1Url" width="50" height="50" />
                <span class="text">歌手:{{suggest.artists[0].name}}</span>
            </div>
            <div @click="selectList(suggest.playlists[0])" class="search-suggest-item" v-if="suggest.artists">
                <img v-lazy="suggest.playlists[0].coverImgUrl" width="50" height="50"/>
                <div class="text">
                    <p>
                        专辑:
                        <span class="text">{{suggest.playlists[0].name}}</span>
                    </p>
                    <p class="singer">{{suggest.albums[0].artist.name}}</p>
                </div>
            </div>
        </div>
        <ul class="suggest-list" ref="suggestList" v-if="searchShow">
            <li @click="selectSong(item)" class="suggest-item" v-for="(item, index) in songs" :key="index">
                <div class="icon"><i></i></div>
                <div class="name">
                    <p class="song">{{item.name}}</p>
                    <p class="singer">{{item.singer}}</p>
                </div>
            </li>
            <loading v-show="haveMore && query"></loading>
        </ul>
        <div class="no-result-wrapper" v-show="!haveMore && !songs.length && query">
            很抱歉，暂无搜索结果
        </div>
    </div>
</template>

<script>
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import {getSearchSongs, getSearchSuggest, getSongDetail} from 'api/search'
import {createSearchSong} from 'common/js/song'
import {mapMutations, mapActions} from 'vuex'

export default {
    props: {
        query: {
            type:String,
            default: ''
        }
    },
    data () {
        return {
            suggest: {},
            page: 0,
            haveMore: true,
            searchShow: false,
            songs: []
        }
    },
    methods: {
        searchMore () {
            console.log('searchMore')
            if (!this.haveMore) {
                return 
            }
            if (!this.songs.length) {
                return
            }
            getSearchSongs(this.query, this.page).then((res) => {
                if (!res.data.result.songs) {
                    this.haveMore = false
                    return
                }
                let list = res.data.result.songs
                let ret = []
                list.forEach((item) => {
                    ret.push(createSearchSong(item))
                })
                this.songs = this.songs.concat(ret)
                //console.log(this.songs)
                this.$emit('refresh')
            })
            this.page += 30
            getSearchSuggest(this.query).then((res) => {
                this.suggest = res.data.result
            })
        },
        search () {
            this.searchShow = true
            this.haveMore = true
            getSearchSongs(this.query, this.page).then((res) => {
                if (!res.data.result.songs) {
                    this.haveMore = false
                    return
                }
                let list = res.data.result.songs
                let ret = []
                list.forEach((item) => {
                    ret.push(createSearchSong(item))
                })
                this.songs = ret
                console.log(this.songs)
                this.$emit('refresh')
            })
            this.page += 30
            getSearchSuggest(this.query).then((res) => {
                this.suggest = res.data.result
                //console.log(this.suggest)
            })
            console.log(this.query)
            //console.log(this.songs)
            //console.log(this.suggest)
        },
        selectItem (item) {
            const singer = new Singer({
                id: item.id,
                name: item.name,
                avatar: item.img1v1Url
            })
            this.$router.push(`/singer/${singer.id}`)
            this.setSinger(singer)
            this.$emit('select')
        },
        selectList (item) {
            const list = {}
            list.name = item.name
            list.id = item.id
            list.picUrl = item.coverImgUrl
            list.playCount = item.playCount
            this.$router.push({
                path: `/recommend/${list.id}`
            })
            this.setMusicList(list)
            this.$emit('select')
        },
        selectSong (item) {
            getSongDetail(item.id).then((res) => {
                item.image = res.data.songs[0].al.picUrl
                this.insertSong(item)
            })
            this.$emit('select')
        },
        ...mapMutations({
            setSinger: 'SET_SINGER',
            setMusicList: 'SET_MUSIC_LIST'
        }),
        ...mapActions([
            'insertSong'
        ])
    },
    watch: {
        query (val) {
            if (val === '') {
                this.suggest = {}
                this.haveMore = false
                this.songs = []
                return
            }
            this.suggest = {}
            this.songs = []
            this.searchShow = true
            this.page = 0
            this.haveMore = true
            this.search()
        }
    },
    components: {
        Loading
    }
}
</script>

<style lang="scss" scoped>
@import "~common/scss/variable";
@import "~common/scss/mixin";

.suggest {
    height: 100%;
    overflow: hidden;
    padding-top: 14px;
    .search-go {
        font-size: $font-size-medium;
        margin-left: 20px;
        color: $color-theme;
    }
    .search-suggest {
        .title {
            padding-left: 20px;
            padding-bottom: 10px;
            color: $color-theme;
            font-size: 11px;
        }
        .search-suggest-item {
            display: flex;
            align-items: center;
            padding: 8px 20px;
            border-bottom: 1px solid rgb(228, 228, 228);
            font-size: $font-size-medium;
            img {
                flex: 0 0 50px;
                padding-right: 15px;
            }
            .text {
                width: 100%;
                p {
                    padding: 3px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    .text {
                        color: #0099f6;
                    }
                }
                .singer {
                    font-size: 10px;
                    color: $color-text;
                    opacity: 0.5;
                }
            }
        }
    }
    .suggest-list {
        padding-bottom: 30px;
        .suggest-item {
            display: flex;
            padding: 3px 20px;
            height: 50px;
            align-items: center;
            border-bottom: 1px solid rgb(228, 228, 228);
            p {
                padding: 3px 0;
            }
            .song {
                font-size: $font-size-medium;
                color: $color-text;
                @include no-wrap();
            }
            .singer {
                font-size: 10px;
                color: $color-text-g;
                opacity: 0.6;
                @include no-wrap();
            }
        }
        .icon {
            [class^="icon-"] {
                font-size: 14px;
                color: $color-text;
            }
        }
    }
}
</style>
