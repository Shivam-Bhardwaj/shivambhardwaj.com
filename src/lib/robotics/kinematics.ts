import { logger } from '@/lib/logging';
import { config } from '@/config';

// Core types for robotics calculations
export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface Pose2D extends Point2D {
  theta: number; // orientation in radians
}

export interface Pose3D extends Point3D {
  roll: number;
  pitch: number;
  yaw: number;
}

export interface JointState {
  position: number;
  velocity: number;
  acceleration: number;
  torque: number;
}

export interface DHParameters {
  a: number;      // link length
  alpha: number;  // link twist
  d: number;      // link offset
  theta: number;  // joint angle
}

/**
 * Forward Kinematics Calculator for Serial Manipulators
 */
export class ForwardKinematics {
  private dhParameters: DHParameters[];
  private precision: number;

  constructor(dhParameters: DHParameters[]) {
    this.dhParameters = dhParameters;
    this.precision = config.robotics.calculators.precision;
    logger.info('ForwardKinematics initialized', { 
      dofCount: dhParameters.length,
      precision: this.precision 
    });
  }

  /**
   * Calculate transformation matrix using DH parameters
   */
  private dhTransform(params: DHParameters): number[][] {
    const { a, alpha, d, theta } = params;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const ca = Math.cos(alpha);
    const sa = Math.sin(alpha);

    return [
      [ct, -st * ca, st * sa, a * ct],
      [st, ct * ca, -ct * sa, a * st],
      [0, sa, ca, d],
      [0, 0, 0, 1]
    ];
  }

  /**
   * Multiply two 4x4 transformation matrices
   */
  private multiplyMatrices(a: number[][], b: number[][]): number[][] {
    const result = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i]![j]! += a[i]![k]! * b[k]![j]!;
        }
      }
    }
    return result;
  }

  /**
   * Calculate forward kinematics for given joint angles
   */
  calculateEndEffectorPose(jointAngles: number[]): Pose3D {
    if (jointAngles.length !== this.dhParameters.length) {
      throw new Error('Joint angles count must match DH parameters count');
    }

    logger.debug('Calculating forward kinematics', { jointAngles });

    // Start with identity matrix
    let transform = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    // Apply each joint transformation
    for (let i = 0; i < this.dhParameters.length; i++) {
      const params: DHParameters = { ...(this.dhParameters[i] as DHParameters), theta: jointAngles[i]! };
      const dhMatrix = this.dhTransform(params);
      transform = this.multiplyMatrices(transform, dhMatrix);
    }

    // Extract position and orientation
  const x = Number(transform[0]![3]!.toFixed(this.precision));
  const y = Number(transform[1]![3]!.toFixed(this.precision));
  const z = Number(transform[2]![3]!.toFixed(this.precision));

    // Extract Euler angles from rotation matrix
  const roll = Math.atan2(transform[2]![1]!, transform[2]![2]!);
  const pitch = Math.atan2(-transform[2]![0]!, Math.sqrt(transform[2]![1]! ** 2 + transform[2]![2]! ** 2));
  const yaw = Math.atan2(transform[1]![0]!, transform[0]![0]!);

    const result: Pose3D = {
      x,
      y,
      z,
      roll: Number(roll.toFixed(this.precision)),
      pitch: Number(pitch.toFixed(this.precision)),
      yaw: Number(yaw.toFixed(this.precision))
    };

    logger.info('Forward kinematics calculated', { result });
    return result;
  }

  /**
   * Calculate Jacobian matrix for velocity analysis
   */
  calculateJacobian(jointAngles: number[]): number[][] {
    const jacobian = Array(6).fill(null).map(() => Array(jointAngles.length).fill(0));
    const endEffector = this.calculateEndEffectorPose(jointAngles);
    
    // Calculate partial derivatives numerically
    const epsilon = 1e-6;
    
    for (let i = 0; i < jointAngles.length; i++) {
      const jointAnglesPlus = [...jointAngles];
      jointAnglesPlus[i]! += epsilon;
      
      const posePlus = this.calculateEndEffectorPose(jointAnglesPlus);
      
      // Linear velocity components
  jacobian[0]![i]! = (posePlus.x - endEffector.x) / epsilon;
  jacobian[1]![i]! = (posePlus.y - endEffector.y) / epsilon;
  jacobian[2]![i]! = (posePlus.z - endEffector.z) / epsilon;
      
      // Angular velocity components
  jacobian[3]![i]! = (posePlus.roll - endEffector.roll) / epsilon;
  jacobian[4]![i]! = (posePlus.pitch - endEffector.pitch) / epsilon;
  jacobian[5]![i]! = (posePlus.yaw - endEffector.yaw) / epsilon;
    }

  logger.debug('Jacobian calculated', { jacobianSize: `${jacobian.length}x${jacobian[0]!.length}` });
    return jacobian;
  }
}

