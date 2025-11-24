//! Integration tests that verify the full simulation works correctly
//! These tests simulate what the canvas/frontend does

#[cfg(test)]
mod tests {
    use crate::boids::Boid;
    use crate::ekf::EKF;
    use crate::math::Vec2;
    use crate::physics::Particle;
    use alloc::vec;
    use alloc::vec::Vec;

    // ==================== SIMULATION LOOP ====================

    /// Simulates exactly what the canvas does each frame
    fn simulate_frame(flock: &mut [Boid], width: f32, height: f32, dt: f32) {
        // 1. Clone current state for read
        let current_state = flock.to_vec();

        // 2. Update each boid
        for boid in flock.iter_mut() {
            // Flocking behavior
            boid.flock(&current_state);

            // Physics update
            boid.particle.update();

            // EKF update
            boid.update_ekf(dt);

            // Boundary wrapping
            boid.edges(width, height);
        }
    }

    #[test]
    fn test_simulation_60fps_for_10_seconds() {
        let width = 800.0;
        let height = 600.0;
        let dt = 1.0 / 60.0;
        let frames = 60 * 10; // 10 seconds at 60fps

        // Initialize flock exactly like canvas does
        let mut flock: Vec<Boid> = (0..80)
            .map(|i| Boid::new(i, width / 2.0, height / 2.0))
            .collect();

        // Run simulation
        for _ in 0..frames {
            simulate_frame(&mut flock, width, height, dt);
        }

        // Verify no NaN or Inf values
        for boid in &flock {
            assert!(
                boid.particle.position.x.is_finite(),
                "Position X became infinite"
            );
            assert!(
                boid.particle.position.y.is_finite(),
                "Position Y became infinite"
            );
            assert!(
                boid.particle.velocity.x.is_finite(),
                "Velocity X became infinite"
            );
            assert!(
                boid.particle.velocity.y.is_finite(),
                "Velocity Y became infinite"
            );
            assert!(boid.ekf.state.x.is_finite(), "EKF state X became infinite");
            assert!(boid.ekf.state.y.is_finite(), "EKF state Y became infinite");
        }
    }

    #[test]
    fn test_simulation_stays_in_bounds() {
        let width = 800.0;
        let height = 600.0;
        let dt = 1.0 / 60.0;

        let mut flock: Vec<Boid> = (0..50)
            .map(|i| Boid::new(i, width / 2.0, height / 2.0))
            .collect();

        for _ in 0..1000 {
            simulate_frame(&mut flock, width, height, dt);
        }

        // All boids should be within bounds (or just past due to wrapping timing)
        for boid in &flock {
            let margin = 50.0; // Allow small margin for wrapping edge cases
            assert!(
                boid.particle.position.x >= -margin && boid.particle.position.x <= width + margin,
                "Boid {} x={} out of bounds",
                boid.id,
                boid.particle.position.x
            );
            assert!(
                boid.particle.position.y >= -margin && boid.particle.position.y <= height + margin,
                "Boid {} y={} out of bounds",
                boid.id,
                boid.particle.position.y
            );
        }
    }

    #[test]
    fn test_boids_spread_from_center() {
        let width = 800.0;
        let height = 600.0;
        let dt = 1.0 / 60.0;

        // All start at center
        let mut flock: Vec<Boid> = (0..20)
            .map(|i| Boid::new(i, width / 2.0, height / 2.0))
            .collect();

        // Run for 5 seconds
        for _ in 0..300 {
            simulate_frame(&mut flock, width, height, dt);
        }

        // Calculate spread (variance from center)
        let center_x = width / 2.0;
        let center_y = height / 2.0;
        let mut total_dist_sq = 0.0;

        for boid in &flock {
            let dx = boid.particle.position.x - center_x;
            let dy = boid.particle.position.y - center_y;
            total_dist_sq += dx * dx + dy * dy;
        }

        let avg_dist = (total_dist_sq / flock.len() as f32).sqrt();

        // Boids should have spread out significantly from center
        assert!(
            avg_dist > 50.0,
            "Boids didn't spread from center: avg_dist={}",
            avg_dist
        );
    }

