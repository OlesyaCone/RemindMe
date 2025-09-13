import express from "express";
import RemindController from "./controllers/postController";

const router = express.Router();

router.post('/create', RemindController.createRemind) 
router.get('/reminds', RemindController.getRemind)
router.delete('/delete', RemindController.deleteRemind)
router.put('/reminds/:id', RemindController.putRemind);