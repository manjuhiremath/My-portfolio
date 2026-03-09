import mongoose from "mongoose"

const BlogSchema = new mongoose.Schema({

  title:String,
  slug:String,

  // Support both string (legacy) and ObjectId (new) for category
  category: {
    type: mongoose.Schema.Types.Mixed,
    ref: "Category"
  },

  excerpt:String,
  content:String,

  readingTime: { type: Number, default: 5 },

  featuredImage:String,
  thumbnailImage:String,

  // Support both string array (legacy) and ObjectId array (new) for tags
  tags: [{
    type: mongoose.Schema.Types.Mixed,
    ref: "Tag"
  }],
  keywords:[String],
  canonicalUrl: String,

 seoTitle:String,
 seoDescription:String,
 
 faq: [{
  question: String,
  answer: String
 }],
 
 internalLinks: [String],
 
 seoScore: { type: Number, default: 0 },
 
 sectionImages: [String],
 ogImage: String,

 published:Boolean,
 publishedAt:Date,
 views:{ type: Number, default: 0 },

 createdAt:{
  type:Date,
  default:Date.now
 }

},{ timestamps: true });

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema)
