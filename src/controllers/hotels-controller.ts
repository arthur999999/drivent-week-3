import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import hotelService from "@/services/hotels-service";

export async function listAllHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;

    const realId = Number(userId);

    const hotelList = await hotelService.getHotels(realId);

    if(hotelList == "payment required") {
      res.sendStatus(402);
    }

    res.status(200).send( hotelList );
  } catch (error) {
    res.sendStatus(404);
  }
}
