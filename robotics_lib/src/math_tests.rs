#[cfg(test)]
mod tests {
    use crate::math::Vec2;

    // ==================== CONSTRUCTION ====================
    
    #[test]
    fn test_vec2_new() {
        let v = Vec2::new(3.5, -2.1);
        assert_eq!(v.x, 3.5);
        assert_eq!(v.y, -2.1);
    }

    #[test]
    fn test_vec2_zero() {
        let v = Vec2::zero();
        assert_eq!(v.x, 0.0);
        assert_eq!(v.y, 0.0);
    }

    // ==================== ARITHMETIC ====================

    #[test]
    fn test_vec2_addition() {
        let a = Vec2::new(1.0, 2.0);
        let b = Vec2::new(3.0, 4.0);
        let c = a + b;
        assert_eq!(c.x, 4.0);
        assert_eq!(c.y, 6.0);
    }

    #[test]
    fn test_vec2_addition_negative() {
        let a = Vec2::new(-5.0, 3.0);
        let b = Vec2::new(2.0, -7.0);
        let c = a + b;
        assert_eq!(c.x, -3.0);
        assert_eq!(c.y, -4.0);
    }

    #[test]
    fn test_vec2_subtraction() {
        let a = Vec2::new(5.0, 3.0);
        let b = Vec2::new(2.0, 1.0);
        let c = a - b;
        assert_eq!(c.x, 3.0);
        assert_eq!(c.y, 2.0);
    }

    #[test]
    fn test_vec2_scalar_multiplication() {
        let v = Vec2::new(2.0, 3.0);
        let scaled = v * 4.0;
        assert_eq!(scaled.x, 8.0);
        assert_eq!(scaled.y, 12.0);
    }

    #[test]
    fn test_vec2_scalar_multiplication_negative() {
        let v = Vec2::new(2.0, -3.0);
        let scaled = v * -2.0;
        assert_eq!(scaled.x, -4.0);
        assert_eq!(scaled.y, 6.0);
    }

    #[test]
    fn test_vec2_scalar_division() {
        let v = Vec2::new(8.0, 4.0);
        let divided = v / 2.0;
        assert_eq!(divided.x, 4.0);
        assert_eq!(divided.y, 2.0);
    }

    #[test]
    fn test_vec2_division_by_zero_returns_zero() {
        let v = Vec2::new(5.0, 10.0);
        let divided = v / 0.0;
        assert_eq!(divided.x, 0.0);
        assert_eq!(divided.y, 0.0);
    }

    // ==================== MAGNITUDE ====================

    #[test]
    fn test_vec2_mag_sq() {
        let v = Vec2::new(3.0, 4.0);
        assert_eq!(v.mag_sq(), 25.0);
    }

