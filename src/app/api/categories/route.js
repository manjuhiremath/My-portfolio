import {connectDB} from "@/lib/mongodb"
import Category from "@/models/Category"

export async function GET(){

  try {

    await connectDB()

    const categories = await Category.find().sort({name: 1})

    return Response.json(categories)

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}

export async function POST(req){

  try {

    await connectDB()

    const data = await req.json()

    const category = await Category.create(data)

    return Response.json(category)

  } catch (error) {

    return Response.json({error: error.message}, {status: 500})

  }

}