import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { listAllHotels } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", listAllHotels);

export { hotelsRouter };
