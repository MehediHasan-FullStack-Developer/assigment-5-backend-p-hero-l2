import express from "express";
import {
  creatorDashBoard,
  getAdminDashboardData,
  getUserDashboardData,
  myPurchaseMoviesAndSeries,
  getAllTransactions,
  getAllMoviesForAdmin,
  getAllSeriesForAdmin,
  getAllUsersForAdmin,
  updateUserRole,
  deleteUser,
  watchLetter,
  watchLetterHubs,
  deleteWatchLeter,
  chatBot,
} from "./user.controller";
import { authorizeRoles, isAuthenticated } from "../../middleware/middleware";

const router = express.Router();

router
  .route("/admin")
  .get(isAuthenticated, authorizeRoles("ADMIN"), getAdminDashboardData);

router
  .route("/users")
  .get(isAuthenticated, authorizeRoles("ADMIN"), getAllUsersForAdmin);

router
  .route("/all-transactions")
  .get(isAuthenticated, authorizeRoles("ADMIN"), getAllTransactions);

router
  .route("/all-movies-admin")
  .get(isAuthenticated, authorizeRoles("ADMIN"), getAllMoviesForAdmin);

router
  .route("/admin-all-series")
  .get(isAuthenticated, authorizeRoles("ADMIN"), getAllSeriesForAdmin);

router
  .route("/creator")
  .get(isAuthenticated, authorizeRoles("CREATOR"), creatorDashBoard);

router
  .route("/user")
  .get(isAuthenticated, authorizeRoles("USER"), getUserDashboardData);

router
  .route("/puchaed-movies-and-series-by-user")
  .get(isAuthenticated, authorizeRoles("USER"), myPurchaseMoviesAndSeries);

router
  .route("/update-user-role")
  .patch(isAuthenticated, authorizeRoles("ADMIN"), updateUserRole);
router
  .route("/users/:id")
  .delete(isAuthenticated, authorizeRoles("ADMIN"), deleteUser);

router.route("/watch-letter").post(isAuthenticated, watchLetter);
router.route("/watch-letter-hubs").get(isAuthenticated, watchLetterHubs);
router.route("/delete-watch-hub").delete(isAuthenticated, deleteWatchLeter);
router.route("/chat-bot").post(chatBot);

export const userRouter = router;
