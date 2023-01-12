import axios from "axios";
import localCache from "../utils/cache";

class Axios {
  instance = null;
  constructor(config) {
    this.instance = axios.create(config);

    this.instance.interceptors.request.use(
      (config) => {
        let userInfo2 = localCache.getCache("userInfo2");
        userInfo2 = userInfo2 ? JSON.parse(userInfo2) : {};
        // 请求拦截，携带token
        const token = userInfo2.token;
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
      (err) => {
        return err;
      }
    );
  }

  request(config) {
    return new Promise((resolve, reject) => {
      this.instance
        .request(config)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  post(config) {
    return this.request({ ...config, method: "POST" });
  }

  get(config) {
    return this.request({ ...config, method: "GET" });
  }
}

export default Axios;
