export default class LeaderboardAdapter {
    /**
     * Store all gameIds that need to be persisted to the database to overcome scheduler 
     * load and need to reset after syncing.
     * */
    dirty = new Set();     
    gameId = "";

    /**
     * Sets the current game identifier.
     * @param {string} gameId - The game identifier to set.
     * @returns {void}
     */
    setGameId(gameId) {
        throw new Error('Method not implemented.');
    }

    /**
     * Updates the score of a member to a specific value.
     * @param {Object} params - The score update parameters.
     * @param {string} params.userId - The user identifier.
     * @param {number} params.score - The new score value.
     * @param {string|number|Date} params.timestamp - The timestamp of the score update.
     * @returns {Promise<void>}
     */
    async updateMemberScore({ userId, score, timestamp }) {
        throw new Error('Method not implemented.');
    }

    /**
     * Retrieves a limited number of members from the leaderboard.
     * @param {number} [limit=10] - The number of members to retrieve.
     * @returns {Promise<Array<{ member: string, score: number, timestamp: string }>>} - The list of members and their scores.
     */
    async getMembers(limit = 10) {
        throw new Error('Method not implemented.');
    }

    /**
     * Retrieves the total number of members in the leaderboard.
     * @returns {Promise<number>} - The total number of members.
     */
    async getMemberCount() {
        throw new Error('Method not implemented.');
    }

    /**
     * Exports data to the database.
     * @returns {Promise<void>}
     */
    async exportDataToDB() {
        throw new Error('Method not implemented.');
    }

    /**
     * Marks a game as dirty, indicating it needs to be persisted to the database.
     * @param {string} gameId - The game identifier to mark as dirty.
     * @returns {void}
     */
    markDirty(gameId) {
        this.dirty.add(gameId);
    }

    /**
     * Resets the dirty set, clearing all gameIds marked as needing persistence.
     * @returns {void}
     */
    resetDirty() {
        this.dirty.clear();
    }
}