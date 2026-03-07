import mongoose from "mongoose"

const BlogSchema = new mongoose.Schema({

 title:String,
 slug:String,

 category:String,

 excerpt:String,
 content:String,

 readingTime: { type: Number, default: 5 },

 featuredImage:String,

 tags:[String],
 keywords:[String],

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

export default mongoose.models.Blog || mongoose.model("Blog",BlogSchema)