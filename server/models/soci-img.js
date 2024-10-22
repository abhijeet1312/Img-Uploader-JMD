import mongoose from "mongoose";

const SocialSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    social_media_handle: {
        type: String,
        required: true
    },
    images: [{
        path: {
            type: String, // File path for the uploaded image
            required: true
        },
        contentType: {
            type: String, // MIME type (e.g., 'image/jpeg', 'image/png')
            required: true
        }
    }]
});



export default mongoose.model('Social', SocialSchema);