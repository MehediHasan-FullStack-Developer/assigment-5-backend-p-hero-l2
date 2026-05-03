import { prisma } from "../../lib/prisma";
import { ErrorHandler } from "../../utils/errorHandler";

export const createReviewService = async (
  userId: string,
  payload: {
    rating: number;
    content: string;
    tags?: string[];
    mediaId?: string;
    seriesId?: string;
    parentId?: string;
  },
) => {
  const { rating, content, tags, mediaId, seriesId, parentId } = payload;

  if (!parentId && !mediaId && !seriesId) {
    throw new ErrorHandler(
      "Either media or series must be provided for a new review",
      400,
    );
  }

  let reviewData: any = {
    rating: parentId ? 0 : rating,
    content,
    tags: tags ?? [],
    userId,
  };

  if (mediaId) reviewData.mediaId = mediaId;
  if (seriesId) reviewData.seriesId = seriesId;
  if (parentId) reviewData.parentId = parentId;

  const review = await prisma.review.create({
    data: reviewData,
    include: {
      user: {
        select: { name: true, image: true },
      },
      parent: {
        select: { id: true, content: true },
      },
    },
  });

  return review;
};

export const getReviewsByMedia = async (
  id: string,
  type: "MOVIE" | "SERIES",
) => {
  const whereCondition: any =
    type === "MOVIE" ? { mediaId: id } : { seriesId: id };

  whereCondition.parentId = null;

  const reviews = await prisma.review.findMany({
    where: whereCondition,
    include: {
      user: { select: { name: true, image: true } },
      _count: { select: { likes: true } },
      replies: {
        include: {
          user: { select: { name: true, image: true } },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

export const deleteReviewService = async (id: string, userId: string) => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) throw new ErrorHandler("Review not found", 404);
  if (review.userId !== userId) throw new ErrorHandler("Unauthorized", 403);

  return await prisma.review.delete({ where: { id } });
};

export const getAllReviewsForAdmin = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true } },
      media: { select: { title: true } },
      series: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return reviews;
};

export const updateReviewStatusService = async (
  id: string,
  status: "APPROVED" | "PENDING" | "REJECTED",
) => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) throw new ErrorHandler("Review not found", 404);
  const updatedReview = await prisma.review.update({
    where: { id },
    data: { status },
  });
  return updatedReview;
};

export const myReviewsService = async (userId: string) => {
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      media: { select: { title: true } },
      series: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return reviews;
};

export const getAllMoviewAndSeriesReviewService = async () => {
  const result = await prisma.review.findMany({
    include: {
      media: { select: { title: true } },
      series: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};
