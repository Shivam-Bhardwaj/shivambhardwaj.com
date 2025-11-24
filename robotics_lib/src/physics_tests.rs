#[cfg(test)]
mod tests {
    use crate::math::Vec2;
    use crate::physics::Particle;

    // ==================== CONSTRUCTION ====================

    #[test]
    fn test_particle_new() {
        let p = Particle::new(10.0, 20.0);
        assert_eq!(p.position.x, 10.0);
        assert_eq!(p.position.y, 20.0);
        assert_eq!(p.velocity.x, 0.0);
        assert_eq!(p.velocity.y, 0.0);
        assert_eq!(p.acceleration.x, 0.0);
        assert_eq!(p.acceleration.y, 0.0);
    }

    #[test]
    fn test_particle_default_limits() {
        let p = Particle::new(0.0, 0.0);
        assert_eq!(p.max_speed, 4.0);
        assert_eq!(p.max_force, 0.1);
    }

    // ==================== FORCE APPLICATION ====================

    #[test]
    fn test_apply_force_single() {
        let mut p = Particle::new(0.0, 0.0);
        p.apply_force(Vec2::new(1.0, 2.0));
        assert_eq!(p.acceleration.x, 1.0);
        assert_eq!(p.acceleration.y, 2.0);
    }

    #[test]
    fn test_apply_force_accumulates() {
        let mut p = Particle::new(0.0, 0.0);
        p.apply_force(Vec2::new(1.0, 0.0));
        p.apply_force(Vec2::new(0.0, 1.0));
        p.apply_force(Vec2::new(0.5, 0.5));
        assert_eq!(p.acceleration.x, 1.5);
        assert_eq!(p.acceleration.y, 1.5);
    }

    #[test]
    fn test_apply_force_negative() {
        let mut p = Particle::new(0.0, 0.0);
        p.apply_force(Vec2::new(-3.0, -4.0));
        assert_eq!(p.acceleration.x, -3.0);
        assert_eq!(p.acceleration.y, -4.0);
    }

    // ==================== UPDATE ====================

    #[test]
    fn test_update_velocity_from_acceleration() {
        let mut p = Particle::new(0.0, 0.0);
        p.apply_force(Vec2::new(1.0, 0.0));
        p.update();
        assert_eq!(p.velocity.x, 1.0);
        assert_eq!(p.velocity.y, 0.0);
    }

    #[test]
    fn test_update_position_from_velocity() {
        let mut p = Particle::new(0.0, 0.0);
        p.velocity = Vec2::new(2.0, 3.0);
        p.update();
        assert_eq!(p.position.x, 2.0);
        assert_eq!(p.position.y, 3.0);
    }

    #[test]
    fn test_update_resets_acceleration() {
        let mut p = Particle::new(0.0, 0.0);
        p.apply_force(Vec2::new(5.0, 5.0));
        p.update();
        assert_eq!(p.acceleration.x, 0.0);
        assert_eq!(p.acceleration.y, 0.0);
    }

    #[test]
    fn test_update_limits_velocity() {
        let mut p = Particle::new(0.0, 0.0);
        p.apply_force(Vec2::new(100.0, 0.0)); // Way over max_speed
        p.update();
        assert!(p.velocity.mag() <= p.max_speed + 1e-6);
    }

    // ==================== VELOCITY LIMITING ====================

    #[test]
    fn test_velocity_limited_to_max_speed() {
        let mut p = Particle::new(0.0, 0.0);
        p.velocity = Vec2::new(10.0, 10.0); // Much faster than max_speed=4
        p.update();
        assert!(p.velocity.mag() <= p.max_speed + 1e-6);
    }

    #[test]
    fn test_velocity_direction_preserved_when_limited() {
        let mut p = Particle::new(0.0, 0.0);
        p.velocity = Vec2::new(100.0, 100.0);
        p.update();
        // Direction should be 45 degrees (x == y)
        assert!((p.velocity.x - p.velocity.y).abs() < 1e-6);
    }

    #[test]
    fn test_slow_velocity_not_affected() {
        let mut p = Particle::new(0.0, 0.0);
        p.velocity = Vec2::new(1.0, 0.0); // Below max_speed
        p.update();
        // Should still be 1.0 (plus position offset)
        assert!((p.velocity.x - 1.0).abs() < 1e-6);
    }

    // ==================== INTEGRATION TESTS ====================

    #[test]
    fn test_particle_motion_over_time() {
        let mut p = Particle::new(0.0, 0.0);
        
        // Apply constant force for 10 frames
        for _ in 0..10 {
            p.apply_force(Vec2::new(0.1, 0.0));
            p.update();
        }
        
        // Should have moved right
        assert!(p.position.x > 0.0);
        assert!(p.velocity.x > 0.0);
    }

    #[test]
    fn test_particle_comes_to_rest_without_force() {
        let mut p = Particle::new(0.0, 0.0);
        p.velocity = Vec2::new(2.0, 0.0);
        
        // Update without force - velocity stays constant (no friction)
        p.update();
        assert!((p.velocity.x - 2.0).abs() < 1e-6);
    }

    #[test]
    fn test_particle_position_accumulates() {
        let mut p = Particle::new(100.0, 100.0);
        p.velocity = Vec2::new(1.0, 1.0);
        
        for _ in 0..5 {
            p.update();
        }
        
        assert!((p.position.x - 105.0).abs() < 1e-6);
        assert!((p.position.y - 105.0).abs() < 1e-6);
    }

    // ==================== EDGE CASES ====================

    #[test]
    fn test_particle_at_origin() {
        let mut p = Particle::new(0.0, 0.0);
        p.update();
        assert_eq!(p.position.x, 0.0);
        assert_eq!(p.position.y, 0.0);
    }

    #[test]
    fn test_particle_negative_position() {
        let p = Particle::new(-100.0, -200.0);
        assert_eq!(p.position.x, -100.0);
        assert_eq!(p.position.y, -200.0);
    }

    #[test]
    fn test_zero_force_no_change() {
        let mut p = Particle::new(5.0, 5.0);
        let original_pos = p.position;
        p.apply_force(Vec2::zero());
        p.update();
        assert_eq!(p.position.x, original_pos.x);
        assert_eq!(p.position.y, original_pos.y);
    }
}

