//admin

import { env } from "../../config/envConfig";
import { Prisma } from "../../generated/prisma";
import { sendResponse } from "../../helper/sendResponse";
import { prisma } from "../../lib/prisma";
import { IMoviePayload } from "../../types/interface/movie/interface.movie";
import { ErrorHandler } from "../../utils/errorHandler";
import { TryCatch } from "../../utils/TryCatch";
import { GoogleGenAI } from "@google/genai";

import {
  chennelService,
  createCategory,
  createChannelService,
  deleteCategoryService,
  deleteChannelService,
  deleteMovieAdminService,
  deleteMovieService,
  getChannelsService,
  // getMovieService,
  getMyMovies,
  getMyMovieService,
  updateAdminMovieService,
  updateCategoryService,
  updateChannelService,
  updateMovieService,
  uploadMovieService,
} from "./movie.service";

export const addCategoryByAdmin = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const payload = req.body;
  const result = await createCategory(payload, userId);
  sendResponse(res, 201, "Category added successfully", result);
});

export const getCategories = TryCatch(async (req, res, next) => {
  const result = await prisma.categories.findMany({});
  sendResponse(res, 200, "Categories fetched successfully", result);
});

export const createChannel = TryCatch(async (req, res, next) => {
  const payload = req.body;
  const file = req?.file as Express.Multer.File;
  const userId = req.user?.id as string;

  const result = await createChannelService(payload, file, userId);

  sendResponse(res, 201, "Channel added successfully", result);
});

export const channels = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;

  const result = await getChannelsService(userId);

  sendResponse(res, 200, "Channels fetched successfully", result);
});

export const updateChannel = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;
  const payload = req.body;

  const file = req?.file as Express.Multer.File;
  const result = await updateChannelService(payload, id, file, userId);

  sendResponse(res, 200, "Channel updated successfully", result);
});

export const deleteChannel = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;
  const result = await deleteChannelService(userId, id);
  sendResponse(res, 201, "Channel delete successfully", result);
});

export const channel = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;

  const result = await chennelService(userId, id);
  sendResponse(res, 200, "Channel goted", result);
});

export const uploadMovie = TryCatch(async (req, res, next) => {
  const userId = req.user?.id;
  const payload = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const thumbnail = files?.thumbnail?.[0]?.path;
  const thumbnailPublicId = files?.thumbnail?.[0]?.filename;

  const poster = files?.poster?.[0]?.path;
  const posterPublicId = files?.poster?.[0]?.filename;

  const video = files?.video?.[0]?.path;
  const videoPublicId = files?.video?.[0]?.filename;

  const moviePayload = {
    ...payload,
    userId: userId as string,
    thumbnail: { url: thumbnail, public_id: thumbnailPublicId },
    poster: { url: poster, public_id: posterPublicId },
    video: { url: video, public_id: videoPublicId },
  };

  const result = await uploadMovieService(moviePayload);

  sendResponse(res, 201, "Movie Uploaded Successfully", result);
});

export const updateMovie = TryCatch(async (req, res) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const updatePayload: Partial<IMoviePayload> & Record<string, any> = {
    ...req.body,
  };

  if (files?.thumbnail?.[0]) {
    updatePayload.thumbnailUrl = files.thumbnail[0].path;
    updatePayload.thumbnailPublicId = files.thumbnail[0].filename;
  }
  if (files?.poster?.[0]) {
    updatePayload.posterUrl = files.poster[0].path;
    updatePayload.posterPublicId = files.poster[0].filename;
  }
  if (files?.video?.[0]) {
    updatePayload.videoUrl = files.video[0].path;
    updatePayload.videoUrlPublicId = files.video[0].filename;
  }

  const result = await updateMovieService(id, updatePayload, userId);
  sendResponse(res, 200, "Movie Updated Successfully", result);
});

//need check
export const deleteMovie = TryCatch(async (req, res) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;
  const result = await deleteMovieService(userId, id);
  sendResponse(res, 200, "Movie deleted successfully", result);
});

export const myMovie = TryCatch(async (req, res) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;
  const result = await getMyMovieService(userId, id);
  sendResponse(res, 200, "Movie got successfully", result);
});

export const myMovies = TryCatch(async (req, res) => {
  const userId = req.user?.id as string;
  const filters = {
    searchTerm: req.query.searchTerm as string,
    page: req.query.page as string,
    limit: req.query.limit as string,
  };
  const result = await getMyMovies(userId, filters);

  sendResponse(res, 200, "My movies got successfully", result);
});

export const allMovies = TryCatch(async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.MediaWhereInput = {
    AND: [],
  };

  if (search) {
    (where.AND as any).push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { genre: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (category && category !== "All") {
    (where.AND as any).push({ genre: { equals: category } });
  }

  const [movies, totalMovies] = await Promise.all([
    prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.media.count({ where }),
  ]);

  let aiSuggestions: string[] = [];

  if (search && page === 1 && movies.length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

      const movieTitles = movies.map((m) => m.title).join(", ");

      const systemInstruction = `
        You are a movie expert. Based on these movies found in our database: [${movieTitles}], 
        and the user search query: "${search}", 
        provide all similar movie titles or trending related topics.
        Return ONLY a plain JSON array of strings.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "user", parts: [{ text: `User Question: ${search}` }] },
        ],
      });
      const text = result.text as string;
      const cleanedText = text.replace(/```json|```/g, "").trim();
      aiSuggestions = JSON.parse(cleanedText);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      aiSuggestions = [];
    }
  }

  sendResponse(res, 200, "Movies fetched successfully", {
    movies,
    aiSuggestions,
    pagination: {
      totalMovies,
      totalPages: Math.ceil(totalMovies / limit),
      currentPage: page,
    },
  });
});

export const movie = TryCatch(async (req, res, next) => {
  const id = req.params?.id as string;

  const movie = await prisma.media.findFirst({
    where: { id },
    include: {
      reviews: {
        where: { parentId: null },
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      _count: {
        select: { purchases: true },
      },
    },
  });

  if (!movie) {
    return next(new ErrorHandler("Movie not found", 400));
  }

  const reviews = movie.reviews || [];
  const totalReviews = reviews.length;

  const totalRatingSum = reviews.reduce(
    (acc, curr) => acc + (curr.rating || 0),
    0,
  );

  const averageRating =
    totalReviews > 0
      ? parseFloat((totalRatingSum / totalReviews).toFixed(1))
      : 0;

  const movieWithRating = {
    ...movie,
    averageRating,
    totalReviews,
  };

  sendResponse(res, 200, "Movie fetched successfully", movieWithRating);
});

export const updateCategory = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const { name } = req.body;
  const result = await updateCategoryService(id, name);
  sendResponse(res, 200, "Category updated successfully", result);
});

export const deleteCategory = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const result = await deleteCategoryService(id);
  sendResponse(res, 200, "Category deleted successfully", result);
});

export const updateMovieAdmin = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const { title, isPremium } = req.body;
  const result = await updateAdminMovieService(id, title, isPremium);
  sendResponse(res, 200, "Movie updated successfully", result);
});

export const deleteMovieAdmin = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const result = await deleteMovieAdminService(id);
  sendResponse(res, 200, "Movie deleted successfully", result);
});

export const latestMovie = TryCatch(async (req, res, next) => {
  const movies = await prisma.media.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      channels: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          purchases: true,
        },
      },
    },
  });

  sendResponse(res, 200, "Latest movies with channels fetched", movies);
});
