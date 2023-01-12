<template>
  <div class="user">
    <div class="username">
      <h2>用户名：{{ username }}</h2>
    </div>
    <div class="signOut">
      <a href="javascript:0" @click="signOut">退出登录</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import localCache from '../../../utils/cache.js'

let userInfo2 = localCache.getCache("userInfo2");
userInfo2 = userInfo2 === undefined ? undefined : JSON.parse(userInfo2);
let userName = userInfo2.username

const username = ref(userName)

const router = useRouter()

// 退出
const signOut = () => {
  localCache.deleteCache('userInfo2')
  router.replace('/login')
}

</script>

<style lang="less" scoped>
.user {
  position: absolute;
  top: 15rem;
  left: 7.2rem;
}

.signOut {
  margin-top: 1rem;
  text-align: center;
}
</style>