import pool from '../config/database';

export interface Event {
  id: number;
  name: string;
  description: string | null;
  available_vip: number;
  available_front_row: number;
  available_ga: number;
  created_at: Date;
  updated_at: Date;
}

export class EventRepository {
  /**
   * Get event by ID
   */
  async findById(id: number): Promise<Event | null> {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Update available ticket counts for an event
   * Uses row-level locking to prevent race conditions
   */
  async updateAvailableTickets(
    eventId: number,
    vipChange: number,
    frontRowChange: number,
    gaChange: number,
    client?: any
  ): Promise<Event> {
    const dbClient = client || pool;
    
    const result = await dbClient.query(
      `UPDATE events 
       SET available_vip = available_vip + $1,
           available_front_row = available_front_row + $2,
           available_ga = available_ga + $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [vipChange, frontRowChange, gaChange, eventId]
    );
    
    return result.rows[0];
  }

  /**
   * Get event with row-level lock (FOR UPDATE)
   * Used in transactions to prevent race conditions
   */
  async findByIdForUpdate(eventId: number, client: any): Promise<Event | null> {
    const result = await client.query(
      'SELECT * FROM events WHERE id = $1 FOR UPDATE',
      [eventId]
    );
    return result.rows[0] || null;
  }
}

