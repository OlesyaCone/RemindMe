import { createRouter, createWebHistory } from "vue-router";
import Fit from "./views/Fit.vue";
import Remind from "./views/Remind.vue";
import Card from "./views/Card.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Card",
      component: Card,
    },
    {
      path: "/fit",
      name: "Fit",
      component: Fit,
    },
    {
      path: "/remind",
      name: "Remind",
      component: Remind,
    },
  ],
});

export default router;
