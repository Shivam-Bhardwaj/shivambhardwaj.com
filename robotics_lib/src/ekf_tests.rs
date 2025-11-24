#[cfg(test)]
mod tests {
    use crate::ekf::{Mat2, EKF};
    use crate::math::Vec2;

    // ==================== MAT2 CONSTRUCTION ====================

    #[test]
    fn test_mat2_new() {
        let m = Mat2::new(1.0, 2.0, 3.0, 4.0);
        assert_eq!(m.m11, 1.0);
        assert_eq!(m.m12, 2.0);
        assert_eq!(m.m21, 3.0);
        assert_eq!(m.m22, 4.0);
    }

    #[test]
    fn test_mat2_identity() {
        let m = Mat2::identity();
        assert_eq!(m.m11, 1.0);
        assert_eq!(m.m12, 0.0);
        assert_eq!(m.m21, 0.0);
        assert_eq!(m.m22, 1.0);
    }

    // ==================== MAT2 ADDITION ====================

    #[test]
    fn test_mat2_add() {
        let a = Mat2::new(1.0, 2.0, 3.0, 4.0);
        let b = Mat2::new(5.0, 6.0, 7.0, 8.0);
        let c = a.add(b);
        assert_eq!(c.m11, 6.0);
        assert_eq!(c.m12, 8.0);
        assert_eq!(c.m21, 10.0);
        assert_eq!(c.m22, 12.0);
    }

    #[test]
    fn test_mat2_add_identity() {
        let a = Mat2::new(1.0, 2.0, 3.0, 4.0);
        let zero = Mat2::new(0.0, 0.0, 0.0, 0.0);
        let c = a.add(zero);
        assert_eq!(c.m11, a.m11);
        assert_eq!(c.m12, a.m12);
    }

    // ==================== MAT2 MULTIPLICATION ====================

    #[test]
    fn test_mat2_multiplication() {
        let a = Mat2::identity();
        let b = Mat2::new(1.0, 2.0, 3.0, 4.0);
        let c = a.mul(b);
        assert_eq!(c.m11, 1.0);
        assert_eq!(c.m12, 2.0);
        assert_eq!(c.m21, 3.0);
        assert_eq!(c.m22, 4.0);
    }

    #[test]
    fn test_mat2_mul_identity_right() {
        let a = Mat2::new(1.0, 2.0, 3.0, 4.0);
        let i = Mat2::identity();
        let c = a.mul(i);
        assert_eq!(c.m11, 1.0);
        assert_eq!(c.m12, 2.0);
        assert_eq!(c.m21, 3.0);
        assert_eq!(c.m22, 4.0);
    }

    #[test]
    fn test_mat2_mul_specific() {
        // [1 2] * [5 6] = [1*5+2*7  1*6+2*8] = [19 22]
        // [3 4]   [7 8]   [3*5+4*7  3*6+4*8]   [43 50]
        let a = Mat2::new(1.0, 2.0, 3.0, 4.0);
        let b = Mat2::new(5.0, 6.0, 7.0, 8.0);
        let c = a.mul(b);
        assert_eq!(c.m11, 19.0);
        assert_eq!(c.m12, 22.0);
        assert_eq!(c.m21, 43.0);
        assert_eq!(c.m22, 50.0);
    }

    // ==================== MAT2 TRANSPOSE ====================

    #[test]
    fn test_mat2_transpose() {
        let a = Mat2::new(1.0, 2.0, 3.0, 4.0);
        let t = a.transpose();
        assert_eq!(t.m11, 1.0);
        assert_eq!(t.m12, 3.0);
        assert_eq!(t.m21, 2.0);
        assert_eq!(t.m22, 4.0);
    }

    #[test]
    fn test_mat2_transpose_identity() {
        let i = Mat2::identity();
        let t = i.transpose();
        assert_eq!(t.m11, 1.0);
        assert_eq!(t.m12, 0.0);
        assert_eq!(t.m21, 0.0);
        assert_eq!(t.m22, 1.0);
    }

    #[test]
    fn test_mat2_double_transpose() {
        let a = Mat2::new(1.0, 2.0, 3.0, 4.0);
        let t2 = a.transpose().transpose();
        assert_eq!(t2.m11, a.m11);
        assert_eq!(t2.m12, a.m12);
        assert_eq!(t2.m21, a.m21);
        assert_eq!(t2.m22, a.m22);
    }

    // ==================== MAT2 INVERSE ====================

