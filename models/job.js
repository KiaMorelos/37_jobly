"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

//Updating a job should never change the ID of a job, nor the company associated with a job.

class Job {

//Create a job from given info, update database, and return new job
//data passed in should be: { title, salary, equity, companyHandle }
//Return created job  { title, salary, equity, companyHandle }
static async create({ title, salary, equity, companyHandle }){
  const result = await db.query(
    `INSERT INTO jobs (title, salary, equity, company_handle) 
        VALUES ($1, $2, $3, $4)
    RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
    [title, salary, equity, companyHandle]
    )

    const job = result.rows[0];
    return job
}

//findAll jobs in the database
static async findAll(optionalFilters = {}){
    const result = await db.query(
        `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs ORDER BY title`
    )

    return result.rows;
}

//get job by id
static async get(id){
    const result = await db.query(
        `SELECT id,
        title,
        salary,
        equity,
        company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`,
        [id]
    )
    
    if(!result.rows[0]){
        throw new NotFoundError(`No job with id of: ${id}`)
    }

    return result.rows[0]
}

//update passed in data on job with correct id
static async update(id, data){

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          salary: "salary",
          equity: "equity",
          companyHandle: "company_handle",
        });

    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id,
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) {
        throw new NotFoundError(`No job with id of: ${id}`)
    };

    return job;
}

//delete job with given id
static async remove(id){
    const result = await db.query(
        `DELETE from jobs WHERE id =$1 RETURNING id`, [id]
    );

    if(!result.rows[0]){
        throw new NotFoundError(`No job with id of ${id}`);
    }
}

}

module.exports = Job;