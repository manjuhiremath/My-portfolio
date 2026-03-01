import mongoose from "mongoose"

const BlogSchema = new mongoose.Schema({

 title:String,
 slug:String,

 category:String,
 subcategory:String,

 excerpt:String,
 content:String,

 featuredImage:String,

 tags:[String],
 keywords:[String],

 seoTitle:String,
 seoDescription:String,

 published:Boolean,

 createdAt:{
  type:Date,
  default:Date.now
 }

})

export default mongoose.models.Blog || mongoose.model("Blog",BlogSchema)