    #[test]
    fn test_mat2_inverse() {
        let a = Mat2::new(4.0, 7.0, 2.0, 6.0);
        let inv = a.inverse().expect("Should be invertible");
        let res = a.mul(inv);
        assert!((res.m11 - 1.0).abs() < 1e-5);
        assert!((res.m12 - 0.0).abs() < 1e-5);
        assert!((res.m21 - 0.0).abs() < 1e-5);
        assert!((res.m22 - 1.0).abs() < 1e-5);
    }

    #[test]
    fn test_mat2_inverse_identity() {
        let i = Mat2::identity();
        let inv = i.inverse().expect("Identity should be invertible");
        assert!((inv.m11 - 1.0).abs() < 1e-5);
        assert!((inv.m12 - 0.0).abs() < 1e-5);
        assert!((inv.m21 - 0.0).abs() < 1e-5);
        assert!((inv.m22 - 1.0).abs() < 1e-5);
    }

    #[test]
    fn test_mat2_inverse_singular() {
        // Singular matrix (det = 0)
        let a = Mat2::new(1.0, 2.0, 2.0, 4.0);
        assert!(a.inverse().is_none());
    }

    #[test]
    fn test_mat2_inverse_near_singular() {
        // Nearly singular
        let a = Mat2::new(1.0, 2.0, 2.0, 4.0001);
        // Should still be invertible (det = 0.0001)
        assert!(a.inverse().is_some());
    }

    // ==================== EKF CONSTRUCTION ====================

    #[test]
    fn test_ekf_new() {
        let ekf = EKF::new(Vec2::new(10.0, 20.0));
        assert_eq!(ekf.state.x, 10.0);
        assert_eq!(ekf.state.y, 20.0);
    }

    #[test]
    fn test_ekf_initial_covariance() {
        let ekf = EKF::new(Vec2::zero());
        // Should be identity matrix
        assert_eq!(ekf.covariance.m11, 1.0);
        assert_eq!(ekf.covariance.m22, 1.0);
    }

    // ==================== EKF PREDICTION ====================

    #[test]
    fn test_ekf_prediction() {
        let mut ekf = EKF::new(Vec2::zero());
        let vel = Vec2::new(1.0, 0.0);
        ekf.predict(vel, 1.0);

        // After 1s at 1.0 speed, should be at x=1.0
        assert!((ekf.state.x - 1.0).abs() < 1e-6);
        assert!((ekf.state.y - 0.0).abs() < 1e-6);
    }

    #[test]
    fn test_ekf_prediction_increases_uncertainty() {
        let mut ekf = EKF::new(Vec2::zero());
        let initial_cov = ekf.covariance.m11;
        
        ekf.predict(Vec2::new(1.0, 0.0), 1.0);
        
        // Covariance should increase due to process noise
        assert!(ekf.covariance.m11 > initial_cov);
    }

    #[test]
    fn test_ekf_prediction_zero_velocity() {
        let mut ekf = EKF::new(Vec2::new(5.0, 5.0));
        ekf.predict(Vec2::zero(), 1.0);
        
        // State should not change with zero velocity
        assert!((ekf.state.x - 5.0).abs() < 1e-6);
        assert!((ekf.state.y - 5.0).abs() < 1e-6);
    }

    #[test]
    fn test_ekf_prediction_diagonal() {
        let mut ekf = EKF::new(Vec2::zero());
        let vel = Vec2::new(1.0, 1.0);
        ekf.predict(vel, 1.0);
        
        assert!((ekf.state.x - 1.0).abs() < 1e-6);
        assert!((ekf.state.y - 1.0).abs() < 1e-6);
    }

    // ==================== EKF UPDATE ====================

    #[test]
    fn test_ekf_update_convergence() {
        let true_pos = Vec2::new(10.0, 10.0);
        let mut ekf = EKF::new(Vec2::zero());

        for _ in 0..50 {
            ekf.predict(Vec2::zero(), 0.1);
            ekf.update(true_pos);
        }

        assert!((ekf.state.x - 10.0).abs() < 0.5);
        assert!((ekf.state.y - 10.0).abs() < 0.5);
    }

    #[test]
    fn test_ekf_update_reduces_uncertainty() {
        let mut ekf = EKF::new(Vec2::zero());
        
        // Predict to increase uncertainty
        for _ in 0..10 {
            ekf.predict(Vec2::new(0.1, 0.1), 0.1);
        }
        
        let cov_before = ekf.covariance.m11;
        
        // Update with measurement
        ekf.update(ekf.state); // Measurement matches prediction
        
        // Uncertainty should decrease
        assert!(ekf.covariance.m11 < cov_before);
    }

