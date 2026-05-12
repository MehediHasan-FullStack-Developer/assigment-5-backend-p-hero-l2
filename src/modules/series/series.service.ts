import { deleteCloudinaryImage } from "../../config/cloudinary";
import { env } from "../../config/envConfig";
import { prisma } from "../../lib/prisma";
import { ISeriesPayload } from "../../types/interface/movie/interface.series";
import { ErrorHandler } from "../../utils/errorHandler";
import { season } from "./series.controller";
import { GoogleGenAI } from "@google/genai";

export const createSeriesSevice = async (
  payload: ISeriesPayload,
  file: Express.Multer.File,
) => {
  const {
    userId,
    title,
    description,
    director,
    cast,
    genre,
    releaseDate,
    price,
    isPremium,
    ...rest
  } = payload;

  const createData: any = {
    ...rest,
    title,
    description,
    director,
    genre,
    releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
    cast: typeof cast === "string" ? JSON.parse(cast) : cast,
    price: parseFloat(price || "0"),
    isPremium: String(isPremium) === "true",
  };

  if (file) createData.posterUrl = file.path;
  if (file) createData.posterUrlPublicId = file.filename;
  if (userId) createData.userId = userId;

  const result = await prisma.series.create({
    data: createData,
  });

  return result;
};

export const updateSeriesService = async (
  id: string,
  payload: Partial<ISeriesPayload> & Record<string, any>,
  userId: string,
  file: Express.Multer.File,
) => {
  const {
    title,
    description,
    director,
    genre,
    releaseDate,
    cast,
    price,
    isPremium,
    poster,
    posterUrlPublicId,
    trailer,
    trailerUrlPublicId,
    ...rest
  } = payload;

  const updateData: any = { ...rest };

  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (director) updateData.director = director;
  if (genre) updateData.genre = genre;
  if (releaseDate) updateData.releaseDate = new Date(releaseDate);
  if (cast)
    updateData.cast = typeof cast === "string" ? JSON.parse(cast) : cast;
  if (price) updateData.price = parseFloat(price);
  if (isPremium) updateData.isPremium = String(isPremium) === "true";

  if (file) updateData.posterUrl = file.path;
  if (file) updateData.posterPublicId = file.filename;

  const series = await prisma.series.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!series) {
    throw new Error("Series not found");
  }

  if (poster) {
    await deleteCloudinaryImage(series.posterUrlPublicId || "");
  }

  const result = await prisma.series.update({
    where: { id, userId },
    data: updateData,
  });

  return result;
};

export const mySeriesesService = async (userId: string) => {
  const serieses = await prisma.series.findMany({
    where: {
      userId,
    },
  });
  return serieses;
};

export const mySeriesService = async (id: string, userId: string) => {
  const series = await prisma.series.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      seasons: {
        include: {
          episodes: true,
        },
        orderBy: {
          seasonNumber: "asc",
        },
      },
    },
  });
  return series;
};

export const deleteSeriesService = async (id: string, userId: string) => {
  const series = await prisma.series.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!series) {
    throw new Error("Series not found");
  }

  await deleteCloudinaryImage(series.posterUrlPublicId || "");
  await deleteCloudinaryImage(series.trailerUrlPublicId || "");

  const result = await prisma.series.delete({
    where: {
      id,
      userId,
    },
  });

  return result;
};

// export const getAllSeriesService = async (filters: any) => {
//   const { searchTerm, category, page = 1, limit = 5 } = filters;

//   const skip = (Number(page) - 1) * Number(limit);
//   const take = Number(limit);

//   const where: any = {
//     AND: [],
//   };

//   if (searchTerm && searchTerm.trim() !== "") {
//     where.OR = [
//       { title: { contains: searchTerm, mode: "insensitive" } },
//       { description: { contains: searchTerm, mode: "insensitive" } },
//       { cast: { hasSome: [searchTerm] } },
//     ];
//   }

//   if (category && category !== "All") {
//     (where.AND as any).push({
//       genre: { equals: category },
//     });
//   }

//   const [result, total] = await Promise.all([
//     prisma.series.findMany({
//       where,
//       skip,
//       take,
//       include: {
//         seasons: {
//           orderBy: { seasonNumber: "asc" },
//           include: {
//             episodes: {
//               orderBy: { episodeNumber: "asc" },
//               select: {
//                 id: true,
//                 title: true,
//                 episodeNumber: true,
//                 videoUrl: true,
//                 duration: true,
//               },
//             },
//           },
//         },
//         user: { select: { name: true } },
//         reviews: {
//           where: { parentId: null },
//           select: { rating: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     }),
//     prisma.series.count({ where }),
//   ]);

