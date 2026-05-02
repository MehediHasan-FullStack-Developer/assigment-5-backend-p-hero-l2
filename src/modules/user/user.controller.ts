import { sendResponse } from "../../helper/sendResponse";
import { TryCatch } from "../../utils/TryCatch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import {
  getAdminDashboardService,
  getProviderDashboardService,
  getPurchasedAll,
  getUserDashboardService,
  getAllTransactionsService,
  getAllMoviesForAdminService,
  getAllSeriesForAdminService,
  getAllUserService,
  updateUserRoleService,
  deleteUserService,
  watchLetterService,
  getWatchLetterHubs,
  getDeleteService,
} from "./user.service";
import { env } from "../../config/envConfig";
import { ErrorHandler } from "../../utils/errorHandler";
import { prisma } from "../../lib/prisma";

export const getAdminDashboardData = TryCatch(async (req, res, next) => {
  const result = await getAdminDashboardService();

  sendResponse(res, 200, "Admin dashboard data retrieved successfully", result);
});

export const creatorDashBoard = TryCatch(async (req, res, next) => {
  const providerId = req.user?.id;

  if (!providerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await getProviderDashboardService(providerId);

  sendResponse(
    res,
    200,
    "Provider dashboard data retrieved successfully",
    result,
  );
});

export const getUserDashboardData = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const result = await getUserDashboardService(userId);

  sendResponse(
    res,
    200,

    "User dashboard data retrieved successfully",
    result,
  );
});

export const myPurchaseMoviesAndSeries = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;

  const result = await getPurchasedAll(userId);
  sendResponse(
    res,
    200,
    "Single user all purchase data retrieved successfully",
    result,
  );
});

export const getAllTransactions = TryCatch(async (req, res) => {
  const { page, limit, searchTerm } = req.query;

  const result = await getAllTransactionsService({
    page: page as string,
    limit: limit as string,
    searchTerm: searchTerm as string,
  });

  sendResponse(res, 200, "All transactions retrieved successfully", result);
});

export const getAllMoviesForAdmin = TryCatch(async (req, res) => {
  const result = await getAllMoviesForAdminService();

  sendResponse(res, 200, "All movies retrieved for admin successfully", result);
});

export const getAllSeriesForAdmin = TryCatch(async (req, res) => {
  const result = await getAllSeriesForAdminService();

  sendResponse(res, 200, "All series retrieved for admin successfully", result);
});

export const getAllUsersForAdmin = TryCatch(async (req, res, next) => {
  const result = await getAllUserService((req.query.search as string) || "");
  sendResponse(res, 200, "All users goted successfully for admin", result);
});

export const updateUserRole = TryCatch(async (req, res) => {
  const { id, role } = req.body;
  const result = await updateUserRoleService(id, role);
  sendResponse(res, 200, "User role updated successfully", result);
});

export const deleteUser = TryCatch(async (req, res) => {
  const id = req.params.id as string;
  await deleteUserService(id);
  sendResponse(res, 200, "User deleted successfully", null);
});

export const watchLetter = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const result = await watchLetterService(userId, req.body);

  sendResponse(res, 201, "Watch Letter added successfully", result);
});

export const watchLetterHubs = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const result = await getWatchLetterHubs(userId);
  sendResponse(res, 200, "Movies and Serieses Goted", result);
});

export const deleteWatchLeter = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const id = req.query?.id as string;
  const result = await getDeleteService(userId, id);
  sendResponse(res, 201, "Watch Unsaved", result);
});


export const chatBot = TryCatch(async (req, res, next) => {
  const { prompt } = req.body;
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const [
    topMedia,
    topSeries,
    latestReviews,
    actualPurchases,
    categories,
    recentPayments,
  ] = await Promise.all([
    prisma.media.findMany({
      // take: 5,
      orderBy: { purchases: { _count: "desc" } },
      include: { _count: { select: { purchases: true } } },
    }),
    prisma.series.findMany({
      orderBy: [{ purchases: { _count: "desc" } }, { createdAt: "desc" }],
      include: {
        seasons: { include: { _count: { select: { episodes: true } } } },
        _count: { select: { purchases: true } },
      },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: { media: true, series: true },
    }),
    prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        media: { select: { title: true } },
        series: { select: { title: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.categories.findMany({ select: { name: true } }),
    prisma.payment.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const dbContext = {
    topMovies: topMedia.map((m) => `${m.title} (Sales: ${m._count.purchases})`),
    topSeries: topSeries.map((s) => {
      const episodes = s.seasons
        .map((sn) => `S${sn.seasonNumber}: ${sn._count.episodes} eps`)
        .join(", ");
      return `${s.title} (Sales: ${s._count.purchases}) - ${episodes}`;
    }),
    purchaseHistory: actualPurchases.map(
      (p) =>
        `${p.user?.name || "Customer"} recently bought ${p.media?.title || p.series?.title || "an item"}`,
    ),
    genres: categories.map((c) => c.name),
    feedback: latestReviews.map(
      (r) => `Review on ${r.media?.title || r.series?.title}: ${r.content}`,
    ),
  };

  const systemInstruction = `
    You are an expert assistant for a professional Cinema Portal.
    
    Database Context:
    - MOVIES: ${JSON.stringify(dbContext.topMovies)}
    - SERIES: ${JSON.stringify(dbContext.topSeries)}
    - RECENT PURCHASES: ${JSON.stringify(dbContext.purchaseHistory)}
    - GENRES: ${JSON.stringify(dbContext.genres)}
    - REVIEWS: ${JSON.stringify(dbContext.feedback)}

    Instructions:
    - Use the database context above to answer user questions accurately.
    - If the answer isn't in the database, use your cinematic knowledge.
    - Be friendly, concise, and helpful.
  `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ text: systemInstruction }] },
      { role: "user", parts: [{ text: `User Question: ${prompt}` }] },
    ],
  });

  res.status(200).json({
    success: true,
    message: result.text,
  });
});
