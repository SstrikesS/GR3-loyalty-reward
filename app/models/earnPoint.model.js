import mongoose from "mongoose";

const Schema = mongoose.Schema;

const earnPointSchema = new Schema({
    id: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    status: {
        type: Boolean,
        require: true,
    },
    point: {
        type: Number,
        require: true,
    }
})

export default mongoose.model('Earn', earnPointSchema);
