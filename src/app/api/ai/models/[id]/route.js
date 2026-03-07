import { connectDB } from '@/lib/mongodb';
import AIModel from '@/models/AIModel';
import mongoose from 'mongoose';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await AIModel.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    const updatedModel = await AIModel.findByIdAndUpdate(
      id,
      { $set: body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedModel) {
      return Response.json(
        { error: 'AI Model not found' },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'AI Model updated successfully', model: updatedModel }
    );
  } catch (error) {
    console.error('Error updating AI model:', error);
    return Response.json(
      { error: error.message || 'Failed to update AI model' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    const deletedModel = await AIModel.findByIdAndDelete(id);

    if (!deletedModel) {
      return Response.json(
        { error: 'AI Model not found' },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'AI Model deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting AI model:', error);
    return Response.json(
      { error: error.message || 'Failed to delete AI model' },
      { status: 500 }
    );
  }
}
