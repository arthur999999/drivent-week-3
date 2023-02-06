import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import dayjs from "dayjs";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createUser, createEnrollmentWithAddress, createTicketType, createTicket, createTicketTypeCustom } from "../factories";
import { createHotels, createRoom } from "../factories/hotels-factory";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when there is no enrollment for given user", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status 404 when there is no ticket for given user", async () => {
      const user = await createUser();
      await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(404);
    });

    it("should respond with status 402 and hotel data", async () => {
      const user = await createUser();
      const enrollment =  await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createHotels();
    
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
   
      expect(response.status).toBe(402);
    });

    it("should respond with status 200 and hotel data", async () => {
      const user = await createUser();
      const enrollment =  await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeCustom(false, true );
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
   
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      ]));
    });

    it("should respond with status 404 hotel not exist", async () => {
      const user = await createUser();
      const enrollment =  await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeCustom(false, true );
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
   
      expect(response.status).toBe(404);
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when there is no enrollment for given user", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status 404 when there is no ticket for given user", async () => {
      const user = await createUser();
      await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
  
      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(404);
    });

    it("should respond with status 402 and hotel data", async () => {
      const user = await createUser();
      const enrollment =  await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createHotels();
    
      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
   
      expect(response.status).toBe(402);
    });

    it("should respond with status 200 and hotel data", async () => {
      const user = await createUser();
      const enrollment =  await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeCustom(false, true );
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      await createRoom(hotel.id);
      
      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
   
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        ])
      }));
    });

    it("should respond with status 404 room not exist", async () => {
      const user = await createUser();
      const enrollment =  await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeCustom(false, true );
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      
      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(404);
    });
  });
});
