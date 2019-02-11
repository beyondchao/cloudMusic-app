<template>
    <div class="tab">
        <router-link tag="div" class="tab-item" to="/recommend">
            <span>推荐</span>
        </router-link>
        <router-link tag="div" class="tab-item" to="/rank">
            <span>排行</span>
        </router-link>
        <router-link tag="div" class="tab-item" to="/singer">
            <span>歌手</span>
        </router-link>
    </div>
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>
@import '~common/scss/variable.scss';

.tab {
    display: flex;
    line-height: 44px;
    height: 44px;
    width: 100%;
    font-size: $font-size-medium;
    background: $color-theme;
    .tab-item {
        flex: 1;
        text-align: center;
        color: $color-text-lm;
        span {
            padding-bottom: 3px;
            font-weight: inherit;
        }
        &.router-link-active {
            font-weight: bold;
            color: $color-text-l;
            border-bottom: 1px solid $color-text-l;
        }
    }
}
</style>
