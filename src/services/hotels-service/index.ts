import { notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotel-repository";
import ticketService from "../tickets-service";

async function getHotels(userId: number) {
  const tickests = await ticketService.getTicketByUserId(userId);

  if(Object.values(tickests).length === 0) {
    throw notFoundError();
  }

  if(tickests.status == "RESERVED") {
    return "payment required";
  }

  if(tickests.TicketType.isRemote) {
    return "payment required";
  }

  if(!tickests.TicketType.includesHotel) {
    return "payment required";
  }

  return await hotelsRepository.getHotels();
}

const hotelService = {
  getHotels
};

export default hotelService;

