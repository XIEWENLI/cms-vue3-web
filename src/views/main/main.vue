<template>
  <div class="main">
    <router-view></router-view>
    <div>
      <van-tabbar v-model="active">
        <van-tabbar-item icon="photo-o">图片</van-tabbar-item>
        <van-tabbar-item icon="video-o">视频</van-tabbar-item>
        <van-tabbar-item icon="friends-o">用户</van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const active = ref(0);

// 解决刷新active初始化问题
const fullPath = route.fullPath
switch (fullPath) {
  case '/main/photo': active.value = 0
    break;
  case '/main/video': active.value = 1
    break;
  case '/main/user': active.value = 2
    break;
  default: active.value = 0
}

watch(() => active.value, (newV, oldV) => {
  switch (newV) {
    case 0: router.replace('/main/photo')
      break;
    case 1: router.replace('/main/video')
      break;
    case 2: router.replace('/main/user')
      break;
    default: router.replace('/login')
  }
})

</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100%;

}
</style>