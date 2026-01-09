const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  saveVersion,
  restoreVersion,
  addCollaborator
} = require("../controllers/document.controller");

// All routes are protected
router.use(authMiddleware);

router.post("/", createDocument);
router.get("/", getAllDocuments);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

// Version control
router.post("/:id/versions", saveVersion);
router.post("/:id/restore", restoreVersion);

// Collaborators
router.post("/:id/collaborators", addCollaborator);

module.exports = router;