    #[test]
    fn test_vec2_mag() {
        let v = Vec2::new(3.0, 4.0);
        assert!((v.mag() - 5.0).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_mag_zero() {
        let v = Vec2::zero();
        assert_eq!(v.mag(), 0.0);
    }

    #[test]
    fn test_vec2_mag_unit_x() {
        let v = Vec2::new(1.0, 0.0);
        assert!((v.mag() - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_mag_unit_y() {
        let v = Vec2::new(0.0, 1.0);
        assert!((v.mag() - 1.0).abs() < 1e-6);
    }

    // ==================== NORMALIZATION ====================

    #[test]
    fn test_vec2_normalization() {
        let v = Vec2::new(3.0, 4.0);
        let n = v.normalize();
        assert!((n.mag() - 1.0).abs() < 1e-6);
        assert!((n.x - 0.6).abs() < 1e-6);
        assert!((n.y - 0.8).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_normalize_preserves_direction() {
        let v = Vec2::new(10.0, 0.0);
        let n = v.normalize();
        assert!((n.x - 1.0).abs() < 1e-6);
        assert!((n.y - 0.0).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_normalize_negative() {
        let v = Vec2::new(-3.0, -4.0);
        let n = v.normalize();
        assert!((n.mag() - 1.0).abs() < 1e-6);
        assert!((n.x - -0.6).abs() < 1e-6);
        assert!((n.y - -0.8).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_zero_normalize() {
        let v = Vec2::zero();
        let n = v.normalize();
        assert_eq!(n.x, 0.0);
        assert_eq!(n.y, 0.0);
    }

    // ==================== LIMIT ====================

    #[test]
    fn test_vec2_limit_reduces_magnitude() {
        let v = Vec2::new(10.0, 0.0);
        let l = v.limit(5.0);
        assert!((l.mag() - 5.0).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_limit_preserves_direction() {
        let v = Vec2::new(10.0, 10.0);
        let l = v.limit(5.0);
        // Direction should be preserved (45 degrees)
        assert!((l.x - l.y).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_limit_does_not_increase() {
        let v = Vec2::new(2.0, 0.0);
        let l = v.limit(10.0);
        assert!((l.mag() - 2.0).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_limit_zero_vector() {
        let v = Vec2::zero();
        let l = v.limit(5.0);
        assert_eq!(l.x, 0.0);
        assert_eq!(l.y, 0.0);
    }

    // ==================== DISTANCE ====================

    #[test]
    fn test_vec2_distance_sq() {
        let a = Vec2::new(0.0, 0.0);
        let b = Vec2::new(3.0, 4.0);
        assert_eq!(a.distance_sq(&b), 25.0);
    }

    #[test]
    fn test_vec2_distance_sq_same_point() {
        let a = Vec2::new(5.0, 5.0);
        assert_eq!(a.distance_sq(&a), 0.0);
    }

    #[test]
    fn test_vec2_distance_sq_symmetric() {
        let a = Vec2::new(1.0, 2.0);
        let b = Vec2::new(4.0, 6.0);
        assert_eq!(a.distance_sq(&b), b.distance_sq(&a));
    }

    // ==================== EQUALITY ====================

    #[test]
    fn test_vec2_equality() {
        let a = Vec2::new(1.0, 2.0);
        let b = Vec2::new(1.0, 2.0);
        assert_eq!(a, b);
    }

    #[test]
    fn test_vec2_inequality() {
        let a = Vec2::new(1.0, 2.0);
        let b = Vec2::new(1.0, 3.0);
        assert_ne!(a, b);
    }

    // ==================== COPY/CLONE ====================

    #[test]
    fn test_vec2_copy() {
        let a = Vec2::new(1.0, 2.0);
        let b = a; // Copy
        assert_eq!(a.x, b.x);
        assert_eq!(a.y, b.y);
    }

    // ==================== EDGE CASES ====================

    #[test]
    fn test_vec2_very_small_values() {
        let v = Vec2::new(1e-10, 1e-10);
        let n = v.normalize();
        assert!((n.mag() - 1.0).abs() < 1e-5);
    }

    #[test]
    fn test_vec2_very_large_values() {
        let v = Vec2::new(1e10, 1e10);
        let n = v.normalize();
        assert!((n.mag() - 1.0).abs() < 1e-5);
    }

    // ==================== PROPERTY-BASED STYLE ====================

    #[test]
    fn test_vec2_addition_commutative() {
        let pairs = [
            (Vec2::new(1.0, 2.0), Vec2::new(3.0, 4.0)),
            (Vec2::new(-5.0, 0.0), Vec2::new(0.0, 5.0)),
            (Vec2::new(0.0, 0.0), Vec2::new(1.0, 1.0)),
        ];
        for (a, b) in pairs {
            let ab = a + b;
            let ba = b + a;
            assert!((ab.x - ba.x).abs() < 1e-10);
            assert!((ab.y - ba.y).abs() < 1e-10);
        }
    }

    #[test]
    fn test_vec2_addition_identity() {
        let vectors = [
            Vec2::new(1.0, 2.0),
            Vec2::new(-3.0, 4.0),
            Vec2::new(0.0, 0.0),
        ];
        let zero = Vec2::zero();
        for v in vectors {
            let result = v + zero;
            assert_eq!(result.x, v.x);
            assert_eq!(result.y, v.y);
        }
    }

    #[test]
    fn test_normalize_then_scale_equals_original_direction() {
        let v = Vec2::new(6.0, 8.0); // mag = 10
        let n = v.normalize();
        let scaled = n * 10.0;
        assert!((scaled.x - v.x).abs() < 1e-5);
        assert!((scaled.y - v.y).abs() < 1e-5);
    }
}
