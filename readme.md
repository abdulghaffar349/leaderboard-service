# Leaderboard Service

This is a multi-container service designed to store leaderboard data in an in-memory data structure. It supports two adapters for storing data: **Redis** or a **local in-memory adapter**. The service also includes a cron job to persist data in MongoDB at regular intervals. 

---

## Prerequisites

Before running the service, ensure the following are installed on your system:

- Docker
- Docker Desktop (if running on a local machine)
- To visualize data in MongoDB uncomment the mongo-express service from **docker-compose.yml** 

---

## Configuration

The service supports two adapters for storing leaderboard data:

1. **Redis**: A high-performance in-memory data store.
2. **Local**: A local in-memory adapter.

### Setting the Adapter

You can configure the adapter in one of the following ways:

1. **Environment Variable**: Set the `MEMORY_ADAPTER` environment variable in the `.env` file.
2. **Config File**: Update the `config.js` file directly.

For detailed configuration options, refer to the `config.js` file.

### Environment Variables

A sample `.env.example` file is provided. Rename it to `.env` and update the values as needed.

---

## Running the Service

1. **Clone the repository**.
2. **Update the configuration**:
   - Rename `.env.example` to `.env` and update the values.
   - Modify `config.js` if necessary.
3. **Start the service**:
   Run the following command to start the multi-container service:

   ```bash
   npm run docker