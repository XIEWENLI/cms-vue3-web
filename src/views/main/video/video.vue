<template>
  <div class="video">
    <van-empty description="数据为空~" v-if="fileInfo.length <= 0" />
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <div class="content" v-if="!loading">
        <ul v-for="item in fileInfo" :key="item.id">
          <li>
            <div>
              <video width="160" height="120" :src="item.src" @click="showPopup(item.src)" />
            </div>
            <div style="display: flex;justify-content: space-between;margin-top: 0.2rem;">
              <van-button type="default" size="small" @click="downloadFile(item)">下载</van-button>
              <van-button type="warning" size="small" @click="deleteFile(item)">删除</van-button>
            </div>
          </li>
        </ul>
      </div>

      <!-- 分页 -->
      <div v-if="fileInfo.length > 0">
        <van-pagination class="fy" v-if="!loading" @change="changPage" v-model="currentPage" :total-items="sum"
          :items-per-page="10" />
      </div>

      <!-- file展示弹窗 -->
      <van-popup v-model:show="showCenter">
        <video style="width: 21rem" :src="imageSrc" controls="controls">
          <source :src="imageSrc" type="video/mp4">
          您的浏览器不支持 HTML5 video 标签。
        </video>
      </van-popup>

      <!-- file展示弹窗2——上传页面 -->
      <van-popup v-model:show="showCenter2">
        <Uplaod :accept="accept" @againRequest="againRequest" />
      </van-popup>
    </van-pull-refresh>

    <!-- 上传按钮 -->
    <van-action-bar class="upload" v-if="!loading">
      <van-action-bar-button type="danger" text="上传" @click="showPopup2" />
    </van-action-bar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import XWLRequest from '../../../servise/index.js'
import localCache from '../../../utils/cache.js'
import { baseURL } from '../../../constant/index'
import Uplaod from '../../../components/Upload.vue'
import { showNotify } from 'vant'
import 'vant/es/notify/style'

let userInfo2 = localCache.getCache("userInfo2");
userInfo2 = userInfo2 === undefined ? undefined : JSON.parse(userInfo2);
let user_id = userInfo2.id
let userName = userInfo2.username
let token = userInfo2.token

const accept = ref('.mp4')

// 弹窗
const imageSrc = ref()
const showCenter = ref(false);
const showPopup = (src) => {
  imageSrc.value = src
  showCenter.value = true;
};

// 弹窗2
const imageSrc2 = ref()
const showCenter2 = ref(false);
const showPopup2 = (src) => {
  imageSrc2.value = src
  showCenter2.value = true;
};

// 获取总数量
const geuSum = async () => {
  const res = await XWLRequest.get({ url: '/file/getFileInfo', params: { type: 'video', tableName: 'file', web: 1, isUser: 'user' } })

  if (!res.data.status) {
    showNotify(res.data.message);
  }

  sum.value = res.data.message.length
}
geuSum()

// 获取用户文件信息
let fileInfo = ref([])
const getFileInfo = async (limit = 10, offset = 0) => {
  fileInfo.value = []
  const res = await XWLRequest.get({ url: '/file/getFileInfo', params: { type: 'video', limit, offset, web: 1, isUser: 'user' } })

  if (!res.data.status) {
    showNotify(res.data.message);
    return
  }

  // 筛选出符合当前用户的file 
  res.data.message.forEach(item => {
    if (item.user_id === user_id) {
      item.src = `${baseURL}/file/downloadFile?file_id=${item.id}&token=${token}&isUser='user'`
      fileInfo.value.push(item)
    }
  });

}
getFileInfo()

// 分页
const currentPage = ref(1);
const sum = ref(1)
const changPage = (page) => {
  fileInfo.value = []
  getFileInfo(10, (page - 1) * 10)
}

// 下拉刷新
const loading = ref(false);
const onRefresh = () => {
  setTimeout(() => {
    showNotify({ type: 'success', message: '刷新成功~' });
    fileInfo.value = []
    getFileInfo(10, (currentPage.value - 1) * 10)
    loading.value = false;
  }, 1000);
};

// 下载文件
const downloadFile = async ({ id: file_id, fileName, type, user_id }) => {
  let fn = fileName + "." + type.split('/')[1]

  const a = document.createElement('a')
  a.download = 'xiazai'
  a.href = `${baseURL}/file/downloadFile?file_id=${file_id}&user_id=${user_id}&fileName=${fn}&token=${token}&isUser= 'user'`
  a.click();
}
// 删除文件
const deleteFile = async ({ id: file_id }) => {
  let url = 'upload/uploadVideo/videos'

  const res = await XWLRequest.get({ url: "/file/deleteFile", params: { file_id, userName, url, isUser: 'user' } })

  if (!res.data.status) {
    showNotify(res.data.message);
  } else {
    getFileInfo(10, (currentPage.value - 1) * 10)
    showNotify({ type: 'success', message: res.data.message });
  }
}

// 上传后刷新页面
const againRequest = () => {
  getFileInfo(10, (currentPage.value - 1) * 10)
  showCenter2.value = false
}


</script>

<style lang="less" scoped>
.video {
  width: 100%;
  height: 100%;
  margin-top: 10px;
}

.content {
  margin-bottom: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

ul {
  border: 1px #dcdedf solid;
}

ul li {
  margin: 0.6rem;
}

.fy {
  margin-bottom: 8rem;
}

.upload {
  position: fixed;
  bottom: 3.5rem;
  background-color: transparent;
  width: 40%;
  margin-left: 30%;
}
</style>