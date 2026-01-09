const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
  content: {
    type: String,
    default: ""
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    content: {
      type: String,
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    versions: [versionSchema],
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

documentSchema.pre("save", function (next) {
  if (this.isNew) {
    this.versions.push({
      content: this.content,
      savedBy: this.owner,
      savedAt: new Date()
    });
  }
  next();
});

module.exports = mongoose.model("Document", documentSchema);