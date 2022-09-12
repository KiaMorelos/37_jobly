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

/** Find all matches or Find all jobs, depending on if search is passed.
   *
   * 
   * Optional filters set to empty object by default, so if any optional term is undefined, move on to the next thing, if all option searches are undefined, then simply find all jobs, otherwise use the filters.
   * 
   * title values use pattern matching in the query. it looks for whats inside of the %__% and then uses postgres ILIKE to search without case senstivity.
   * 
   * collect all given values into an array. Use values.length to help create santized query `name =$1` to use with WHERE clauses.
   * 
   * then join all the passed in filters with AND: `WHERE title=$1 AND minSalary >= $2`
   *  
   * Returns [{ id, title, salary, equity, companyHandle }, ...] or an empty array if no matches found. {jobs: [] }
   * */
  static async findAll(optionalFilters = {}){
    let baseQuery =  `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs `;
    const { title, minSalary, hasEquity } = optionalFilters;

    const values = [];
    const wheres = [];

    if(title !== undefined){
     values.push(`%${title}%`);
     wheres.push(`title ILIKE $${values.length}`);
    }

    if(minSalary !== undefined){
     values.push(minSalary);
     wheres.push(`salary >= $${values.length}`);
    }

    if(hasEquity === true) {
     wheres.push(`equity > 0`);
    }

    if(wheres.length > 0){
     baseQuery += ` WHERE ${wheres.join(" AND ")}`;
    }

    baseQuery += ` ORDER BY title`;

    const jobsRes = await db.query(baseQuery, values);

return jobsRes.rows;
}

//get job by int id, like 7
//returns {job : { id, title, salary, equity, companyHandle }} or not found error if there is no job with that id
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

//update passed in data on job with correct int id in the database
//returns {job : { id, title, salary, equity, companyHandle }} or not found error if there is no job with that id
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

//delete job with given id from db
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