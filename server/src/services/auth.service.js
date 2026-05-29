import User from '../models/User.model.js';
import { generateToken } from '../utils/jwt.utils.js';
import { useLocalDB } from '../config/db.config.js';
import { fileDb } from '../config/fileDb.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

export const register = async (name, email, password) => {
    if (useLocalDB) {
        const existingUser = fileDb.users.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const error = new Error('User already exists.');
            error.statusCode = 400;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = fileDb.users.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        const token = generateToken({ id: user._id });
        return {
            token,
            user: { _id: user._id, name: user.name, email: user.email }
        };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const error = new Error('User already exists.');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken({ id: user._id });

    return {
        token,
        user: { _id: user._id, name: user.name, email: user.email }
    };
};

export const emailLogin = async (email, password) => {
    if (useLocalDB) {
        const user = fileDb.users.findOne({ email: email.toLowerCase() });
        if (!user) {
            const error = new Error('Invalid email or password.');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Invalid email or password.');
            error.statusCode = 401;
            throw error;
        }

        const token = generateToken({ id: user._id });
        return {
            token,
            user: { _id: user._id, name: user.name, email: user.email }
        };
    }

    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken({ id: user._id });
    return {
        token,
        user: { _id: user._id, name: user.name, email: user.email }
    };
};

export const getUserProfile = async (userId) => {
    if (useLocalDB) {
        const user = fileDb.users.findById(userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        return { _id: user._id, name: user.name, email: user.email };
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

export const googleLogin = async (idToken) => {
    let email, name;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const isMock = !clientId || clientId.includes('placeholder') || idToken === 'mock-google-token';

    if (isMock) {
        email = 'googleuser@example.com';
        name = 'Google User';
    } else {
        try {
            const client = new OAuth2Client(clientId);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: clientId,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        } catch (err) {
            const error = new Error('Invalid Google token.');
            error.statusCode = 401;
            throw error;
        }
    }

    if (useLocalDB) {
        let user = fileDb.users.findOne({ email: email.toLowerCase() });
        if (!user) {
            const randomPassword = crypto.randomUUID();
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = fileDb.users.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword
            });
        }

        const token = generateToken({ id: user._id });
        return {
            token,
            user: { _id: user._id, name: user.name, email: user.email }
        };
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        const randomPassword = crypto.randomUUID();
        user = await User.create({
            name,
            email: email.toLowerCase(),
            password: randomPassword
        });
    }

    const token = generateToken({ id: user._id });
    return {
        token,
        user: { _id: user._id, name: user.name, email: user.email }
    };
};
