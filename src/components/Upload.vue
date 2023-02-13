<template>
  <div class="upload">
    <van-field v-model="inputVal" placeholder="请输入文件名~" style="width: 70%;border: 2px #dcdedf solid;" />

    <input type="file" id="file" style="display: none;" :accept="props.accept" multiple>
    <van-button style="margin-left: 10px;" type="primary" @click="upload">上传</van-button>
  </div>
  <progress value="0" max="100" style="display: none;"></progress>
</template>

<script setup>
import { onMounted, ref, defineEmits, defineProps } from 'vue'
import SparkMD5 from 'spark-md5'
import XWLRequest from "../servise/index";
import axios from 'axios';
import { baseURL } from "../constant/index"
import localCache from '../utils/cache'
import { showNotify } from 'vant'
import 'vant/es/notify/style'

const props = defineProps(['accept'])
const emit = defineEmits(["againRequest"])

let userInfo2 = localCache.getCache("userInfo2");
userInfo2 = userInfo2 === undefined ? undefined : JSON.parse(userInfo2);
let token = userInfo2.token

const inputVal = ref('')

// 功能：同步获取hash值、切片上传、精度条
let upload2
const upload = () => {
  if (!inputVal.value) {
    showNotify("文件名不能为空~")
    return
  }
  upload2();
}

onMounted(() => {
  const fileEL = document.querySelector("#file");
  const progressEL = document.querySelector("progress");
  upload2 = () => {
    fileEL.click();
  }

  fileEL.addEventListener("change", () => {
    let fileInfos = Array.from(fileEL.files);
    // 限制个数
    if (fileInfos.length > 3) {
      showNotify("数量不能超过3个~");
      fileInfos = []
      return
    }

    let fileSize = fileInfos[0].size;
    let progressVal = 0;

    progressEL.style.display = "block";

    fileInfos.forEach((fileInfo) => {
      const suffix = fileInfo.type.split("/")[1];
      const type = fileInfo.type;

      console.log("1、文件读取~");
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(fileInfo);

      fileReader.onload = async (e) => {
        console.log("2、获取hash值~");
        const hash = getHash(e.target.result);

        console.log("3、开始切片~");
        let size = 5 * 1024 * 1024; // 切片大小5M
        if (fileInfo.size / size > 100) {
          size = Math.ceil(fileInfo.size / 100);
        }

        let fileChunks = [];
        let index = 0; //切片序号
        for (let cur = 0; cur < fileInfo.size; cur += size) {
          fileChunks.push({
            hash: `${hash}_${index}`,
            chunk: fileInfo.slice(cur, cur + size),
          });
          index++;
        }

        // 获取已上传切片数组（断点续传）
        try {
          const { data: fileSliceArr } = await XWLRequest.get({ url: "/file/getFileSlice", params: { hash, suffix, isUser: 'user' } });

          // 排除已经上传的（断点续传）
          fileChunks = fileChunks.filter((item) => {
            return !fileSliceArr.includes(item.hash);
          });
        } catch (err) {
          console.log("获取已上传切片失败的原因：" + err);
        }

        // 遍历上传每一片
        console.log("4、上传切片~");
        let promiseArr = [];

        // 进度条-一个或多个文件时赋不同的max值
        if (fileInfos.length === 1) {
          progressEL.max = fileChunks.length;
        } else {
          progressEL.max = fileInfos.length;
        }

        fileChunks.forEach((fileChunk) => {
          let formData = new FormData();
          formData.append("file", fileChunk.chunk);
          formData.append("hash", fileChunk.hash);
          formData.append("suffix", suffix);

          promiseArr.push(
            axios
              .post(`${baseURL}/file/uploadFileSlice?token=${token}&isUser='user'`, formData).then((res) => {
                // 进度条-控制一个文件时
                if (fileInfos.length === 1) {
                  progressVal += 1;
                  progressEL.value = progressVal;
                }
              })
              .catch((err) => {
                console.log("切片上传失败的原因：" + err);
              })
          );
        });

        Promise.all(promiseArr)
          .then((res) => {
            // 进度条-一个或多个文件时
            if (fileInfos.length > 1) {
              progressVal += 1;
              progressEL.value = progressVal;
            }

            // 合并切片
            let fileName = inputVal.value;
            XWLRequest.get({ url: '/file/mergeFile', params: { hash, fileName, suffix, type, len: index, fileSize, isUser: 'user' } }).then((res) => {
              inputVal.value = ''

              if (
                progressEL.value === progressEL.max ||
                fileChunks.length === 0
              ) {
                console.log("5、上传切片成功~");
                progressEL.value = 0;
                progressEL.max = 100;
                progressEL.style.display = "none";
              }

              // 刷新页面
              emit('againRequest')
              console.log(res.data.file);
            })
              .catch((err) => {
                console.log("合并切片失败的原因：" + err);
              });
          })
          .catch((err) => {
            console.log("5、上传失败~");
          });
      };
    });
  });

  function getHash(file) {
    const spart = new SparkMD5.ArrayBuffer();
    spart.append(file);
    const hash = spart.end();

    return hash;
  }
})

</script>

<style lang="less" scoped>
.upload {
  display: flex;
  justify-content: space-around;
  margin: 5px;
}

progress {
  margin: 5px 0 5px 10px;
}
</style>