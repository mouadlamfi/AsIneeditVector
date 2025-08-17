/**
 * Calculate the distance between two points
 */
export function calculateDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the angle between a line segment and the horizontal axis
 * Returns angle in degrees (0-360)
 */
export function calculateAngle(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  
  // Calculate angle in radians
  let angle = Math.atan2(dy, dx);
  
  // Convert to degrees
  angle = angle * (180 / Math.PI);
  
  // Normalize to 0-360 range
  if (angle < 0) {
    angle += 360;
  }
  
  return angle;
}

/**
 * Calculate measurement between two points
 */
export function calculateMeasurement(point1, point2) {
  return {
    distance: calculateDistance(point1, point2),
    angle: calculateAngle(point1, point2),
    startPoint: point1,
    endPoint: point2
  };
}

/**
 * Format distance for display
 */
export function formatDistance(distance, unit) {
  if (unit === 'cm') {
    return `${distance.toFixed(2)} cm`;
  } else {
    return `${distance.toFixed(2)} in`;
  }
}

/**
 * Format angle for display
 */
export function formatAngle(angle) {
  return `${angle.toFixed(1)}°`;
}

/**
 * Get all measurements for a series of points
 */
export function getMeasurements(points) {
  const measurements = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const measurement = calculateMeasurement(points[i], points[i + 1]);
    measurements.push(measurement);
  }
  
  return measurements;
}

/**
 * Calculate total length of a path
 */
export function calculateTotalLength(points) {
  let totalLength = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    totalLength += calculateDistance(points[i], points[i + 1]);
  }
  
  return totalLength;
}