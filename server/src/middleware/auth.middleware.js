import { verifyToken } from '../utils/jwt.utils.js';
import User from '../models/User.model.js';
import { useLocalDB } from '../config/db.config.js';
import { fileDb } from '../config/fileDb.js';

const authenticate = async (req, res, next) => {
    try {
        let token = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
        }

        const decoded = verifyToken(token);
        let user = null;

        if (useLocalDB) {
            user = fileDb.users.findById(decoded.id);
            if (user) {
                // Remove password field
                const { password, ...userWithoutPassword } = user;
                user = userWithoutPassword;
            }
        } else {
            user = await User.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token invalid.' });
    }
};

export default authenticate;
