import express from 'express';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion
} from '../controllers/questionController.js';
import { protect, optional } from '../middleware/auth.js';
import {
  validateQuestion,
  validateObjectId,
  validateQuestionQuery,
} from '../middleware/validation.js';

const router = express.Router();

router
  .route('/')
  .get(validateQuestionQuery, optional, getQuestions)
  .post(protect, validateQuestion, createQuestion);

router
  .route('/:id')
  .get(validateObjectId('id'), optional, getQuestion)
  .patch(validateObjectId('id'), protect, validateQuestion, updateQuestion)
  .delete(validateObjectId('id'), protect, deleteQuestion);

router.post('/:id/vote', validateObjectId('id'), protect, voteQuestion);

export default router;