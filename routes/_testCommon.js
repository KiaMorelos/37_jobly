"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");

const { createToken } = require("../helpers/tokens");
const { application } = require("express");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  //create some test data - Companies, Users, 3 of each.
  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: true,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  const job1 = await Job.create({
    id: expect.any(Number),
    title: "Test Job 1",
    salary: 55000,
    equity: "0.91",
    companyHandle: "c1"
  });

  const job2 = await Job.create({
    id: expect.any(Number),
    title: "Test Job 2",
    salary: 25000,
    equity: "0",
    companyHandle: "c1"
  });

  const job3 = await Job.create({
    id: expect.any(Number),
    title: "Test Job 3",
    salary: null,
    equity: null,
    companyHandle: "c3"
  });

  
  await User.applyForJob("u2", job1.id);

  return [job1.id, job2.id, job3.id]

}

//Begin DB transaction
async function commonBeforeEach() {
  await db.query("BEGIN");
}

//Rollback DB Transaction
async function commonAfterEach() {
  await db.query("ROLLBACK");
}

//End DB connection
async function commonAfterAll() {
  await db.end();
}


const admin = createToken({ username: "u1", isAdmin: true });
const u2Token = createToken({ username: "u2", isAdmin: false });



module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  admin,
  u2Token,
};
