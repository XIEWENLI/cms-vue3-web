<template>
  <div class="form">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="username" name="用户名" label="用户名" placeholder="用户名"
          :rules="[{ required: true, message: '请填写用户名' }]" />
        <van-field v-model="password" type="password" name="密码" label="密码" placeholder="密码"
          :rules="[{ required: true, message: '请填写密码' }]" />
        <van-field v-model="password2" type="password" name="重复密码" label="重复密码" placeholder="重复密码"
          :rules="[{ required: true, message: '请填写重复密码' }]" />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          注册
        </van-button>
      </div>
    </van-form>

    <div class="jump">
      <a href="javascript:0" @click="loginVue">登录界面</a>
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
const password2 = ref('');
const onSubmit = async () => {
  username.value.trim()
  password.value.trim()
  password2.value.trim()

  if (username.value.length < 5 || username.value.length > 10 || password.value.length < 5 || password.value.length > 10 || password2.value.length < 5 || password2.value.length > 10) {
    showNotify('用户名和密码的长度为5-10~');
  } else if (password.value !== password2.value) {
    showNotify('密码和重复密码不一致~');
  } else {
    const res = await XWLRequest.post({ url: "/user/register2", data: { username: username.value, password: password.value } })

    if (!res.data.status) {
      showNotify(res.data.message);
    } else {
      showNotify({ type: 'success', message: res.data.message });
      username.value = ''
      password.value = ''
      password2.value = ''
      router.replace('/login')
    }
  }
};

// 跳转登录页面
const loginVue = () => {
  router.replace('/login')
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