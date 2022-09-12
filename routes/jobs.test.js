"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

const testJobIds = [];

beforeAll(async () => {
testJobIds.push(...(await commonBeforeAll()))
});
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
        jobs:
            [
                {   id: expect.any(Number),
                    title: "Test Job 1",
                    salary: 55000,
                    equity: "0.91",
                    companyHandle: "c1"
                },
                {   id: expect.any(Number),
                    title: "Test Job 2",
                    salary: 25000,
                    equity: "0",
                    companyHandle: "c1"
                },
                {   id: expect.any(Number),
                    title: "Test Job 3",
                    salary: null,
                    equity: null,
                    companyHandle: "c3"
                },
            ],
      });
    });


  test("filtering of jobs ok with has equity", async function(){
    const resp = await request(app).get("/jobs").query({hasEquity: true});
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {   id: expect.any(Number),
            title: "Test Job 1",
            salary: 55000,
            equity: "0.91",
            companyHandle: "c1"
        },
      ]
    });
  });

  test("filtering of jobs ok with minSalary", async function(){
    const resp = await request(app).get("/jobs").query({minSalary: 25000});
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {   id: expect.any(Number),
            title: "Test Job 1",
            salary: 55000,
            equity: "0.91",
            companyHandle: "c1"
        },
        {   id: expect.any(Number),
            title: "Test Job 2",
            salary: 25000,
            equity: "0",
            companyHandle: "c1"
        },
      ]
    });
  });

  test("filtering of jobs ok with title", async function(){
    const resp = await request(app).get("/jobs").query({title: "Test Job 3"});
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {   id: expect.any(Number),
            title: "Test Job 3",
            salary: null,
            equity: null,
            companyHandle: "c3"
        },
      ]
    });
  });

  test("filtering of jobs ok with all filters", async function(){
    const resp = await request(app).get("/jobs").query({title: "1", minSalary:500, hasEquity: true});
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {   id: expect.any(Number),
            title: "Test Job 1",
            salary: 55000,
            equity: "0.91",
            companyHandle: "c1"
        },
      ]
    });
  });

  test("filtering of jobs fails with invalid fields", async function(){
    const resp = await request(app).get("/jobs").query({nonsense: "and more nonsense", hasEquity: false});
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies/:id */

describe("GET /jobs/:id", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
      expect(resp.body).toEqual({
               job: {   
                    id: testJobIds[0],
                    title: "Test Job 1",
                    salary: 55000,
                    equity: "0.91",
                    companyHandle: "c1"
                },  
            });
    });


  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("fails for anon", async function () {
      const resp = await request(app).patch(`/jobs/${testJobIds[0]}`);
      expect(resp.statusCode).toEqual(401);
      expect(resp.body).toEqual({
        "error": {
            "message": "YOU MUST BE AN ADMIN TO DO THAT",
            "status": 401
        }
    })
    });

    test("not found for no such job", async function () {
        const resp = await request(app).patch(`/jobs/0`).send({title: "wont work"}).set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
      });

    test("updating works for admin user", async function(){
        const updateData = {
            title: "pro knitter",
            salary: 15000
        }
        
        const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send(updateData).set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(
           { job: {   
                id: testJobIds[0],
                title: "pro knitter",
                salary: 15000,
                equity: "0.91",
                companyHandle: "c1"
            } 
        })
    });

    test("no update data given will fail", async function(){
        const updateData = {}
        
        const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send(updateData).set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("cannot contain unauthorized fields such as id", async function(){
        const updateData = {
            id: 10000000,
            title: "pro knitter"
        }
        
        const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send(updateData).set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("updating fails for non-admin user", async function(){
        const updateData = {
            title: "pro knitter",
            salary: 15000
        }
        
        const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send(updateData).set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            "error": {
                "message": "YOU MUST BE AN ADMIN TO DO THAT",
                "status": 401
            }
        })
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("ok for admin users", async function () {
        const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: `${testJobIds[0]}` });
    });

    test("not allowed for non-admin users", async function(){
        const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
          "error": {
              "message": "YOU MUST BE AN ADMIN TO DO THAT",
              "status": 401
          }
      })
    });

    test("fails for anon", async function () {
        const resp = await request(app).delete(`/jobs/${testJobIds[0]}`);
        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
          "error": {
              "message": "YOU MUST BE AN ADMIN TO DO THAT",
              "status": 401
          }
      })
      });
  
    test("not found for no such job", async function () {
        const resp = await request(app).delete(`/jobs/0`).set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });
});
