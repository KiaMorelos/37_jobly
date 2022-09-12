"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all matches or Find all companies, depending on if search is passed.
   *
   * 
   * Optional filters set to empty object by default, so if any optional term is undefined, move on to the next thing, if all option searches are undefined, then simply find all companies, otherwise use the filters.
   * 
   * Make sure that minEmployees in not greater than maxEmployees
   * name values use pattern matching in the query. it looks for whats inside of the %__% and then uses postgres ILIKE to search without case senstivity.
   * 
   * collect all given values into an array. Use values.length to help create santized query `name =$1` to use with WHERE clauses.
   * 
   * then join all the passed in filters with AND: `WHERE name=$1 AND maxEmployees=$2`
   *  
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...] or an empty array if no matches found. {companies: [] }
   * */

  static async findAll(optionalFilters = {}) {
    let baseQuery = `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies`;

           const { name, minEmployees, maxEmployees } = optionalFilters;

           if(minEmployees > maxEmployees){
            throw new BadRequestError("Minimum number of employees must not be greater than value of max number employees");
           }

           const values = [];
           const wheres = [];

           if(name !== undefined){
            values.push(`%${name}%`);
            wheres.push(`name ILIKE $${values.length}`);
           }

           if(minEmployees !== undefined){
            values.push(minEmployees);
            wheres.push(`num_employees >= $${values.length}`);
           }

           if(maxEmployees !== undefined) {
            values.push(maxEmployees);
            wheres.push(`num_employees <= $${values.length}`);
           }

           if(wheres.length > 0){
            baseQuery += ` WHERE ${wheres.join(" AND ")}`;
           }

           baseQuery += ` ORDER BY name`;

           const companiesRes = await db.query(baseQuery, values);

    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    const jobs = await db.query(
      `SELECT id, title, salary, equity
       FROM jobs
       WHERE company_handle = $1
       ORDER BY id`,
    [handle],
);

    company.jobs = jobs.rows;

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