/**
 * Inverse Kinematics Calculator using iterative methods
 */
export class InverseKinematics {
  private fk: ForwardKinematics;
  private maxIterations: number = 100;
  private tolerance: number = 1e-6;
  private precision: number;

  constructor(dhParameters: DHParameters[]) {
    this.fk = new ForwardKinematics(dhParameters);
    this.precision = config.robotics.calculators.precision;
    logger.info('InverseKinematics initialized');
  }

  /**
   * Solve inverse kinematics using Newton-Raphson method
   */
  solve(targetPose: Pose3D, initialGuess?: number[]): { 
    success: boolean; 
    jointAngles: number[]; 
    error: number; 
    iterations: number; 
  } {
    logger.info('Starting inverse kinematics calculation', { targetPose });

    const dofCount = this.fk['dhParameters'].length;
  // Use a mutable working copy but avoid shadowing prefer-const lint; we intentionally mutate this array
  const jointAngles: number[] = (initialGuess ? [...initialGuess] : Array(dofCount).fill(0));
    let iterations = 0;
    let error = Infinity;

    while (iterations < this.maxIterations && error > this.tolerance) {
      const currentPose = this.fk.calculateEndEffectorPose(jointAngles);
      const jacobian = this.fk.calculateJacobian(jointAngles);
      
      // Calculate pose error
      const poseError = [
        targetPose.x - currentPose.x,
        targetPose.y - currentPose.y,
        targetPose.z - currentPose.z,
        this.normalizeAngle(targetPose.roll - currentPose.roll),
        this.normalizeAngle(targetPose.pitch - currentPose.pitch),
        this.normalizeAngle(targetPose.yaw - currentPose.yaw)
      ];

      error = Math.sqrt(poseError.reduce((sum, err) => sum + err * err, 0));

      if (error <= this.tolerance) {
        break;
      }

      // Calculate pseudo-inverse of Jacobian
  // Compute pseudo-inverse directly (transpose computed internally) to avoid unused variable
  const jacobianPinv = this.pseudoInverse(jacobian);
      
      // Update joint angles
      const deltaJoints = this.multiplyMatrixVector(jacobianPinv, poseError);
      
      for (let i = 0; i < jointAngles.length; i++) {
        jointAngles[i]! += deltaJoints[i]! * 0.5; // Damping factor
        jointAngles[i] = Number(jointAngles[i]!.toFixed(this.precision));
      }

      iterations++;
    }

    const result = {
      success: error <= this.tolerance,
      jointAngles: jointAngles.map(angle => Number(angle.toFixed(this.precision))),
      error: Number(error.toFixed(this.precision)),
      iterations
    };

    logger.info('Inverse kinematics completed', result);
    return result;
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  private transposeMatrix(matrix: number[][]): number[][] {
  return matrix[0]!.map((_, i) => matrix.map(row => row[i]!));
  }

  private multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
  row.reduce((sum, val, i) => sum + val * vector[i]!, 0)
    );
  }

  private pseudoInverse(matrix: number[][]): number[][] {
    // Simplified pseudo-inverse using transpose for overdetermined systems
    const transpose = this.transposeMatrix(matrix);
    const jtj = this.multiplyMatrices(transpose, matrix);
    const jtjInv = this.invertMatrix(jtj);
    return this.multiplyMatrices(jtjInv, transpose);
  }

  private multiplyMatrices(a: number[][], b: number[][]): number[][] {
  const result = Array(a.length).fill(null).map(() => Array(b[0]!.length).fill(0));
    
    for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0]!.length; j++) {
        for (let k = 0; k < b.length; k++) {
      result[i]![j]! += a[i]![k]! * b[k]![j]!;
        }
      }
    }
    
    return result;
  }

  private invertMatrix(matrix: number[][]): number[][] {
    // Simple 2x2 or 3x3 matrix inversion
    const n = matrix.length;
    
    if (n === 2) {
      const det = matrix[0]![0]! * matrix[1]![1]! - matrix[0]![1]! * matrix[1]![0]!;
      if (Math.abs(det) < 1e-10) throw new Error('Matrix is singular');
      
      return [
        [matrix[1]![1]! / det, -matrix[0]![1]! / det],
        [-matrix[1]![0]! / det, matrix[0]![0]! / det]
      ];
    }
    
    // For larger matrices, use Gaussian elimination (simplified)
  // const augmented = matrix.map((row, i) => [
  //   ...row,
  //   ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  // ]); // Placeholder for future larger-matrix inversion implementation
    
    // Forward elimination and back substitution would go here
    // This is a simplified version - in production, use a proper linear algebra library
    
    throw new Error('Matrix inversion not implemented for matrices larger than 2x2');
  }
}

