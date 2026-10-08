const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            minlength: 1,
            maxlength: 50
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(_document, returnedObject) {
                returnedObject.id = returnedObject._id.toString();
                delete returnedObject._id;
                delete returnedObject.__v;
                delete returnedObject.password;
                return returnedObject;
            }
        }
    }
);

module.exports = mongoose.model("User", userSchema);
