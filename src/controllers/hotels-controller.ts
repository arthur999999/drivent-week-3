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
      return;
    }
    if(!hotelList[0].id) {
      res.sendStatus(404);
      return;
    }
    res.status(200).send( hotelList );
  } catch (error) {
    res.sendStatus(404);
  }
}

export async function hotelWithRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const hotelId = Number(req.params.hotelId);
  
  try {
    const realId = Number(userId);

    const hotelList = await hotelService.getHotels(realId);

    if(hotelList == "payment required") {
      res.sendStatus(402);
      return;
    }
    if(!hotelList[0].id) {
      res.sendStatus(404);
      return;
    }
    
    const hotelRooms = await hotelService.getHotelById(hotelId);
    
    res.status(200).send(hotelRooms);
  } catch (error) {
    res.sendStatus(404);
  }
}
