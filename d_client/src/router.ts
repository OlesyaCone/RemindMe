import { createRouter, createWebHistory } from "vue-router";
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
      path: "/remind",
      name: "Remind",
      component: Remind,
    },
  ],
});

export default router;
