const Document = require("../models/Document");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-document", async (docId) => {
      try {
        socket.join(docId);
        console.log(`User ${socket.id} joined document ${docId}`);
        const document = await Document.findById(docId);
        if (document) {
          socket.emit("document-loaded", document.content);
        }
      } catch (error) {
        console.error("Join document error:", error);
        socket.emit("error", { message: "Error joining document" });
      }
    });
    socket.on("edit-document", async ({ docId, content, userId }) => {
      try {
        
        const document = await Document.findByIdAndUpdate(
          docId,
          { content },
          { new: true }
        );

        if (!document) {
          socket.emit("error", { message: "Document not found" });
          return;
        }

        socket.to(docId).emit("document-updated", {
          content,
          updatedBy: userId,
          timestamp: new Date()
        });

        console.log(`Document ${docId} updated by user ${userId}`);
      } catch (error) {
        console.error("Edit document error:", error);
        socket.emit("error", { message: "Error updating document" });
      }
    });
    socket.on("save-version", async ({ docId, userId }) => {
      try {
        const document = await Document.findById(docId);

        if (!document) {
          socket.emit("error", { message: "Document not found" });
          return;
        }
        document.versions.push({
          content: document.content,
          savedBy: userId,
          savedAt: new Date()
        });

        await document.save();

        // Notify all users in the room
        io.to(docId).emit("version-saved", {
          version: document.versions[document.versions.length - 1],
          totalVersions: document.versions.length
        });

        console.log(`Version saved for document ${docId}`);
      } catch (error) {
        console.error("Save version error:", error);
        socket.emit("error", { message: "Error saving version" });
      }
    });

     socket.on("cursor-position", ({ docId, userId, position, userName }) => {
      socket.to(docId).emit("user-cursor", {
        userId,
        userName,
        position
      });
    });
    socket.on("leave-document", (docId) => {
      socket.leave(docId);
      console.log(`User ${socket.id} left document ${docId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};