    #[test]
    fn test_ekf_tracks_actual_position() {
        let width = 800.0;
        let height = 600.0;
        let dt = 1.0 / 60.0;

        let mut flock: Vec<Boid> = (0..10)
            .map(|i| Boid::new(i, width / 2.0, height / 2.0))
            .collect();

        // Run simulation
        for _ in 0..300 {
            simulate_frame(&mut flock, width, height, dt);
        }

        // EKF should track actual position within reasonable error
        for boid in &flock {
            let error_x = (boid.ekf.state.x - boid.particle.position.x).abs();
            let error_y = (boid.ekf.state.y - boid.particle.position.y).abs();

            // EKF should be within 50 pixels of actual position
            assert!(
                error_x < 50.0,
                "EKF X error too large: {} vs {}",
                boid.ekf.state.x,
                boid.particle.position.x
            );
            assert!(
                error_y < 50.0,
                "EKF Y error too large: {} vs {}",
                boid.ekf.state.y,
                boid.particle.position.y
            );
        }
    }

    // ==================== VELOCITY BEHAVIOR ====================

    #[test]
    fn test_velocity_never_exceeds_max() {
        let width = 800.0;
        let height = 600.0;
        let dt = 1.0 / 60.0;

        let mut flock: Vec<Boid> = (0..30)
            .map(|i| Boid::new(i, width / 2.0, height / 2.0))
            .collect();

        let max_speed = flock[0].particle.max_speed;

        for _ in 0..500 {
            simulate_frame(&mut flock, width, height, dt);

            // Check every frame
            for boid in &flock {
                let speed = boid.particle.velocity.mag();
                assert!(
                    speed <= max_speed + 0.01,
                    "Boid {} exceeded max speed: {} > {}",
                    boid.id,
                    speed,
                    max_speed
                );
            }
        }
    }

    // ==================== PARTICLE PHYSICS ====================

    #[test]
    fn test_particle_constant_velocity() {
        let mut p = Particle::new(0.0, 0.0);
        p.velocity = Vec2::new(1.0, 0.0);

        for _ in 0..100 {
            p.update();
        }

        // Should have moved 100 units in x
        assert!((p.position.x - 100.0).abs() < 1e-3);
        assert!(p.position.y.abs() < 1e-3);
    }

    #[test]
    fn test_particle_acceleration() {
        let mut p = Particle::new(0.0, 0.0);

        // Apply constant force
        for _ in 0..10 {
            p.apply_force(Vec2::new(0.01, 0.0));
            p.update();
        }

        // Should be moving and have moved
        assert!(p.velocity.x > 0.0);
        assert!(p.position.x > 0.0);
    }

    // ==================== EKF CONVERGENCE ====================

    #[test]
    fn test_ekf_converges_from_wrong_initial() {
        let true_pos = Vec2::new(100.0, 100.0);
        let mut ekf = EKF::new(Vec2::zero()); // Wrong initial

        // Stationary target, feed it correct measurements
        for _ in 0..100 {
            ekf.predict(Vec2::zero(), 1.0 / 60.0);
            ekf.update(true_pos);
        }

        // Should converge
        assert!(
            (ekf.state.x - 100.0).abs() < 5.0,
            "EKF didn't converge: x={}",
            ekf.state.x
        );
        assert!(
            (ekf.state.y - 100.0).abs() < 5.0,
            "EKF didn't converge: y={}",
            ekf.state.y
        );
    }

    // ==================== RENDERING COMPATIBILITY ====================

