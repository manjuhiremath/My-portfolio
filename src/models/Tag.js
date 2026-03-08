import mongoose from "mongoose"

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    default: "#6366f1",
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
}, { timestamps: true })


export default mongoose.models.Tag || mongoose.model("Tag", TagSchema)
