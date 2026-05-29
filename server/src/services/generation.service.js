import Project from '../models/Project.model.js';
import * as geminiService from './gemini.service.js';
import { parseGenerationResponse } from '../utils/code.utils.js';
import { useLocalDB } from '../config/db.config.js';
import { fileDb } from '../config/fileDb.js';

export const generateCodeForProject = async (projectId, userId, prompt) => {
    let project = null;

    if (useLocalDB) {
        project = fileDb.projects.findOne({ _id: projectId, userId });
    } else {
        project = await Project.findOne({ _id: projectId, userId });
    }

    if (!project) {
        const error = new Error('Project not found.');
        error.statusCode = 404;
        throw error;
    }

    // 1. Get chat history from project messages
    const chatHistory = project.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));

    // 2. Call Gemini Service
    const aiResponseText = await geminiService.generateAppCode(
        chatHistory,
        prompt,
        project.generatedCode
    );

    // 3. Parse Gemini Response
    const { description, code } = parseGenerationResponse(aiResponseText);

    // 4. Update project with new messages and code
    const updatedMessages = [
        ...project.messages,
        { role: 'user', content: prompt, createdAt: new Date().toISOString() },
        { role: 'assistant', content: description || 'Here is the generated code.', createdAt: new Date().toISOString() }
    ];

    const updates = {
        messages: updatedMessages
    };

    if (code) {
        updates.generatedCode = code;
        updates.versions = [
            ...project.versions,
            { code: code, description: prompt, createdAt: new Date().toISOString() }
        ];
    }

    // Auto-generate project name if it is currently 'Untitled Project'
    if (project.title === 'Untitled Project') {
        let extractedTitle = null;
        if (code) {
            const titleMatch = code.match(/<title>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
                extractedTitle = titleMatch[1].trim();
            }
        }
        
        // Filter out generic titles like 'Document' or 'Webpack App'
        if (extractedTitle && 
            extractedTitle.toLowerCase() !== 'document' && 
            extractedTitle.toLowerCase() !== 'html document' &&
            extractedTitle.trim() !== '') {
            updates.title = extractedTitle;
        } else {
            // fallback: short version of the prompt
            updates.title = prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt;
        }
    }

    if (useLocalDB) {
        return fileDb.projects.update(projectId, userId, updates);
    } else {
        project.messages = updates.messages;
        if (updates.title) {
            project.title = updates.title;
        }
        if (code) {
            project.generatedCode = updates.generatedCode;
            project.versions.push({
                code: code,
                description: prompt,
            });
        }
        project.updatedAt = new Date();
        await project.save();
        return project;
    }
};