import { deleteCloudinaryImage } from "../../config/cloudinary";
import { prisma } from "../../lib/prisma";
import { IMoviePayload } from "../../types/interface/movie/interface.movie";
import { ErrorHandler } from "../../utils/errorHandler";

export const createCategory = async (
  payload: { name: string },
  userId: string,
) => {
  const formattedName = payload.name.trim().toUpperCase();

  const categoryName = await prisma.categories.findFirst({
    where: {
      name: formattedName,
    },
  });

  if (categoryName) {
    throw new ErrorHandler("Category already exists", 400);
  }

  const category = await prisma.categories.create({
    data: { name: formattedName, userId },
  });
  if (!category) {
    throw new ErrorHandler("Category not created", 400);
  }
  return category;
};

export const createChannelService = async (
  payload: { name: string; location: string; description: string },
  file: Express.Multer.File,
  userId: string,
) => {
  const existingChannel = await prisma.channel.findFirst({
    where: {
      name: payload.name,
    },
  });

  if (existingChannel) {
    throw new ErrorHandler("CHannel name already created", 400);
  }

  const channel = await prisma.channel.create({
    data: {
      name: payload.name,
      location: payload.location,
      description: payload.description,
      image: file?.path,
      userId,
    },
  });
  if (!channel) {
    throw new ErrorHandler("Channel not created", 400);
  }

  return channel;
};

export const getChannelsService = async (userId: string) => {
  const channels = await prisma.channel.findMany({
    where: {
      userId,
    },
  });
  return channels;
};

export const updateChannelService = async (
  payload: { name: string; location: string; description: string },
  id: string,
  file: Express.Multer.File,
  userId: string,
) => {
  const isChannelExist = await prisma.channel.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!isChannelExist) {
    throw new ErrorHandler("Channel not created", 400);
  }

  if (isChannelExist.name === payload.name) {
    throw new ErrorHandler("Channel name already exist", 400);
  }

  let imageUrl = isChannelExist.image;

  if (file) {
    imageUrl = file.path;
  }

  const channel = await prisma.channel.update({
    where: {
      id,
      userId,
    },
    data: {
      name: payload.name,
      location: payload.location,
      description: payload.description,
      image: imageUrl,
    },
  });
  if (!channel) {
    throw new ErrorHandler("Channel not updated", 400);
  }

  return channel;
};

export const deleteChannelService = async (userId: string, id: string) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!channel) {
    throw new ErrorHandler("Delete channel not found", 400);
  }

  const deleteChannel = await prisma.channel.delete({
    where: {
      id,
      userId,
    },
  });

  if (!deleteChannel) {
    throw new ErrorHandler("CHannel delete problem", 404);
  }

  return deleteChannel;
};

export const chennelService = async (userId: string, id: string) => {
  const channel = await prisma.channel.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!channel) {
    throw new ErrorHandler("Channel not found", 400);
  }

  return channel;
};

export const uploadMovieService = async (payload: IMoviePayload) => {
  const result = await prisma.media.create({
    data: {
      title: payload.title,
      description: payload.description,
      genre: payload.genre,
      director: payload.director,

      cast: JSON.parse(payload.cast),
      duration: payload.duration,
      releaseDate: new Date(payload.releaseDate),
      price: parseFloat(payload.price),

      isPremium: String(payload.isPremium) === "true",

      thumbnailUrl: payload.thumbnail.url,
      thumbnailPublicId: payload.thumbnail.public_id,

      posterUrl: payload.poster.url,
      posterPublicId: payload.poster.public_id,

      videoUrl: payload.video.url,
      videoUrlPublicId: payload.video.public_id,

      ...(payload.userId && { userId: payload.userId }),
    },
  });

  return result;
};

