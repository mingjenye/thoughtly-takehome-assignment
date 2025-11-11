import pool from '../config/database';

export interface User {
  id: number;
  name: string;
  tickets: string[];
  created_at: Date;
}

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new user
   */
  async create(data: { name: string }): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (name, tickets) VALUES ($1, $2) RETURNING *',
      [data.name, []]
    );
    return result.rows[0];
  }

  /**
   * Update user's tickets
   */
  async updateTickets(userId: number, tickets: string[]): Promise<User> {
    const result = await pool.query(
      'UPDATE users SET tickets = $1 WHERE id = $2 RETURNING *',
      [tickets, userId]
    );
    return result.rows[0];
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    return result.rows;
  }
}
