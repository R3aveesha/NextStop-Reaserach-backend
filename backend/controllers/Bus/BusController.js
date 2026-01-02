const Bus = require("../../models/Bus/BusModel");

function parseBase64Image(dataString) {
	if (!dataString) return null;
	const matches = dataString.match(/^data:(.+);base64,(.+)$/);
	if (matches) {
		return { contentType: matches[1], data: Buffer.from(matches[2], "base64") };
	}
	try {
		return { contentType: "image/*", data: Buffer.from(dataString, "base64") };
	} catch {
		return null;
	}
}

const createBus = async (req, res) => {
	try {
		const { route, regNo, seats, ownerName, phoneNo } = req.body;
		if (!route || !regNo || !seats || !ownerName || !phoneNo) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		let imageObj = null;
		if (req.file && req.file.buffer) {
			imageObj = { data: req.file.buffer, contentType: req.file.mimetype };
		} else if (req.body.image) {
			imageObj = parseBase64Image(req.body.image);
			if (!imageObj) return res.status(400).json({ message: "Invalid base64 image" });
		} else {
			return res.status(400).json({ message: "Image is required (file upload or base64)" });
		}

		const bus = new Bus({
			route,
			regNo,
			seats: Number(seats),
			ownerName,
			phoneNo,
			image: { data: imageObj.data, contentType: imageObj.contentType },
		});

		const created = await bus.save();
		const obj = created.toObject();
		if (obj.image) delete obj.image.data;
		return res.status(201).json(obj);
	} catch (err) {
		if (err.code === 11000) return res.status(409).json({ message: "regNo already exists" });
		return res.status(500).json({ message: err.message || "Server error" });
	}
};

const getBuses = async (req, res) => {
	try {
		const buses = await Bus.find().sort({ createdAt: -1 }).lean();
		buses.forEach((b) => {
			if (b.image) delete b.image.data;
		});
		return res.json(buses);
	} catch (err) {
		return res.status(500).json({ message: err.message || "Server error" });
	}
};

const getBusById = async (req, res) => {
	try {
		const bus = await Bus.findById(req.params.id).lean();
		if (!bus) return res.status(404).json({ message: "Bus not found" });
		if (bus.image) delete bus.image.data;
		return res.json(bus);
	} catch (err) {
		return res.status(500).json({ message: err.message || "Server error" });
	}
};

const getBusImage = async (req, res) => {
	try {
		const bus = await Bus.findById(req.params.id).select("image");
		if (!bus || !bus.image || !bus.image.data) return res.status(404).json({ message: "Image not found" });
		res.set("Content-Type", bus.image.contentType || "application/octet-stream");
		return res.send(bus.image.data);
	} catch (err) {
		return res.status(500).json({ message: err.message || "Server error" });
	}
};

const updateBus = async (req, res) => {
	try {
		const { route, regNo, seats, ownerName, phoneNo } = req.body;
		const update = {};
		if (route) update.route = route;
		if (regNo) update.regNo = regNo;
		if (typeof seats !== "undefined") update.seats = Number(seats);
		if (ownerName) update.ownerName = ownerName;
		if (phoneNo) update.phoneNo = phoneNo;

		if (req.file && req.file.buffer) {
			update.image = { data: req.file.buffer, contentType: req.file.mimetype };
		} else if (req.body.image) {
			const parsed = parseBase64Image(req.body.image);
			if (!parsed) return res.status(400).json({ message: "Invalid base64 image" });
			update.image = { data: parsed.data, contentType: parsed.contentType };
		}

		const updated = await Bus.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
		if (!updated) return res.status(404).json({ message: "Bus not found" });
		if (updated.image) delete updated.image.data;
		return res.json(updated);
	} catch (err) {
		if (err.code === 11000) return res.status(409).json({ message: "regNo already exists" });
		return res.status(500).json({ message: err.message || "Server error" });
	}
};

const deleteBus = async (req, res) => {
	try {
		const deleted = await Bus.findByIdAndDelete(req.params.id).lean();
		if (!deleted) return res.status(404).json({ message: "Bus not found" });
		return res.json({ message: "Bus deleted" });
	} catch (err) {
		return res.status(500).json({ message: err.message || "Server error" });
	}
};

module.exports = {
	createBus,
	getBuses,
	getBusById,
	getBusImage,
	updateBus,
	deleteBus,
};