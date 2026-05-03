import { Router } from "express";
import { isAuthenticated, authorizeRoles } from "../../middleware/middleware";
import {
  allMoviesAndSeriesReviews,
  allReviewForAdmin,
  createReview,
  deleteReview,
  getMediaReviews,
  myReviews,
  updateReviewStatus,
} from "./review.controller";

const router = Router();

router.route("/create").post(isAuthenticated, createReview);
router.route("/all-reviews").get(getMediaReviews);
router
  .route("/delete/:id")
  .delete(isAuthenticated, authorizeRoles("ADMIN", "CREATOR"), deleteReview);

router
  .route("/admin/all-reviews")
  .get(isAuthenticated, authorizeRoles("ADMIN"), allReviewForAdmin);

router
  .route("/review-update-status")
  .patch(isAuthenticated, authorizeRoles("ADMIN"), updateReviewStatus);

router.route("/my-reviews").get(isAuthenticated, myReviews);
router.route("/testimonial-reviews").get(allMoviesAndSeriesReviews);

export const reviewRouter = router;
