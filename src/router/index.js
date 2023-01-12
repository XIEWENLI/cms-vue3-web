import * as VueRouter from "vue-router";

import localCache from "../utils/cache";

const routes = [
  { path: "/", redirect: "/main/photo" },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/register/register.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login/login.vue"),
  },
  {
    path: "/main",
    redirect: "/main/photo",
    name: "main",
    component: () => import("../views/main/main.vue"),
    children: [
      {
        path: "photo",
        name: "photo",
        component: () => import("../views/main/photo/photo.vue"),
        children: [],
      },
      {
        path: "video",
        name: "video",
        component: () => import("../views/main/video/video.vue"),
        children: [],
      },
      {
        path: "user",
        name: "user",
        component: () => import("../views/main/user/user.vue"),
        children: [],
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/not-found/not-found.vue"),
  },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

router.beforeEach((to, from) => {
  let userInfo2 = localCache.getCache("userInfo2");
  userInfo2 = userInfo2 === undefined ? undefined : JSON.parse(userInfo2);

  if (to.path !== "/login" && to.path !== "/register") {
    if (userInfo2 === undefined) {
      return "/login";
    }
  }

  // return true;
});

export default router;
