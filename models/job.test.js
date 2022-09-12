"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

const testJobIds = [];

beforeAll(async () => {
testJobIds.push(...(await commonBeforeAll()))
});
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create job", function(){
    test("create a job works", async function(){
        const newJob = {
            title: "Test Job",
            salary: 40000,
            equity: "0",
            companyHandle: "c1"
        }

        const job = await Job.create(newJob)

    expect(job).toEqual(
        {   id: expect.any(Number),
            title: "Test Job",
            salary: 40000,
            equity: "0",
            companyHandle: "c1"
        }
    );
    })
})

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
      let jobs = await Job.findAll();
      expect(jobs).toEqual([
        {   id: expect.any(Number),
            title: "Test Job 1",
            salary: 55000,
            equity: "0.91",
            companyHandle: "c2"
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
        }
      ]);
    });
  
    test("works with title filter", async function(){
    let jobs = await Job.findAll({title: "1"});
    expect(jobs).toEqual([
      {   id: expect.any(Number),
          title: "Test Job 1",
          salary: 55000,
          equity: "0.91",
          companyHandle: "c2"
      }
    ])
  });

  test("works with minSalary filter", async function(){
    let jobs = await Job.findAll({minSalary: 5000});
    expect(jobs).toEqual([
      {   id: expect.any(Number),
          title: "Test Job 1",
          salary: 55000,
          equity: "0.91",
          companyHandle: "c2"
      },
      {   id: expect.any(Number),
        title: "Test Job 2",
        salary: 25000,
        equity: "0",
        companyHandle: "c1"
    },])
  });

  test("works with hasEquity filter set to true", async function(){
    let jobs = await Job.findAll({hasEquity: true});
    expect(jobs).toEqual([
      {   id: expect.any(Number),
          title: "Test Job 1",
          salary: 55000,
          equity: "0.91",
          companyHandle: "c2"
      },
    ])
  });

  test("works with hasEquity filter set to false", async function(){
    let jobs = await Job.findAll({hasEquity: false});
    expect(jobs).toEqual([
      {   id: expect.any(Number),
        title: "Test Job 1",
        salary: 55000,
        equity: "0.91",
        companyHandle: "c2"
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
    }
    ])
  });

  test("works with all fields in use", async function(){
    let jobs = await Job.findAll({title:"Test Job 1", minSalary: 55000, hasEquity: true});
    expect(jobs).toEqual([
      {   id: expect.any(Number),
          title: "Test Job 1",
          salary: 55000,
          equity: "0.91",
          companyHandle: "c2"
      },
    ])
  });

  test("returns empty array if no results", async function(){
    let jobs = await Job.findAll({title:"Test Knitter", minSalary: 300000, hasEquity: true});
    expect(jobs).toEqual([])
  });
});

/************************************** get a job */

describe("get job by id", function () {
    test("works", async function () {
      let job = await Job.get(testJobIds[0]);
      expect(job).toEqual(
        {   id: testJobIds[0],
            title: "Test Job 1",
            salary: 55000,
            equity: "0.91",
            companyHandle: "c2"
        },
      );
    });

    test("not found if no job with given id", async function () {
        try {
          await Job.get(0);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
});

/************************************** update a job */

describe("update a job", function(){
    const updateData = {
        title: 'Pro Knitter',
        salary: 30000,
        equity: '0.95'
    }
    test("works", async function(){
    
        
        let updatedJob = await Job.update(testJobIds[2], updateData);
        expect(updatedJob).toEqual(
            {
                id: testJobIds[2],
                title: 'Pro Knitter',
                salary: 30000,
                equity: '0.95',
                companyHandle: "c3"
            }
        )
    })

    test("not found if no job with that id", async function () {
        try {
          await Job.update(0, updateData);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
    
      test("bad request with no data", async function () {
        try {
          await Job.update(testJobIds[2], {});
          fail();
        } catch (err) {
          expect(err instanceof BadRequestError).toBeTruthy();
        }
      });
})

/************************************** delete a job */
describe("remove", function () {
    test("works", async function () {
      await Job.remove(testJobIds[0]);
      const res = await db.query(
          "SELECT title FROM jobs WHERE id=$1", [testJobIds[0]]);
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such company", async function () {
      try {
        await Job.remove(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });