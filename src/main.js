import { createApp } from "vue";
import App from "./App.vue";

import "./style.css";
import router from "./router/index";
import { Notify } from "vant";

const app = createApp(App);

app.use(Notify);
app.use(router);

app.mount("#app");
