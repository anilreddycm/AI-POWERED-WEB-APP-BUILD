import * as projectService from '../services/project.service.js';

export const getUserProjects = async (req, res, next) => {
    try {
        const projects = await projectService.getUserProjects(req.user._id);
        return res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
};

export const getProjectById = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const project = await projectService.getProjectById(projectId, req.user._id);
        return res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const createProject = async (req, res, next) => {
    try {
        const { title } = req.body;
        const project = await projectService.createProject(req.user._id, title);
        return res.status(201).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const updates = req.body;
        const project = await projectService.updateProject(projectId, req.user._id, updates);
        return res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await projectService.deleteProject(projectId, req.user._id);
        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getSharedProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const project = await projectService.getSharedProjectById(projectId);
        return res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};