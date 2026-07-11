import mongoose from 'mongoose';
import fs from 'fs';

async function test() {
    await mongoose.connect('mongodb+srv://bhagavanpavan999_db_pavandevtinder:L3x1E4vqHExzfyeP@pavandevtinder.chdsfff.mongodb.net/?appName=PavanDevTinder');

    // mock schema
    const chatSchema = new mongoose.Schema({
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
        type: { type: String, enum: ['private', 'group'], default: 'private' },
        messages: { type: Array, default: [] },
        unreadCount: { type: Map, of: Number, default: new Map() },
        isActive: { type: Boolean, default: true }
    });

    chatSchema.statics.findOrCreatePrivateChat = async function (userId1, userId2) {
        const p1 = userId1.toString();
        const p2 = userId2.toString();
        const participantsStrings = [p1, p2].sort();
        const participants = participantsStrings.map(id => new mongoose.Types.ObjectId(id));

        let chat = await this.findOneAndUpdate(
            {
                type: 'private',
                participants: { $all: participants, $size: 2 },
            },
            {
                $setOnInsert: {
                    type: 'private',
                    participants: participants,
                    messages: [],
                    unreadCount: new Map()
                }
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        ).catch(async (err) => {
            // if it fails due to the query inference issue, just find with exact and upsert!
            // wait just let's see why it failed
            throw err;
        });

        return chat;
    };

    const Chat = mongoose.model('ChatTest4', chatSchema, 'chats');

    try {
        const chat = await Chat.findOrCreatePrivateChat('609bcfc6f5e7ee853faa0afx', '609bcfc6f5e7ee853faa0afy');
        fs.writeFileSync('output.json', JSON.stringify({ chat, messages: chat.messages }, null, 2));
    } catch (err) {
        fs.writeFileSync('output.json', JSON.stringify({ error: err.message }, null, 2));
    }

    process.exit(0);
}

test();
