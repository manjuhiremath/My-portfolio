import {connectDB} from "@/lib/mongodb"
import Category from "@/models/Category"

export async function DELETE(req,{params}){

  try {

    await connectDB()

    const category = await Category.findByIdAndDelete(params.id)

    if (!category) {
      return Response.json({error: "Category not found"}, {status: 404})
    }

    return Response.json({message: "Category deleted successfully"})

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}