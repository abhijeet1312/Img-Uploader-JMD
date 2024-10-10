import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,

    },
    task: {
        type: String,
        required: true,
    },
    adminname: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }


});
// userId: { type: String, required: true },
//     task: { type: String, required: true },
//     admin: { type: String, required: true },
//     status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
//     createdAt: { type: Date, default: Date.now }


export default mongoose.model('Assignment', AssignmentSchema);