/**
 * Differential Kinematics for velocity and acceleration analysis
 */
export class DifferentialKinematics {
  private fk: ForwardKinematics;
  private precision: number;

  constructor(dhParameters: DHParameters[]) {
    this.fk = new ForwardKinematics(dhParameters);
    this.precision = config.robotics.calculators.precision;
    logger.info('DifferentialKinematics initialized');
  }

  /**
   * Calculate end-effector velocity from joint velocities
   */
  forwardVelocityKinematics(
    jointAngles: number[], 
    jointVelocities: number[]
  ): { linear: Point3D; angular: Point3D } {
    const jacobian = this.fk.calculateJacobian(jointAngles);
    
    const endEffectorVelocity = jacobian.map(row =>
      row.reduce((sum, val, i) => sum + val * (jointVelocities[i] ?? 0), 0)
    );

    const result = {
      linear: {
  x: Number(endEffectorVelocity[0]!.toFixed(this.precision)),
  y: Number(endEffectorVelocity[1]!.toFixed(this.precision)),
  z: Number(endEffectorVelocity[2]!.toFixed(this.precision))
      },
      angular: {
  x: Number(endEffectorVelocity[3]!.toFixed(this.precision)),
  y: Number(endEffectorVelocity[4]!.toFixed(this.precision)),
  z: Number(endEffectorVelocity[5]!.toFixed(this.precision))
      }
    };

    logger.debug('Forward velocity kinematics calculated', { result });
    return result;
  }

  /**
   * Calculate required joint velocities for desired end-effector velocity
   */
  inverseVelocityKinematics(
    jointAngles: number[],
    desiredVelocity: { linear: Point3D; angular: Point3D }
  ): number[] {
    const jacobian = this.fk.calculateJacobian(jointAngles);
    const desiredVelocityVector = [
      desiredVelocity.linear.x,
      desiredVelocity.linear.y,
      desiredVelocity.linear.z,
      desiredVelocity.angular.x,
      desiredVelocity.angular.y,
      desiredVelocity.angular.z
    ];

    // Use pseudo-inverse for velocity calculation
    const jacobianPinv = this.pseudoInverse(jacobian);
    const jointVelocities = jacobianPinv.map(row =>
      Number(row.reduce((sum, val, i) => sum + val * (desiredVelocityVector[i] ?? 0), 0).toFixed(this.precision))
    );

    logger.debug('Inverse velocity kinematics calculated', { jointVelocities });
    return jointVelocities;
  }

  private pseudoInverse(matrix: number[][]): number[][] {
    // Simplified pseudo-inverse implementation
  const transpose = matrix[0]!.map((_, i) => matrix.map(row => row[i]!));
  // In a real implementation, you would use SVD or other robust methods
  return transpose as number[][];
  }
}

/**
 * Utility functions for kinematic calculations
 */
export const KinematicsUtils = {
  /**
   * Convert degrees to radians
   */
  degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
  },

  /**
   * Convert radians to degrees
   */
  radToDeg(radians: number): number {
    return radians * 180 / Math.PI;
  },

  /**
   * Normalize angle to [-π, π]
   */
  normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  },

  /**
   * Calculate distance between two 3D points
   */
  distance3D(p1: Point3D, p2: Point3D): number {
    return Math.sqrt(
      (p2.x - p1.x) ** 2 + 
      (p2.y - p1.y) ** 2 + 
      (p2.z - p1.z) ** 2
    );
  },

  /**
   * Create standard DH parameters for common robot configurations
   */
  createStandardDHParameters: {
    sixDofArm(): DHParameters[] {
      return [
        { a: 0, alpha: Math.PI/2, d: 0.1, theta: 0 },
        { a: 0.3, alpha: 0, d: 0, theta: 0 },
        { a: 0.25, alpha: 0, d: 0, theta: 0 },
        { a: 0, alpha: Math.PI/2, d: 0.15, theta: 0 },
        { a: 0, alpha: -Math.PI/2, d: 0, theta: 0 },
        { a: 0, alpha: 0, d: 0.1, theta: 0 }
      ];
    },
    
    scara(): DHParameters[] {
      return [
        { a: 0.2, alpha: 0, d: 0, theta: 0 },
        { a: 0.15, alpha: Math.PI, d: 0, theta: 0 },
        { a: 0, alpha: 0, d: 0, theta: 0 },
        { a: 0, alpha: 0, d: 0, theta: 0 }
      ];
    }
  }
};