    #[test]
    fn test_ekf_update_moves_toward_measurement() {
        let mut ekf = EKF::new(Vec2::new(0.0, 0.0));
        let measurement = Vec2::new(100.0, 100.0);
        
        ekf.update(measurement);
        
        // State should move toward measurement
        assert!(ekf.state.x > 0.0);
        assert!(ekf.state.y > 0.0);
    }

    // ==================== EKF INTEGRATION ====================

    #[test]
    fn test_ekf_tracking_moving_target() {
        let mut ekf = EKF::new(Vec2::zero());
        let dt = 1.0 / 60.0;
        
        // Simulate tracking a target moving at constant velocity
        for i in 0..120 {
            let true_pos = Vec2::new(i as f32 * 0.5, 0.0);
            let vel = Vec2::new(0.5 / dt, 0.0);
            
            ekf.predict(vel, dt);
            ekf.update(true_pos);
        }
        
        // Should be tracking near the final position
        let final_true_pos = 119.0 * 0.5;
        assert!((ekf.state.x - final_true_pos).abs() < 2.0);
    }

    #[test]
    fn test_ekf_handles_noisy_measurements() {
        let mut ekf = EKF::new(Vec2::zero());
        let true_pos = Vec2::new(50.0, 50.0);
        
        // Simulate noisy measurements
        let noise_pattern = [1.0, -1.0, 0.5, -0.5, 2.0, -2.0, 0.0, 1.5, -1.5, 0.3];
        
        for &noise in noise_pattern.iter().cycle().take(100) {
            let noisy_measurement = Vec2::new(true_pos.x + noise, true_pos.y - noise);
            ekf.predict(Vec2::zero(), 0.1);
            ekf.update(noisy_measurement);
        }
        
        // Should converge despite noise
        assert!((ekf.state.x - 50.0).abs() < 3.0);
        assert!((ekf.state.y - 50.0).abs() < 3.0);
    }

    // ==================== EDGE CASES ====================

    #[test]
    fn test_ekf_very_large_dt() {
        let mut ekf = EKF::new(Vec2::zero());
        ekf.predict(Vec2::new(1.0, 1.0), 1000.0);
        
        assert!(!ekf.state.x.is_nan());
        assert!(!ekf.state.y.is_nan());
    }

    #[test]
    fn test_ekf_very_small_dt() {
        let mut ekf = EKF::new(Vec2::zero());
        ekf.predict(Vec2::new(1.0, 1.0), 0.0001);
        
        assert!(!ekf.state.x.is_nan());
        assert!(!ekf.state.y.is_nan());
    }

    #[test]
    fn test_ekf_zero_dt() {
        let mut ekf = EKF::new(Vec2::zero());
        ekf.predict(Vec2::new(1.0, 1.0), 0.0);
        
        // Should not change state
        assert_eq!(ekf.state.x, 0.0);
        assert_eq!(ekf.state.y, 0.0);
    }

    #[test]
    fn test_ekf_negative_position() {
        let mut ekf = EKF::new(Vec2::new(-100.0, -200.0));
        
        assert_eq!(ekf.state.x, -100.0);
        assert_eq!(ekf.state.y, -200.0);
        
        ekf.predict(Vec2::new(-1.0, -1.0), 1.0);
        
        assert!((ekf.state.x - -101.0).abs() < 1e-6);
        assert!((ekf.state.y - -201.0).abs() < 1e-6);
    }

    #[test]
    fn test_ekf_clone() {
        let ekf1 = EKF::new(Vec2::new(10.0, 20.0));
        let ekf2 = ekf1.clone();
        
        assert_eq!(ekf1.state.x, ekf2.state.x);
        assert_eq!(ekf1.state.y, ekf2.state.y);
    }

    // ==================== STABILITY ====================

    #[test]
    fn test_ekf_long_running_stability() {
        let mut ekf = EKF::new(Vec2::zero());
        
        // Run for many iterations
        for _ in 0..10000 {
            ekf.predict(Vec2::new(0.1, -0.1), 0.016);
            ekf.update(Vec2::new(0.0, 0.0));
        }
        
        // Should not have exploded or become NaN
        assert!(!ekf.state.x.is_nan());
        assert!(!ekf.state.y.is_nan());
        assert!(ekf.state.x.is_finite());
        assert!(ekf.state.y.is_finite());
    }
}
