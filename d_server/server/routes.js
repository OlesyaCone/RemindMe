import express from "express";
import RemindController from "./controllers/remindController.js";
// import FitController from "./controllers/fitController.js";

const router = express.Router();

router.post('/reminds', RemindController.createRemind.bind(RemindController));
router.get('/reminds', RemindController.getRemind.bind(RemindController));
router.delete('/reminds/:id', RemindController.deleteRemind.bind(RemindController));
router.put('/reminds/:id', RemindController.putRemind.bind(RemindController));

// router.post('/exercises')
// router.get('/exercises')
export default router;