import { Router } from 'express';
import {
    getUserProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getSharedProject
} from '../controllers/project.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

// Public share route
router.get('/share/:projectId', getSharedProject);

router.use(authenticate);

router.get('/', getUserProjects);
router.get('/:projectId', getProjectById);
router.post('/', createProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

export default router;
