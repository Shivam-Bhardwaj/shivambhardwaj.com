export const roboticsMatchers = {
  toBeValidRobot: (robot: any) => {
    const pass =
      typeof robot.x === 'number' &&
      typeof robot.y === 'number' &&
      typeof robot.angle === 'number' &&
      typeof robot.id === 'number' &&
      ['leader', 'follower', 'scout'].includes(robot.role)

    return {
      message: () => `expected ${robot} to be a valid robot`,
      pass,
    }
  },

  toBeWithinBounds: (
    position: { x: number; y: number },
    bounds: { width: number; height: number }
  ) => {
    const pass =
      position.x >= 0 &&
      position.x <= bounds.width &&
      position.y >= 0 &&
      position.y <= bounds.height

    return {
      message: () =>
        `expected position (${position.x}, ${position.y}) to be within bounds (${bounds.width}x${bounds.height})`,
      pass,
    }
  },

  toHaveValidSensorData: (sensors: any) => {
    const pass =
      Array.isArray(sensors.lidar) &&
      sensors.lidar.length > 0 &&
      typeof sensors.imu.ax === 'number' &&
      typeof sensors.gps.x === 'number'

    return {
      message: () => `expected ${JSON.stringify(sensors)} to have valid sensor data`,
      pass,
    }
  },
}
