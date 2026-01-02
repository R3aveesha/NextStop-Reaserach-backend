const express = require("express");
const multer = require("multer");
const {
	createBus,
	getBuses,
	getBusById,
	getBusImage,
	updateBus,
	deleteBus,
} = require("../../controllers/Bus/BusController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), createBus);

router.get("/", getBuses);

router.get("/:id", getBusById);

router.get("/:id/image", getBusImage);

router.put("/:id", upload.single("image"), updateBus);

router.delete("/:id", deleteBus);

module.exports = router;