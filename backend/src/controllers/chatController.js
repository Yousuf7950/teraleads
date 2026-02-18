import * as chatService from '../services/chatService.js';
import * as patientsService from '../services/patientsService.js';

export async function getChatHistory(req, res) {
  try {
    const patientId = parseInt(req.query.patientId, 10);
    if (!patientId || isNaN(patientId)) {
      return res.status(400).json({ error: 'Valid patientId required' });
    }
    const patient = await patientsService.getPatientById(req.userId, patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const messages = await chatService.getChatHistory(req.userId, patientId);
    res.json({ patient, messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}

export async function sendMessage(req, res) {
  try {
    const { patientId, message } = req.body;
    if (!patientId || !message || typeof message !== 'string') {
      return res.status(400).json({ error: 'patientId and message required' });
    }
    const pid = parseInt(patientId, 10);
    if (isNaN(pid)) return res.status(400).json({ error: 'Invalid patientId' });
    const patient = await patientsService.getPatientById(req.userId, pid);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const aiReply = await chatService.sendMessage(req.userId, pid, message.trim());
    res.json(aiReply);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}
