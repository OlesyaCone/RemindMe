import express from "express";
import RemindController from "./controllers/postController";

const router = express.Router();

router.post('/create', RemindController.createRemimd)