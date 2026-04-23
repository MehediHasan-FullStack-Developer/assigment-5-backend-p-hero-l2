import { sendResponse } from "../../helper/sendResponse";
import { ISeriesPayload } from "../../types/interface/movie/interface.series";
import { TryCatch } from "../../utils/TryCatch";
import {
  createEpisode,
  createSeriesSevice,
  createSession,
  deleteSeriesService,
  getAllSeasonsService,
  getAllSeriesService,
  mySeriesesService,
  mySeriesService,
  updateSeasonService,
  updateSeriesService,
  getSeasonService,
  getSeriesServis,
  updateSeriesAdminService,
  deleteSeriesAdminService,
  updateEpisodeService,
  deleteEpisodeService,
} from "./series.service";

export const createSeries = TryCatch(async (req, res, next) => {
  const userId = req.user?.id;
  const file = req.file as Express.Multer.File;

  const seriesData: ISeriesPayload = {
    ...req.body,
    userId,
  };
  const result = await createSeriesSevice(seriesData, file);
  sendResponse(res, 201, "Series Created Successfully", result);
});

export const updateSeries = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const file = req.file as Express.Multer.File;
  const userId = req.user?.id as string;

  const updatePayload: Partial<ISeriesPayload> = { ...req.body };

  const result = await updateSeriesService(id, updatePayload, userId, file);

  sendResponse(res, 200, "Series Updated Successfully", result);
});

export const mySerieses = TryCatch(async (req, res, next) => {
  const userId = req.user?.id as string;
  const result = await mySeriesesService(userId);
  sendResponse(res, 200, "My Serieses Retrieved Successfully", result);
});

export const mySeries = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const userId = req.user?.id as string;
  const result = await mySeriesService(id, userId);
  sendResponse(res, 200, "My Series Retrieved Successfully", result);
});

export const deleteSeries = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const userId = req.user?.id as string;
  const result = await deleteSeriesService(id, userId);
  sendResponse(res, 200, "Series Deleted Successfully", result);
});

export const getAllSeries = TryCatch(async (req, res, next) => {
  const filters = req.query;
  const result = await getAllSeriesService(filters);
  sendResponse(res, 200, "All Series Retrieved Successfully", result);
});

export const getSeries = TryCatch(async (req, res, next) => {
  const id = req.params?.id as string;
  const result = await getSeriesServis(id);
  sendResponse(res, 200, "Single Serie Retrieved Successfully", result);
});

// session
export const uploadSession = TryCatch(async (req, res, next) => {
  const payload = req.body;
  const file = req.file as Express.Multer.File;
  const result = await createSession(payload, file);
  sendResponse(res, 201, "Session Created Successfully", result);
});

export const updateSeason = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const file = req.file as Express.Multer.File;
  const payload: Partial<{ title?: string; seasonNumber?: number }> = req.body;
  const result = await updateSeasonService(id, payload, file);
  sendResponse(res, 200, "Session Updated Successfully", result);
});

export const allSeasons = TryCatch(async (req, res, next) => {
  const seriesId = req.params.seriesId as string;
  const result = await getAllSeasonsService(seriesId);
  sendResponse(res, 200, "All Seasons Retrieved Successfully", result);
});

export const season = TryCatch(async (req, res, next) => {
  const seasonId = req.params.seasonid as string;
  const result = await getSeasonService(seasonId);
  sendResponse(res, 200, "Season Retrieved Successfully", result);
});

export const uploadEpisode = TryCatch(async (req, res, next) => {
  const payload = req.body;

  const file = req.file as Express.Multer.File;

  const result = await createEpisode(payload, file);

  sendResponse(res, 200, "Episode published", result);
});

export const updateEpisode = TryCatch(async (req, res, next) => {
  const { id, title } = req.body;
  const user = req?.user as any;
  const file = req.file as Express.Multer.File;

  const result = await updateEpisodeService(id, title, user, file);

  sendResponse(res, 200, "Episode updated successfully", result);
});

export const deleteEpisode = TryCatch(async (req, res, next) => {
  const id = req.params.id as string;
  const result = await deleteEpisodeService(id);
  sendResponse(res, 200, "Episode deleted successfully", result);
});
export const allEpisodes = TryCatch(async (req, res, next) => {
  sendResponse(
    res,
    200,
    "Episode retrieval functionality will be implemented in the future",
    null,
  );
});

export const updateSeriesAdmin = TryCatch(async (req, res, next) => {
  const { id, isPremium } = req.body;

  const result = await updateSeriesAdminService(id, isPremium);

  sendResponse(res, 201, "Update sereis premium status", result);
});

export const deleteSeriesAdmin = TryCatch(async (req, res, next) => {
  const id = req.body?.id as string;

  const result = await deleteSeriesAdminService(id);

  sendResponse(res, 201, "Delete sereis", result);
});
