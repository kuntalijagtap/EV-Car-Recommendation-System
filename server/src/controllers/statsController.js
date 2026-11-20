import { Brand } from '../models/Brand.js';
import { ChargingStation } from '../models/ChargingStation.js';
import { EV } from '../models/EV.js';
import { Review } from '../models/Review.js';

export async function getHomeStats(req, res, next) {
  try {
    const [evs, brands, stations, reviews] = await Promise.all([
      EV.countDocuments(),
      Brand.countDocuments(),
      ChargingStation.countDocuments(),
      Review.countDocuments({ moderationStatus: 'published' }),
    ]);

    res.status(200).json({
      success: true,
      data: { evs, brands, stations, reviews },
    });
  } catch (error) {
    next(error);
  }
}