import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve('data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

const readJSON = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch {
        return [];
    }
};

const writeJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

export const fileDb = {
    users: {
        find: () => readJSON(USERS_FILE),
        findOne: (query) => {
            const list = readJSON(USERS_FILE);
            return list.find(u => Object.keys(query).every(k => String(u[k]) === String(query[k])));
        },
        create: (userData) => {
            const list = readJSON(USERS_FILE);
            const newUser = {
                _id: crypto.randomUUID(),
                ...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            list.push(newUser);
            writeJSON(USERS_FILE, list);
            return newUser;
        },
        findById: (id) => {
            const list = readJSON(USERS_FILE);
            return list.find(u => String(u._id) === String(id));
        }
    },
    projects: {
        find: (query) => {
            const list = readJSON(PROJECTS_FILE);
            return list
                .filter(p => Object.keys(query).every(k => String(p[k]) === String(query[k])))
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        },
        findOne: (query) => {
            const list = readJSON(PROJECTS_FILE);
            return list.find(p => Object.keys(query).every(k => String(p[k]) === String(query[k])));
        },
        create: (projData) => {
            const list = readJSON(PROJECTS_FILE);
            const newProj = {
                _id: crypto.randomUUID(),
                title: projData.title || 'Untitled Project',
                messages: projData.messages || [],
                generatedCode: projData.generatedCode || '',
                versions: projData.versions || [],
                isShared: projData.isShared || false,
                userId: projData.userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            list.push(newProj);
            writeJSON(PROJECTS_FILE, list);
            return newProj;
        },
        update: (projectId, userId, updates) => {
            const list = readJSON(PROJECTS_FILE);
            const idx = list.findIndex(p => String(p._id) === String(projectId) && String(p.userId) === String(userId));
            if (idx === -1) return null;

            const updated = {
                ...list[idx],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            list[idx] = updated;
            writeJSON(PROJECTS_FILE, list);
            return updated;
        },
        findOneAndDelete: (projectId, userId) => {
            const list = readJSON(PROJECTS_FILE);
            const idx = list.findIndex(p => String(p._id) === String(projectId) && String(p.userId) === String(userId));
            if (idx === -1) return null;
            const deleted = list[idx];
            list.splice(idx, 1);
            writeJSON(PROJECTS_FILE, list);
            return deleted;
        }
    }
};
