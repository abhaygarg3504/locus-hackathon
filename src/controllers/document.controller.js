const Document = require("../models/Document");

exports.createDocument = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Document title is required"
      });
    }

    const document = await Document.create({
      title,
      content: "",
      owner: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Document created successfully",
      document
    });
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating document",
      error: error.message
    });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    })
      .populate("owner", "name email")
      .populate("collaborators", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: error.message
    });
  }
};

// Get single document by ID
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators", "name email")
      .populate("versions.savedBy", "name email");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const hasAccess =
      document.owner._id.toString() === req.user.id ||
      document.collaborators.some(
        (collab) => collab._id.toString() === req.user.id
      ) ||
      document.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching document",
      error: error.message
    });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const hasAccess =
      document.owner.toString() === req.user.id ||
      document.collaborators.some(
        (collab) => collab.toString() === req.user.id
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (title) document.title = title;
    if (content !== undefined) document.content = content;

    await document.save();

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document
    });
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating document",
      error: error.message
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only document owner can delete"
      });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message
    });
  }
};

exports.saveVersion = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const hasAccess =
      document.owner.toString() === req.user.id ||
      document.collaborators.some(
        (collab) => collab.toString() === req.user.id
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    document.versions.push({
      content: document.content,
      savedBy: req.user.id,
      savedAt: new Date()
    });

    await document.save();

    res.status(200).json({
      success: true,
      message: "Version saved successfully",
      version: document.versions[document.versions.length - 1]
    });
  } catch (error) {
    console.error("Save version error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving version",
      error: error.message
    });
  }
};

exports.restoreVersion = async (req, res) => {
  try {
    const { versionId } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    // Check access
    const hasAccess =
      document.owner.toString() === req.user.id ||
      document.collaborators.some(
        (collab) => collab.toString() === req.user.id
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    const version = document.versions.id(versionId);
    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Version not found"
      });
    }

    document.content = version.content;
    await document.save();

    res.status(200).json({
      success: true,
      message: "Document restored to previous version",
      document
    });
  } catch (error) {
    console.error("Restore version error:", error);
    res.status(500).json({
      success: false,
      message: "Error restoring version",
      error: error.message
    });
  }
};

exports.addCollaborator = async (req, res) => {
  try {
    const { email } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    // Only owner can add collaborators
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only document owner can add collaborators"
      });
    }

    const User = require("../models/User");
    const collaborator = await User.findOne({ email });

    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (document.collaborators.includes(collaborator._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already a collaborator"
      });
    }

    document.collaborators.push(collaborator._id);
    await document.save();

    res.status(200).json({
      success: true,
      message: "Collaborator added successfully",
      document
    });
  } catch (error) {
    console.error("Add collaborator error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding collaborator",
      error: error.message
    });
  }
};