    /// Test that all values used in rendering are valid
    #[test]
    fn test_rendering_values_valid() {
        let width = 800.0f32;
        let height = 600.0f32;
        let dt = 1.0 / 60.0;

        let mut flock: Vec<Boid> = (0..80)
            .map(|i| Boid::new(i, width / 2.0, height / 2.0))
            .collect();

        for _ in 0..100 {
            simulate_frame(&mut flock, width, height, dt);
        }

        // Test all values used by canvas rendering
        for boid in &flock {
            let _x = boid.particle.position.x as f64;
            let _y = boid.particle.position.y as f64;
            let vx = boid.particle.velocity.x as f64;
            let vy = boid.particle.velocity.y as f64;

            // Angle calculation (used for rotation)
            let angle = vy.atan2(vx);
            assert!(angle.is_finite(), "Angle became non-finite");

            // Speed calculation (used for color)
            let speed = (vx * vx + vy * vy).sqrt();
            assert!(speed.is_finite(), "Speed became non-finite");

            // Hue calculation
            let hue = (speed * 30.0).min(120.0);
            assert!(hue.is_finite(), "Hue became non-finite");
            assert!(hue >= 0.0 && hue <= 120.0, "Hue out of range: {}", hue);

            // EKF position
            let ekf_x = boid.ekf.state.x as f64;
            let ekf_y = boid.ekf.state.y as f64;
            assert!(ekf_x.is_finite(), "EKF X became non-finite");
            assert!(ekf_y.is_finite(), "EKF Y became non-finite");
        }
    }

    /// Test connection line calculations
    #[test]
    fn test_connection_distance_calculation() {
        let flock: Vec<Boid> = vec![
            Boid::new(0, 100.0, 100.0),
            Boid::new(1, 120.0, 100.0), // 20 units away
            Boid::new(2, 200.0, 100.0), // 100 units away
        ];

        // Calculate distances as canvas does
        for i in 0..flock.len() {
            for j in (i + 1)..flock.len() {
                let b1 = &flock[i];
                let b2 = &flock[j];
                let dx = b1.particle.position.x - b2.particle.position.x;
                let dy = b1.particle.position.y - b2.particle.position.y;
                let dist_sq = dx * dx + dy * dy;

                assert!(dist_sq.is_finite(), "Distance squared became non-finite");

                // Connection threshold test
                if dist_sq < 2500.0 {
                    // 50^2
                    let alpha = 1.0 - (dist_sq / 2500.0);
                    assert!(
                        alpha >= 0.0 && alpha <= 1.0,
                        "Alpha out of range: {}",
                        alpha
                    );
                }
            }
        }
    }

    // ==================== STRESS TESTS ====================

    #[test]
    fn test_large_flock_stress() {
        let width = 1920.0;
        let height = 1080.0;
        let dt = 1.0 / 60.0;

        let mut flock: Vec<Boid> = (0..200)
            .map(|i| Boid::new(i, (i % 20) as f32 * 96.0, (i / 20) as f32 * 108.0))
            .collect();

        for _ in 0..60 {
            // 1 second
            simulate_frame(&mut flock, width, height, dt);
        }

        assert_eq!(flock.len(), 200);
        for boid in &flock {
            assert!(boid.particle.position.x.is_finite());
            assert!(boid.particle.position.y.is_finite());
        }
    }

    #[test]
    fn test_long_running_stability() {
        let width = 800.0;
        let height = 600.0;
        let dt = 1.0 / 60.0;

        let mut flock: Vec<Boid> = (0..20)
            .map(|i| Boid::new(i, width / 2.0, height / 2.0))
            .collect();

        // Run for 60 seconds worth of frames
        for _ in 0..(60 * 60) {
            simulate_frame(&mut flock, width, height, dt);
        }

        // All boids should still be valid
        for boid in &flock {
            assert!(boid.particle.position.x.is_finite());
            assert!(boid.particle.position.y.is_finite());
            assert!(boid.particle.velocity.x.is_finite());
            assert!(boid.particle.velocity.y.is_finite());
        }
    }
}
