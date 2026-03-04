import mongoose from 'mongoose';

const AIModelSchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  providerType: {
    type: String,
    default: 'openrouter',
    enum: ['openrouter', 'ollama', 'openai', 'anthropic', 'google', 'custom']
  },
  apiKey: {
    type: String,
    default: '',
    select: false // Don't include in queries by default for security
  },
  baseUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  contextLength: {
    type: Number,
    default: 8192
  },
  weeklyTokens: {
    type: String,
    default: ''
  },
  capability: {
    type: String,
    default: 'text-to-text',
    enum: ['text-to-text', 'image-to-text', 'text-to-image', 'multi-modal']
  },
  inputModalities: {
    type: [String],
    default: ['text']
  },
  outputModalities: {
    type: [String],
    default: ['text']
  },
  isFree: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isFromAPI: {
    type: Boolean,
    default: false
  },
  useForKeywordResearch: {
    type: Boolean,
    default: true
  },
  useForOutline: {
    type: Boolean,
    default: true
  },
  useForContent: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.AIModel || mongoose.model('AIModel', AIModelSchema);
