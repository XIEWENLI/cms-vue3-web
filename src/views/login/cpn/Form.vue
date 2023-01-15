<template>
  <div class="form">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="username" name="用户名" label="用户名" placeholder="用户名"
          :rules="[{ required: true, message: '请填写用户名' }]" />
        <van-field v-model="password" type="password" name="密码" label="密码" placeholder="密码"
          :rules="[{ required: true, message: '请填写密码' }]" />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          登录
        </van-button>
      </div>
    </van-form>

    <div class="jump">
      <a href="javascript:0" @click="registerVue">注册界面</a>
      <a href="javascript:0" style="margin-left: 20px;" @click="mainVue">首页界面</a>
    </div>
  </div>
</template>

<script  setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import XWLRequest from '../../../servise/index'
import localCache from '../../../utils/cache'
import { showNotify } from 'vant'
import 'vant/es/notify/style'

const router = useRouter()

// 注册
const username = ref('');
const password = ref('');
const onSubmit = async () => {
  username.value.trim()
  password.value.trim()

  if (username.value.length < 5 || username.value.length > 10 || password.value.length < 5 || password.value.length > 10) {
    showNotify('用户名和密码的长度为5-10~');
  } else {
    const rl = /^[\da-z]+$/i
    if (rl.test(username.value)) {
      showNotify('用户名由字母或数字组成');
      return
    }
    const res = await XWLRequest.post({ url: "/user/login2", data: { username: username.value, password: password.value } })

    if (!res.data.status) {
      showNotify(res.data);
    } else {
      showNotify({ type: 'success', message: "登陆成功~" });
      localCache.setCache('userInfo2', JSON.stringify(res.data))

      username.value = ''
      password.value = ''
      router.replace('/main')
    }
  }
};

// 跳转注册页面
const registerVue = () => {
  router.replace('/register')
}

// 在跳转首页
let userInfo2 = localCache.getCache("userInfo2");
userInfo2 = userInfo2 === undefined ? undefined : JSON.parse(userInfo2);
const mainVue = () => {
  if (userInfo2 === undefined) {
    showNotify('请先登录~');
  } else {
    router.replace('/main')
  }
}

</script>

<style lang="less" scoped>
.form {
  width: 100%;
  height: 100%;
}

.form .jump {
  margin-left: 30%;
}
</style>