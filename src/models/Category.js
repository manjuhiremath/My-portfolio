import mongoose from "mongoose"

const CategorySchema=new mongoose.Schema({

 name:String,
 slug:String,
 parent: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Category',
   default: null
 },
 color: {
   type: String,
   default: "#6366f1"
 },
 description:String,

 // SEO Fields
 seoTitle:String,
 seoDescription:String,
 keywords:[String],

},{ timestamps: true });

export default mongoose.models.Category ||
mongoose.model("Category",CategorySchema)