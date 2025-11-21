#[cfg(test)]
mod tests {
    use super::*;
    use crate::math::Vec2;

    #[test]
    fn test_vec2_addition() {
        let a = Vec2::new(1.0, 2.0);
        let b = Vec2::new(3.0, 4.0);
        let c = a + b;
        assert_eq!(c.x, 4.0);
        assert_eq!(c.y, 6.0);
    }

    #[test]
    fn test_vec2_normalization() {
        let v = Vec2::new(3.0, 4.0);
        let n = v.normalize();
        // Magnitude should be 1.0 (within float error)
        assert!((n.mag() - 1.0).abs() < 1e-6);
        assert!((n.x - 0.6).abs() < 1e-6);
        assert!((n.y - 0.8).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_limit() {
        let v = Vec2::new(10.0, 0.0);
        let l = v.limit(5.0);
        assert!((l.mag() - 5.0).abs() < 1e-6);
        assert!((l.x - 5.0).abs() < 1e-6);
    }

    #[test]
    fn test_vec2_zero_normalize() {
        let v = Vec2::zero();
        let n = v.normalize();
        assert_eq!(n.x, 0.0);
        assert_eq!(n.y, 0.0);
    }
}

