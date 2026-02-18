import * as patientsService from '../services/patientsService.js';

export async function createPatient(req, res) {
  try {
    const { name, email, phone, dob, medical_notes } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const patient = await patientsService.createPatient(req.userId, {
      name,
      email,
      phone,
      dob,
      medical_notes,
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
}

export async function getPatients(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const result = await patientsService.getPatients(req.userId, page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
}

export async function updatePatient(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid patient id' });
    const { name, email, phone, dob, medical_notes } = req.body;
    const patient = await patientsService.updatePatient(req.userId, id, {
      name,
      email,
      phone,
      dob,
      medical_notes,
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
}

export async function deletePatient(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid patient id' });
    const deleted = await patientsService.deletePatient(req.userId, id);
    if (!deleted) return res.status(404).json({ error: 'Patient not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
}
