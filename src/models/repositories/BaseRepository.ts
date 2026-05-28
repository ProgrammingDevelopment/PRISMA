// BaseRepository — Abstract base class for all repositories
// Implements the Repository Pattern for MVVM data access

export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Abstract base repository providing common CRUD interface.
 * All domain repositories extend this class.
 *
 * @template T - Entity type
 * @template ID - Primary key type (default: number)
 */
export abstract class BaseRepository<T, ID = number> {
  /**
   * Get all entities
   */
  abstract getAll(): Promise<T[]>;

  /**
   * Get entity by ID
   */
  abstract getById(id: ID): Promise<T | null>;

  /**
   * Create a new entity
   */
  abstract create(entity: Partial<T>): Promise<QueryResult<T>>;

  /**
   * Update an existing entity
   */
  abstract update(id: ID, entity: Partial<T>): Promise<QueryResult<T>>;

  /**
   * Delete an entity by ID
   */
  abstract delete(id: ID): Promise<QueryResult<void>>;

  /**
   * Search entities by a query string
   */
  async search(query: string): Promise<T[]> {
    // Default implementation: filter getAll() results
    // Override in subclass for optimized search
    const all = await this.getAll();
    if (!query || query.trim().length === 0) return all;

    const lowerQuery = query.toLowerCase();
    return all.filter(item =>
      JSON.stringify(item).toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get paginated results
   */
  async getPaginated(page: number = 1, pageSize: number = 10): Promise<PaginatedResult<T>> {
    const all = await this.getAll();
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return {
      items,
      total: all.length,
      page,
      pageSize,
    };
  }

  /**
   * Get count of all entities
   */
  async count(): Promise<number> {
    const all = await this.getAll();
    return all.length;
  }

  /**
   * Check if entity exists
   */
  async exists(id: ID): Promise<boolean> {
    const entity = await this.getById(id);
    return entity !== null;
  }
}
