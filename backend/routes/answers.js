import express from 'express';
import {
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
} from '../controllers/answerController.js';
import { protect, optional } from '../middleware/auth.js';
import {
  validateAnswer,
  validateObjectId,
} from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(optional, getAnswers)
  .post(protect, validateAnswer, createAnswer);

router
  .route('/:id')
  .patch(validateObjectId('id'), protect, validateAnswer, updateAnswer)
  .delete(validateObjectId('id'), protect, deleteAnswer);

router.post('/:id/vote', validateObjectId('id'), protect, voteAnswer);

export default router;