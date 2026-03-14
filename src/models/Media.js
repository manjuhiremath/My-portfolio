import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  title: String,
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  sizeLabel: String,
  type: { type: String, default: 'Upload' },
  mimeType: String,
  width: Number,
  height: Number,
}, { timestamps: true });

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
