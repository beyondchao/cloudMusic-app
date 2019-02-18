<template>
    <transition name="search">
        <div class="search" ref="searchWrapper">
            <div class="search-box-wrapper">
                <i class="fa fa-angle-left" @click="back"></i>
                <search-box @query="onQueryChange" ref="searchBox"></search-box>
            </div>
            <scroll class="search-scroll-wrapper" ref="scroll" :pullup="pullup" @scrollToEnd="searchMore">
                <div ref="search">
                    <div class="search-hots" v-show="!query">
                        <p class="title">热门搜索</p>
                        <span class="search-hot-item" v-for="item in hots" :key="item.id" @click="addQuery(item.first)">{{item.first}}</span>
                    </div>
                    <div class="shortcut-wrapper" v-show="!query">
                        <div class="search-history" v-show="searchHistory.length">
                            <h1 class="title">
                                <span class="text">搜索历史</span>
                                <span class="clear">
                                    <i class="icon-clear"></i>
                                </span>
                            </h1>
                            <search-list @select="addQuery" @delete="deleteSearchHistory"  :searches="searchHistory"></search-list>
                        </div>
                    </div>
                    <div class="search-result">
                        <suggest @refresh="refresh" :query="query" ref="suggest"></suggest>
                    </div>
                </div>
            </scroll>
        </div>
    </transition>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import SearchBox from 'base/search-box/search-box'
import Confirm from 'base/confirm/confirm'
import SearchList from 'base/search-list/search-list'
import Suggest from 'cpnts/suggest/suggest'
import {getSearchHot} from 'api/search'
import {mapActions, mapGetters} from 'vuex'

export default {
    data () {
        return {
            hots: [],
            query: '',
            pullup: true
        }
    },
    created () {
        this._getSearchHot()
    },
    computed: {
        ...mapGetters([
            'searchHistory'
        ])
    },
    methods: {
        back () {
            this.$router.back()
            this.query = ''
        },
        onQueryChange (query) {
            this.query = query
        },
        _getSearchHot () {
            getSearchHot().then((res) => {
                this.hots = res.data.result.hots
            })
        },
        refresh () {
            setTimeout(() => {
                this.$refs.scroll.refresh()
            },20)
        },
        searchMore () {
            console.log("searchMore")
            this.$refs.suggest.searchMore()
        },
        addQuery (query) {
            this.$refs.searchBox.setQuery(query)
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory',
            'clearSearchHistory'
        ])
    },
    components: {
        Scroll,
        SearchBox,
        Confirm,
        SearchList,
        Suggest
    }
}
</script>

<style lang="scss" scoped>
@import "~common/scss/variable";
@import "~common/scss/mixin";

.search-enter-active, .search-leave-active {
    transition: all 0.3s;
}
.search-enter, .search-leave-to {
    transform: translate3d(50%, 0, 0);
    opacity: 0;
}
.search {
    position: fixed;
    z-index: 100;
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: $color-background;
    .search-box-wrapper {
        padding: 10px 40px 10px 30px;
        background: $color-theme;
        .fa {
            position: absolute;
            left: 5px;
            top: 3px;
            padding: 3px 10px;
            font-size: 30px;
            color: #fff;

        }
    }
    .search-scroll-wrapper {
        height: 100%;
        overflow: hidden;
        .search-hots {
            margin: 0 20px;
            .title {
                padding: 15px 5px 0 5px;
                height: 30px;
                line-height: 30px;
                font-size: $font-size-small-x;
                color: $color-text-g;
            }
            span {
                display: inline-block;
                padding: 3px 5px;
                margin: 4px;
                border: 1px solid $color-text-ggg;
                border-radius: 4px;
                line-height: 20px;
                color: $color-text;
                font-size: $font-size-medium;
            }
        }
        .shortcut-wrapper {
            position: relative;
            margin: 0 auto;
            .search-history {
                position: relative;
                margin: 10px 25px;
                .title {
                    display: flex;
                    align-items: center;
                    height: 30px;
                    font-size: $font-size-small-x;
                    color: $color-text-g;
                    .text {
                        flex: 1;
                    }
                    .clear {
                        @include extend-click();
                        .icon-clear {
                            font-size: $font-size-medium;
                            color: $color-text;
                        }
                    }
                }
            }
        }
    }
}
</style>
