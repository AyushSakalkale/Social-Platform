export class SpatialIndex {
  constructor(cellSize = 1) {
    this.grid = new Map();
    this.cellSize = cellSize; // Cell size in kilometers
    this.userLocations = new Map();
  }

  getCellKey(lat, lon) {
    const x = Math.floor(lat / this.cellSize);
    const y = Math.floor(lon / this.cellSize);
    return `${x}:${y}`;
  }

  addUser(userId, lat, lon) {
    // Remove user from old location if exists
    if (this.userLocations.has(userId)) {
      const oldLocation = this.userLocations.get(userId);
      const oldCell = this.getCellKey(oldLocation.lat, oldLocation.lon);
      const cellUsers = this.grid.get(oldCell);
      if (cellUsers) {
        cellUsers.delete(userId);
        // Clean up empty cells
        if (cellUsers.size === 0) {
          this.grid.delete(oldCell);
        }
      }
    }

    // Add user to new location
    const newCell = this.getCellKey(lat, lon);
    if (!this.grid.has(newCell)) {
      this.grid.set(newCell, new Set());
    }
    this.grid.get(newCell).add(userId);
    this.userLocations.set(userId, {lat, lon});
  }

  removeUser(userId) {
    const location = this.userLocations.get(userId);
    if (location) {
      const cell = this.getCellKey(location.lat, location.lon);
      const cellUsers = this.grid.get(cell);
      if (cellUsers) {
        cellUsers.delete(userId);
        if (cellUsers.size === 0) {
          this.grid.delete(cell);
        }
      }
      this.userLocations.delete(userId);
    }
  }

  findNearbyUsers(lat, lon, radius) {
    const nearbyUsers = new Set();
    const cellRadius = Math.ceil(radius / this.cellSize);

    // Calculate the cell bounds for the search area
    const centerX = Math.floor(lat / this.cellSize);
    const centerY = Math.floor(lon / this.cellSize);

    // Search in surrounding cells
    for (let x = centerX - cellRadius; x <= centerX + cellRadius; x++) {
      for (let y = centerY - cellRadius; y <= centerY + cellRadius; y++) {
        const cellKey = `${x}:${y}`;
        const cellUsers = this.grid.get(cellKey);

        if (cellUsers) {
          for (const userId of cellUsers) {
            const userLocation = this.userLocations.get(userId);
            if (userLocation) {
              const distance = this.calculateDistance(
                lat,
                lon,
                userLocation.lat,
                userLocation.lon
              );
              if (distance <= radius) {
                nearbyUsers.add(userId);
              }
            }
          }
        }
      }
    }

    return nearbyUsers;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  getUserLocation(userId) {
    return this.userLocations.get(userId);
  }

  getAllUsers() {
    return Array.from(this.userLocations.keys());
  }

  getCellUsers(lat, lon) {
    const cellKey = this.getCellKey(lat, lon);
    return Array.from(this.grid.get(cellKey) || []);
  }

  clear() {
    this.grid.clear();
    this.userLocations.clear();
  }

  // For debugging and monitoring
  getStats() {
    return {
      totalUsers: this.userLocations.size,
      totalCells: this.grid.size,
      cellSize: this.cellSize,
      cells: Array.from(this.grid.entries()).map(([cell, users]) => ({
        cell,
        userCount: users.size,
      })),
    };
  }
}
