import { asyncHandler } from '../utils/asyncHandler.js';
import * as reviewService from '../services/review.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Submit task code for review
 * @route   POST /api/v1/tasks/:taskId/reviews
 * @access  Private (Assigned User only)
 */
export const submitReview = asyncHandler(async (req, res) => {
  const { summary } = req.body;
  const review = await reviewService.submitReview(req.params.taskId, req.user, summary);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Code submitted for review successfully',
    data: review
  });
});

/**
 * @desc    Get all reviews for task
 * @route   GET /api/v1/tasks/:taskId/reviews
 * @access  Private (Authorized members / Manager)
 */
export const getReviewsByTask = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getReviewsByTask(req.params.taskId, req.user);
  return sendSuccess(res, {
    message: 'Task reviews retrieved successfully',
    data: reviews
  });
});

/**
 * @desc    Get specific review by ID
 * @route   GET /api/v1/reviews/:reviewId
 * @access  Private (Authorized members / Manager)
 */
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.reviewId, req.user);
  return sendSuccess(res, {
    message: 'Review details retrieved successfully',
    data: review
  });
});

/**
 * @desc    Manager evaluates code review (Approve or Request Changes)
 * @route   PATCH /api/v1/reviews/:reviewId
 * @access  Private (Manager only)
 */
export const evaluateReview = asyncHandler(async (req, res) => {
  const { status, summary } = req.body;
  const review = await reviewService.evaluateReview(
    req.params.reviewId,
    req.user,
    status,
    summary
  );
  return sendSuccess(res, {
    message: `Review completed with status: ${status}`,
    data: review
  });
});