export const updateMovieService = async (
  id: string,
  payload: Partial<IMoviePayload> & Record<string, any>,
  userId: string,
) => {
  const {
    title,
    description,
    director,
    genre,
    thumbnail,
    poster,
    video,
    cast,
    duration,
    price,
    releaseDate,
    isPremium,
    ...rest
  } = payload;

  const movie = await prisma.media.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (thumbnail) {
    await deleteCloudinaryImage(movie?.thumbnailPublicId || "");
  }

  if (poster) {
    await deleteCloudinaryImage(movie?.posterPublicId || "");
  }

  if (video) {
    await deleteCloudinaryImage(movie?.videoUrlPublicId || "");
  }

  const updateData: any = { ...rest };

  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (director) updateData.director = director;
  if (genre) updateData.genre = genre;
  if (cast) updateData.cast = JSON.parse(cast);
  if (duration) updateData.duration = duration;
  if (price) updateData.price = parseFloat(price);
  if (releaseDate) updateData.releaseDate = new Date(releaseDate);
  if (isPremium) updateData.isPremium = String(isPremium) === "true";

  if (thumbnail) {
    updateData.thumbnailUrl = thumbnail.url;
    updateData.thumbnailPublicId = thumbnail.public_id;
  }
  if (poster) {
    updateData.posterUrl = poster.url;
    updateData.posterPublicId = poster.public_id;
  }
  if (video) {
    updateData.videoUrl = video.url;
    updateData.videoUrlPublicId = video.public_id;
  }

  const result = await prisma.media.update({
    where: { id, userId },
    data: updateData,
  });

  return result;
};

export const deleteMovieService = async (userId: string, id: string) => {
  const movie = await prisma.media.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!movie) {
    throw new ErrorHandler("Delete movie not found", 400);
  }
  if (movie.thumbnailPublicId) {
    await deleteCloudinaryImage(movie.thumbnailPublicId);
  }
  if (movie.posterPublicId) {
    await deleteCloudinaryImage(movie.posterPublicId);
  }
  if (movie.videoUrlPublicId) {
    await deleteCloudinaryImage(movie.videoUrlPublicId);
  }
  if (movie.trailerUrlPublicId) {
    await deleteCloudinaryImage(movie.trailerUrlPublicId);
  }

  const deleteMovie = await prisma.media.delete({
    where: {
      id,
      userId,
    },
  });

  return deleteMovie;
};

export const getMyMovieService = async (userId: string, id: string) => {
  const movie = await prisma.media.findUnique({
    where: {
      id,
      userId,
    },
  });
  return movie;
};

export const getMyMovies = async (
  userId: string,
  filters: { searchTerm?: string; page?: string; limit?: string },
) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    userId: userId,
  };

  if (filters.searchTerm) {
    whereCondition.OR = [
      {
        title: {
          contains: filters.searchTerm,
          mode: "insensitive",
        },
      },
      {
        genre: {
          contains: filters.searchTerm,
          mode: "insensitive",
        },
      },
      {
        cast: {
          hasSome: [filters.searchTerm],
        },
      },
      {
        director: {
          contains: filters.searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const movies = await prisma.media.findMany({
    where: whereCondition,
    skip: skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      genre: true,
      cast: true,
      director: true,
      thumbnailUrl: true,
      posterUrl: true,
      videoUrl: true,
      trailerUrl: true,
      price: true,
      isPremium: true,
      createdAt: true,
      userId: true,
    },
  });

  const total = await prisma.media.count({
    where: whereCondition,
  });

  const cleanMovies = JSON.parse(JSON.stringify(movies));

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: cleanMovies,
  };
};

export const updateCategoryService = async (id: string, name: string) => {
  const isExist = await prisma.categories.findUnique({
    where: { id },
  });
  if (!isExist) {
    throw new Error("Category not found!");
  }

  return await prisma.categories.update({
    where: { id: isExist.id },
    data: { name },
  });
};

export const deleteCategoryService = async (id: string) => {
  return await prisma.categories.delete({
    where: { id },
  });
};

export const updateAdminMovieService = async (
  id: string,
  title: string,
  isPremium: boolean,
) => {
  const isExist = await prisma.media.findUnique({
    where: { id },
  });
  if (!isExist) {
    throw new Error("Movie not found!");
  }
  return await prisma.media.update({
    where: { id: isExist.id },
    data: {
      title,
      isPremium,
    },
  });
};

export const deleteMovieAdminService = async (id: string) => {
  return await prisma.media.delete({
    where: { id },
  });
};
