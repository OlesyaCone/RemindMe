import express from "express";
import RemindController from "./controllers/remindController.js";

const router = express.Router();

router.post('/create', RemindController.createRemind.bind(RemindController));
router.get('/reminds', RemindController.getRemind.bind(RemindController));
router.delete('/delete/:id', RemindController.deleteRemind.bind(RemindController));
router.put('/reminds/:id', RemindController.putRemind.bind(RemindController));

export default router