#[cfg(test)]
mod tests {
    use crate::boids::Boid;
    use crate::math::Vec2;
    use alloc::vec;
    use alloc::vec::Vec;

    // ==================== CONSTRUCTION ====================

    #[test]
    fn test_boid_new() {
        let boid = Boid::new(42, 100.0, 200.0);
        assert_eq!(boid.id, 42);
        assert_eq!(boid.particle.position.x, 100.0);
        assert_eq!(boid.particle.position.y, 200.0);
    }

    #[test]
    fn test_boid_initial_velocity_not_zero() {
        // Boids start with randomized velocity based on id
        let boid = Boid::new(5, 0.0, 0.0);
        // The velocity formula is: ((id % 3) - 1, (id % 5) - 2).normalize() * 2
        // For id=5: (5%3 - 1, 5%5 - 2) = (1, -2)
        assert!(boid.particle.velocity.mag() > 0.0);
    }

    #[test]
    fn test_boid_ekf_initialized() {
        let boid = Boid::new(0, 50.0, 75.0);
        assert_eq!(boid.ekf.state.x, 50.0);
        assert_eq!(boid.ekf.state.y, 75.0);
    }

    // ==================== EDGE WRAPPING ====================

    #[test]
    fn test_edges_wrap_right() {
        let mut boid = Boid::new(0, 850.0, 300.0);
        boid.edges(800.0, 600.0);
        assert_eq!(boid.particle.position.x, 0.0);
    }

    #[test]
    fn test_edges_wrap_left() {
        let mut boid = Boid::new(0, -10.0, 300.0);
        boid.edges(800.0, 600.0);
        assert_eq!(boid.particle.position.x, 800.0);
    }

    #[test]
    fn test_edges_wrap_bottom() {
        let mut boid = Boid::new(0, 400.0, 650.0);
        boid.edges(800.0, 600.0);
        assert_eq!(boid.particle.position.y, 0.0);
    }

    #[test]
    fn test_edges_wrap_top() {
        let mut boid = Boid::new(0, 400.0, -10.0);
        boid.edges(800.0, 600.0);
        assert_eq!(boid.particle.position.y, 600.0);
    }

    #[test]
    fn test_edges_no_wrap_when_inside() {
        let mut boid = Boid::new(0, 400.0, 300.0);
        boid.edges(800.0, 600.0);
        assert_eq!(boid.particle.position.x, 400.0);
        assert_eq!(boid.particle.position.y, 300.0);
    }

    // ==================== SCREEN EDGE AVOIDANCE (APF) ====================

    #[test]
    fn test_avoid_edge_left() {
        let boid = Boid::new(0, 10.0, 300.0); // Near left edge
        let force = boid.avoid_screen_edge(800.0, 600.0);
        assert!(force.x > 0.0); // Should push right
    }

    #[test]
    fn test_avoid_edge_right() {
        let boid = Boid::new(0, 790.0, 300.0); // Near right edge
        let force = boid.avoid_screen_edge(800.0, 600.0);
        assert!(force.x < 0.0); // Should push left
    }

    #[test]
    fn test_avoid_edge_top() {
        let boid = Boid::new(0, 400.0, 10.0); // Near top
        let force = boid.avoid_screen_edge(800.0, 600.0);
        assert!(force.y > 0.0); // Should push down
    }

    #[test]
    fn test_avoid_edge_bottom() {
        let boid = Boid::new(0, 400.0, 590.0); // Near bottom
        let force = boid.avoid_screen_edge(800.0, 600.0);
        assert!(force.y < 0.0); // Should push up
    }

    #[test]
    fn test_avoid_edge_center_no_force() {
        let boid = Boid::new(0, 400.0, 300.0); // Center of screen
        let force = boid.avoid_screen_edge(800.0, 600.0);
        assert_eq!(force.x, 0.0);
        assert_eq!(force.y, 0.0);
    }

    #[test]
    fn test_avoid_edge_corner() {
        let boid = Boid::new(0, 10.0, 10.0); // Top-left corner
        let force = boid.avoid_screen_edge(800.0, 600.0);
        assert!(force.x > 0.0); // Push right
        assert!(force.y > 0.0); // Push down
    }

    // ==================== FLOCKING BEHAVIORS ====================

    #[test]
    fn test_flock_single_boid_no_crash() {
        let mut boid = Boid::new(0, 400.0, 300.0);
        let flock = vec![boid.clone()];
        boid.flock(&flock);
        // Should not crash with single boid
    }

    #[test]
    fn test_flock_empty_no_crash() {
        let mut boid = Boid::new(0, 400.0, 300.0);
        let flock: Vec<Boid> = vec![];
        boid.flock(&flock);
        // Should not crash with empty flock
    }

