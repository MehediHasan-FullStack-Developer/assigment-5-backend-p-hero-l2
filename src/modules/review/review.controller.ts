import { sendResponse } from "../../helper/sendResponse";
import { TryCatch } from "../../utils/TryCatch";
import {
  createReviewService,
  deleteReviewService,
  getReviewsByMedia,
  getAllReviewsForAdmin,
  updateReviewStatusService,
  myReviewsService,
  getAllMoviewAndSeriesReviewService,
} from "./review.service";

export const createReview = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const result = await createReviewService(userId, req.body);
  sendResponse(res, 201, "Review added successfully", result);
});

export const getMediaReviews = TryCatch(async (req, res, next) => {
  const id = req.query?.id as string;
  const type = req.query?.type as any;
  const result = await getReviewsByMedia(id, type);
  sendResponse(res, 200, "Reviews fetched successfully", result);
});

export const deleteReview = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const userId = req.user?.id as string;
  await deleteReviewService(id, userId);
  sendResponse(res, 200, "Review deleted successfully", null);
});

export const allReviewForAdmin = TryCatch(async (req, res, next) => {
  const result = await getAllReviewsForAdmin();
  sendResponse(res, 200, "Reviews fetched successfully", result);
});

export const updateReviewStatus = TryCatch(async (req, res, next) => {
  const id = req.query?.id as string;
  const status = req.body.status as "APPROVED" | "PENDING" | "REJECTED";
  const result = await updateReviewStatusService(id, status);
  sendResponse(res, 200, "Review status updated successfully", result);
});

export const myReviews = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const result = await myReviewsService(userId);
  sendResponse(res, 200, "Reviews fetched successfully", result);
});

export const allMoviesAndSeriesReviews = TryCatch(async (req, res, next) => {
  const result = await getAllMoviewAndSeriesReviewService();
  sendResponse(res, 200, "Reviews fetched successfully", result);
});
