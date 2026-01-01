const mongoose = require('mongoose');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
    memberId: { type: Number, unique: true },
    username: { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    firstName: { type: String, default: "" },
    lastName:  { type: String, default: "" },
    phone:     { type: String, default: "" },
    avatar:    { type: String, default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },

    address: {
        street: { type: String, default: "" },
        city:   { type: String, default: "" },
        country:{ type: String, default: "" },
        zip:    { type: String, default: "" }
    },
    preferences: {
        currency: { type: String, default: "USD" },
        language: { type: String, default: "en" }
    },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }], 
    
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { id: 'userId' },       
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.memberId = counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('User', userSchema);