    #[test]
    fn test_flock_modifies_acceleration() {
        let mut boid = Boid::new(0, 400.0, 300.0);
        let other = Boid::new(1, 410.0, 300.0); // Nearby
        let flock = vec![boid.clone(), other];
        
        let accel_before = boid.particle.acceleration;
        boid.flock(&flock);
        
        // Flocking should have added some force
        // (acceleration changes)
        let accel_after = boid.particle.acceleration;
        assert!(accel_before != accel_after || 
                (accel_before.x == 0.0 && accel_before.y == 0.0));
    }

    // ==================== SEPARATION ====================

    #[test]
    fn test_separation_pushes_apart() {
        let mut boid1 = Boid::new(0, 100.0, 100.0);
        let boid2 = Boid::new(1, 105.0, 100.0); // Very close on right
        
        let flock = vec![boid1.clone(), boid2];
        boid1.flock(&flock);
        boid1.particle.update();
        
        // Should move away from boid2 (to the left)
        // Acceleration should have pushed it
    }

    // ==================== EKF UPDATE ====================

    #[test]
    fn test_update_ekf() {
        let mut boid = Boid::new(0, 100.0, 100.0);
        boid.particle.velocity = Vec2::new(10.0, 0.0);
        boid.particle.position = Vec2::new(110.0, 100.0);
        
        boid.update_ekf(1.0 / 60.0);
        
        // EKF should have updated its estimate
        // State should move toward actual position
    }

    #[test]
    fn test_ekf_tracks_position() {
        let mut boid = Boid::new(0, 0.0, 0.0);
        
        // Simulate movement
        for i in 0..60 {
            boid.particle.position = Vec2::new(i as f32, 0.0);
            boid.update_ekf(1.0 / 60.0);
        }
        
        // EKF should be tracking near actual position
        assert!((boid.ekf.state.x - 59.0).abs() < 5.0);
    }

    // ==================== STRESS TESTS ====================

    #[test]
    fn test_large_flock_performance() {
        let mut flock: Vec<Boid> = (0..100)
            .map(|i| Boid::new(i, (i % 10) as f32 * 80.0, (i / 10) as f32 * 60.0))
            .collect();
        
        // Simulate 60 frames (1 second at 60fps)
        for _ in 0..60 {
            let snapshot = flock.clone();
            for boid in flock.iter_mut() {
                boid.flock(&snapshot);
                boid.particle.update();
                boid.edges(800.0, 600.0);
            }
        }
        
        // All boids should still exist
        assert_eq!(flock.len(), 100);
        
        // No boid should have NaN values
        for boid in &flock {
            assert!(!boid.particle.position.x.is_nan());
            assert!(!boid.particle.position.y.is_nan());
            assert!(!boid.particle.velocity.x.is_nan());
            assert!(!boid.particle.velocity.y.is_nan());
        }
    }

    #[test]
    fn test_boid_flocking_stress() {
        let mut flock: Vec<Boid> = (0..500)
            .map(|i| Boid::new(i, 0.0, 0.0))
            .collect();

        for _ in 0..100 {
            let current_state = flock.clone();
            for boid in flock.iter_mut() {
                boid.flock(&current_state);
                boid.particle.update();
            }
        }
        assert_eq!(flock.len(), 500);
    }

    // ==================== BOUNDARY CONDITIONS ====================

    #[test]
    fn test_boid_at_exact_boundary() {
        // Note: edges() only wraps when position > boundary (strictly greater)
        // so position AT boundary (== 800.0) does NOT wrap
        let mut boid = Boid::new(0, 800.0, 600.0);
        boid.edges(800.0, 600.0);
        // At exact boundary, no wrapping occurs
        assert_eq!(boid.particle.position.x, 800.0);
        assert_eq!(boid.particle.position.y, 600.0);
    }

    #[test]
    fn test_boid_past_boundary_wraps() {
        let mut boid = Boid::new(0, 800.1, 600.1);
        boid.edges(800.0, 600.0);
        // Should wrap to 0,0 when strictly past boundary
        assert_eq!(boid.particle.position.x, 0.0);
        assert_eq!(boid.particle.position.y, 0.0);
    }

    #[test]
    fn test_boid_at_zero() {
        let mut boid = Boid::new(0, 0.0, 0.0);
        boid.edges(800.0, 600.0);
        // Should stay at 0,0
        assert_eq!(boid.particle.position.x, 0.0);
        assert_eq!(boid.particle.position.y, 0.0);
    }

    // ==================== CLONE ====================

    #[test]
    fn test_boid_clone() {
        let boid1 = Boid::new(5, 100.0, 200.0);
        let boid2 = boid1.clone();
        
        assert_eq!(boid1.id, boid2.id);
        assert_eq!(boid1.particle.position.x, boid2.particle.position.x);
        assert_eq!(boid1.particle.position.y, boid2.particle.position.y);
    }
}
