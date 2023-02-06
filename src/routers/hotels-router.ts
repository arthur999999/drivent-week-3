import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { hotelWithRooms, listAllHotels } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", listAllHotels)
  .get("/:hotelId", hotelWithRooms);

export { hotelsRouter };
