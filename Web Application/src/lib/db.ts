import { Pool, QueryResult } from "pg";

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "5432"),
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

// Helper functions to execute queries
export const db = {
  // Execute a query with parameters
  async query(sql: string, params?: any[]): Promise<QueryResult> {
    try {
      return await pool.query(sql, params);
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  // Get a single row
  async getOne(sql: string, params?: any[]) {
    try {
      const result = await pool.query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  // Get multiple rows
  async getMany(sql: string, params?: any[]) {
    try {
      const result = await pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  // Insert data and return the inserted ID (assuming id column is returned)
  async insert(sql: string, params?: any[]) {
    try {
      const result = await pool.query(sql, params);
      return result.rows[0]?.id;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  // Update data and return affected rows
  async update(sql: string, params?: any[]) {
    try {
      const result = await pool.query(sql, params);
      return result.rowCount;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  // Delete data and return affected rows
  async delete(sql: string, params?: any[]) {
    try {
      const result = await pool.query(sql, params);
      return result.rowCount;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },
};