//   const seriesWithRating = result.map((series) => {
//     const reviews = series.reviews || [];
//     const totalReviews = reviews.length;

//     const sumRating = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
//     const averageRating =
//       totalReviews > 0 ? parseFloat((sumRating / totalReviews).toFixed(1)) : 0;

//     const { reviews: _, ...seriesData } = series;

//     return {
//       ...seriesData,
//       averageRating,
//       totalReviews,
//     };
//   });

//   return {
//     meta: {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       totalPage: Math.ceil(total / take),
//     },
//     data: seriesWithRating,
//   };
// };

// ✅ UPDATED SERVICE WITH SORTING

export const getAllSeriesService = async (filters: any) => {
  const {
    searchTerm,
    category,
    sort = "price_low_to_high",
    page = 1,
    limit = 12,
  } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    AND: [],
  };

  // ✅ SEARCH
  if (searchTerm && searchTerm.trim() !== "") {
    where.OR = [
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        cast: {
          hasSome: [searchTerm],
        },
      },
    ];
  }

  // ✅ CATEGORY FILTER
  if (category && category !== "All") {
    where.AND.push({
      genre: {
        equals: category,
      },
    });
  }

  // ✅ SORTING
  let orderBy: any = {
    price: "asc",
  };

  if (sort === "price_high_to_low") {
    orderBy = {
      price: "desc",
    };
  }

  if (sort === "latest") {
    orderBy = {
      createdAt: "desc",
    };
  }

  // ✅ FETCH SERIES
  const [result, total] = await Promise.all([
    prisma.series.findMany({
      where,
      skip,
      take,

      include: {
        seasons: {
          orderBy: {
            seasonNumber: "asc",
          },

          include: {
            episodes: {
              orderBy: {
                episodeNumber: "asc",
              },
            },
          },
        },

        user: {
          select: {
            name: true,
          },
        },

        reviews: {
          where: {
            parentId: null,
          },

          select: {
            rating: true,
          },
        },
      },

      orderBy,
    }),

    prisma.series.count({
      where,
    }),
  ]);

  // ✅ AI SUGGESTIONS
  let aiSuggestions: string[] = [];

  if (searchTerm && result.length > 0) {
    try {
      const ai = new GoogleGenAI({
        apiKey: env.GEMINI_API_KEY,
      });

      const seriesTitles = result.map((s) => s.title).join(", ");

      const prompt = `
        You are a TV show expert.

        Based on these series:
        [${seriesTitles}]

        And user search:
        "${searchTerm}"

        Suggest 5 similar trending TV shows.

        Return ONLY a JSON array of strings.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },

          {
            role: "user",
            parts: [
              {
                text: `User Question: ${searchTerm}`,
              },
            ],
          },
        ],
      });

      const text = response.text as string;

      aiSuggestions = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (error) {
      console.error("AI Suggestion Error:", error);

      aiSuggestions = [];
    }
  }

  // ✅ RETURN RESPONSE
  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },

    data: result,

    aiSuggestions,
  };
};

export const getSeriesServis = async (id: string) => {
  const series = await prisma.series.findUnique({
    where: {
      id,
    },
    include: {
      seasons: {
        orderBy: {
          seasonNumber: "asc",
        },
        include: {
          episodes: {
            orderBy: {
              episodeNumber: "asc",
            },
          },
        },
      },
      reviews: {
        where: {
          parentId: null,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!series) return null;

  const reviews = series.reviews || [];
  const totalReviews = reviews.length;

  const totalRatingSum = reviews.reduce(
    (acc, curr) => acc + (curr.rating || 0),
    0,
  );

  const averageRating =
    totalReviews > 0
      ? parseFloat((totalRatingSum / totalReviews).toFixed(1))
      : 0;

  return {
    ...series,
    averageRating,
    totalReviews,
  };
};

export const createSession = async (
  payload: { seasonNumber: string | number; title?: string; seriesId: string },
  file?: Express.Multer.File,
) => {
  const { title, seasonNumber, seriesId } = payload;

  if (!seriesId) {
    throw new Error("seriesId is required to create a season");
  }

  const result = await prisma.season.create({
    data: {
      title: title ?? null,
      seasonNumber: seasonNumber ? Number(seasonNumber) : 1,
      seriesId: seriesId,
      posterUrl: file?.path || null,
      posterUrlPublicId: file?.filename || null,
    },
  });

  return result;
};

export const updateSeasonService = async (
  id: string,
  payload: Partial<{ title?: string; seasonNumber?: number }>,
  file?: Express.Multer.File,
) => {
  const season = await prisma.season.findUnique({
    where: { id },
  });

  if (!season) {
    throw new ErrorHandler("Season not found", 404);
  }

  const updateData: Partial<{
    title?: string;
    seasonNumber?: number;
    posterUrl: string;
    posterUrlPublicId: string;
  }> = {};

  if (payload.title) updateData.title = payload.title;
  if (payload.seasonNumber) updateData.seasonNumber = payload.seasonNumber;

  if (file) {
    updateData.posterUrl = file.path;
    updateData.posterUrlPublicId = file.filename;
    await deleteCloudinaryImage(season.posterUrlPublicId || "");
  }

  const result = await prisma.season.update({
    where: { id },
    data: updateData,
  });

  return result;
};

export const getAllSeasonsService = async (seriesId: string) => {
  const seasons = await prisma.season.findMany({
    where: { seriesId },
    orderBy: { seasonNumber: "asc" },
    include: {
      episodes: {
        orderBy: { episodeNumber: "asc" },
        select: {
          id: true,
          title: true,
          episodeNumber: true,
          videoUrl: true,
          duration: true,
        },
      },
    },
  });

  return seasons;
};

export const getSeasonService = async (seasonId: string) => {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    include: { episodes: true },
  });
  return season;
};

export const createEpisode = async (
  payload: {
    title: string;
    episodeNumber: string | number;
    description?: string;
    duration: number;
    seasonId: string;
  },
  file: Express.Multer.File,
) => {
  const { episodeNumber, title, description, duration, seasonId } = payload;

  const episodeNum = Number(episodeNumber);
  const createData: any = {
    title,
    description,
    episodeNumber: episodeNum,
    seasonId,
    duration: duration ? Number(duration) : 0,
  };

  const { path, filename } = file;
  const result = await prisma.episode.create({
    data: {
      ...createData,
      videoUrl: path,
      videoPublicId: filename,
    },
  });
  return result;
};

export const updateEpisodeService = async (
  id: string,
  title: string,
  user: { id: string; role: string },

  file: Express.Multer.File,
) => {
  const episode = await prisma.episode.findUnique({
    where: { id },
  });

  if (!episode) {
    throw new ErrorHandler("Episode not found", 404);
  }

  const season = await prisma.season.findUnique({
    where: { id: episode.seasonId },
  });

  if (!season) {
    throw new ErrorHandler("Season not found", 404);
  }

  const series = await prisma.series.findUnique({
    where: { id: season.seriesId },
  });

  if (!series) {
    throw new ErrorHandler("Series not found", 404);
  }

  const isAdmin = user.role === "ADMIN";
  const isCreator = series.userId === user.id;

  if (!isAdmin && !isCreator) {
    throw new ErrorHandler(
      "You don't have permission to edit this episode",
      403,
    );
  }

  if (file) {
    await deleteCloudinaryImage(episode.videoPublicId);
  }

  const updatedEpisode = await prisma.episode.update({
    where: { id: episode.id },
    data: {
      title: title ?? episode.title,
      videoUrl: file.path ?? episode.videoUrl,
      videoPublicId: file.filename,
    },
  });

  return updatedEpisode;
};

export const deleteEpisodeService = async (id: string) => {
  const episode = await prisma.episode.findUnique({
    where: { id },
  });
  if (!episode) {
    throw new ErrorHandler("Episode not found", 404);
  }

  await deleteCloudinaryImage(episode.videoPublicId);
  const result = await prisma.episode.delete({
    where: { id },
  });
  return result;
};

export const updateSeriesAdminService = async (
  id: string,
  isPremium: boolean,
) => {
  return await prisma.series.update({
    where: { id },
    data: { isPremium },
  });
};

export const deleteSeriesAdminService = async (id: string) => {
  const seasons = await prisma.season.findMany({
    where: {
      seriesId: id,
    },
  });

  const seasonIds = seasons.map((season) => season.id);

  const allEpisodes = await prisma.episode.findMany({
    where: {
      seasonId: { in: seasonIds },
    },
  });

  const episodeIds = allEpisodes.map((episode) => episode.id);

  const result = await prisma.$transaction(async (tx) => {
    const deleteSeries = await tx.series.delete({
      where: {
        id,
      },
    });

    const deleteAllSeason = await tx.season.deleteMany({
      where: {
        id: { in: seasonIds },
      },
    });

    const deleteAllEpisodes = await tx.episode.deleteMany({
      where: {
        id: { in: episodeIds },
      },
    });

    return {
      deleteSeries,
      deleteAllSeason,
      deleteAllEpisodes,
    };
  });

  return result;
};
