import Project from '../models/Project.model.js';
import { useLocalDB } from '../config/db.config.js';
import { fileDb } from '../config/fileDb.js';

export const getUserProjects = async (userId) => {
    if (useLocalDB) {
        return fileDb.projects.find({ userId });
    }
    const projects = await Project.find({ userId }).sort({ updatedAt: -1 });
    return projects;
};

export const getProjectById = async (projectId, userId) => {
    if (useLocalDB) {
        const project = fileDb.projects.findOne({ _id: projectId, userId });
        if (!project) {
            const error = new Error('Project not found.');
            error.statusCode = 404;
            throw error;
        }
        return project;
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
    }
    return project;
};

export const getSharedProjectById = async (projectId) => {
    if (useLocalDB) {
        const project = fileDb.projects.findOne({ _id: projectId });
        if (!project) {
            const error = new Error('Project not found.');
            error.statusCode = 404;
            throw error;
        }
        if (!project.isShared) {
            const error = new Error('This project is not publicly shared.');
            error.statusCode = 403;
            throw error;
        }
        return {
            _id: project._id,
            title: project.title,
            generatedCode: project.generatedCode,
            isShared: project.isShared
        };
    }

    const project = await Project.findById(projectId).select('title generatedCode isShared');
    if (!project) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
    }
    if (!project.isShared) {
        const error = new Error('This project is not publicly shared.');
        error.statusCode = 403;
        throw error;
    }
    return project;
};

export const createProject = async (userId, title) => {
    if (useLocalDB) {
        return fileDb.projects.create({
            userId,
            title: title || 'Untitled Project',
            messages: [],
            generatedCode: '',
            versions: []
        });
    }

    const project = await Project.create({
        userId,
        title: title || 'Untitled Project',
        messages: [],
        generatedCode: '',
        versions: [],
    });
    return project;
};

export const updateProject = async (projectId, userId, updates) => {
    if (useLocalDB) {
        const project = fileDb.projects.findOne({ _id: projectId, userId });
        if (!project) {
            const error = new Error('Project not found.');
            error.statusCode = 404;
            throw error;
        }

        const cleanUpdates = {};
        if (updates.title !== undefined) cleanUpdates.title = updates.title;
        if (updates.description !== undefined) cleanUpdates.description = updates.description;
        if (updates.generatedCode !== undefined) cleanUpdates.generatedCode = updates.generatedCode;
        if (updates.isShared !== undefined) cleanUpdates.isShared = updates.isShared;

        return fileDb.projects.update(projectId, userId, cleanUpdates);
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
    }

    if (updates.title !== undefined) project.title = updates.title;
    if (updates.description !== undefined) project.description = updates.description;
    if (updates.generatedCode !== undefined) project.generatedCode = updates.generatedCode;
    if (updates.isShared !== undefined) project.isShared = updates.isShared;

    project.updatedAt = new Date();
    await project.save();
    return project;
};

export const deleteProject = async (projectId, userId) => {
    if (useLocalDB) {
        const project = fileDb.projects.findOneAndDelete(projectId, userId);
        if (!project) {
            const error = new Error('Project not found.');
            error.statusCode = 404;
            throw error;
        }
        return { message: 'Project deleted successfully.' };
    }

    const project = await Project.findOneAndDelete({ _id: projectId, userId });
    if (!project) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
    }
    return { message: 'Project deleted successfully.' };
};