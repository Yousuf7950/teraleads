import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as patientsController from '../controllers/patientsController.js';

const router = Router();
router.use(authMiddleware);
router.post('/', patientsController.createPatient);
router.get('/', patientsController.getPatients);
router.put('/:id', patientsController.updatePatient);
router.delete('/:id', patientsController.deletePatient);
export default router;
