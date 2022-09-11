"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdminUser } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
//json schemas came from: https://jsonschema.net/
//NOTE: MUST SIGN UP FOR AN ACCOUNT TO GENERATE SCHEMAS

const router = new express.Router();

//get general list of jobs
router.get("/", async function (req, res, next) {
    try {
      const jobs = await Job.findAll();
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });

  //get job by id
router.get("/:id", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });


//add a new job - {
//"title": "Professional Knitter and Yarn Artist",
//"salary": 70000,
//"equity": "0.0913",
//"companyHandle": "owen-newton"
//}

router.post("/", ensureAdminUser, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
});

//Update an existing job. Provide an id, and at least a title to update a job posting
//{title: Profession Crocheter }
router.patch("/:id", ensureAdminUser, async function(req, res, next){
  try {
    
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.status(200).json({ job });
  } catch (err) {
    return next(err);
  }})

//Delete job based on id in request 
router.delete("/:id", ensureAdminUser, async function (req, res, next){
    try {
        const job = await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
      } catch (err) {
        return next(err);
      }
})

module.exports = router;