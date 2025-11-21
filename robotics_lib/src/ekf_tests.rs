#[cfg(test)]
mod tests {
    use crate::ekf::{EKF, Mat2};
    use crate::math::Vec2;

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
    fn test_mat2_inverse() {
        let a = Mat2::new(4.0, 7.0, 2.0, 6.0);
        let inv = a.inverse().expect("Should be invertible");
        let res = a.mul(inv);
        // Should be close to identity
        assert!((res.m11 - 1.0).abs() < 1e-5);
        assert!((res.m12 - 0.0).abs() < 1e-5);
    }

    #[test]
    fn test_ekf_prediction() {
        let mut ekf = EKF::new(Vec2::zero());
        let vel = Vec2::new(1.0, 0.0);
        ekf.predict(vel, 1.0);
        
        // After 1s at 1.0 speed, should be at x=1.0
        assert!((ekf.state.x - 1.0).abs() < 1e-6);
        
        // Covariance should increase due to process noise
        assert!(ekf.covariance.m11 > 1.0);
    }

    #[test]
    fn test_ekf_update_convergence() {
        // Synthetic data test
        // Robot stays at (10, 10). 
        // Initial belief is (0, 0).
        // We feed it noisy measurements centered around (10, 10).
        
        let true_pos = Vec2::new(10.0, 10.0);
        let mut ekf = EKF::new(Vec2::zero()); // Very wrong initial belief
        
        // Iterate
        for _ in 0..50 {
            ekf.predict(Vec2::zero(), 0.1); // Stationary
            // Perfect measurement for convergence check (noise is in config, not input here)
            ekf.update(true_pos); 
        }
        
        // Should have converged close to 10,10
        assert!((ekf.state.x - 10.0).abs() < 0.5);
        assert!((ekf.state.y - 10.0).abs() < 0.5);
    }
}
