import { prisma } from "@/config";

async function getHotels() {
  return prisma.hotel.findMany();
}

async function getRooms(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId
    },
    include: {
      Rooms: true
    }
  });
}

const hotelsRepository = {
  getHotels,
  getRooms
};

export default hotelsRepository;
