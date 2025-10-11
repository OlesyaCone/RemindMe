import express from "express";
import RemindController from "./controllers/remindController.js";

const router = express.Router();

router.post('/reminds', RemindController.createRemind.bind(RemindController));
router.get('/reminds', RemindController.getRemind.bind(RemindController));
router.delete('/reminds/:id', RemindController.deleteRemind.bind(RemindController));
router.put('/reminds/:id', RemindController.putRemind.bind(RemindController));

export default router;