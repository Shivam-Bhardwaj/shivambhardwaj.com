#[cfg(test)]
mod tests {
    use crate::boids::Boid; // Fixed import
    use crate::math::Vec2;
    use alloc::vec::Vec;

    #[test]
    fn test_boid_flocking_stress() {
        // Create a large flock and update it many times
        let mut flock = Vec::new();
        for i in 0..500 {
            flock.push(Boid::new(i, 0.0, 0.0));
        }

        // Run for 100 frames
        // This detects massive slowdowns (in a profiler) or crashes
        for _ in 0..100 {
            let current_state = flock.iter().map(|b| Boid { 
                particle: b.particle, 
                id: b.id, 
                ekf: b.ekf.clone() 
            }).collect::<Vec<_>>();

            for boid in flock.iter_mut() {
                boid.flock(&current_state);
                boid.particle.update();
            }
        }
        // If we get here without panic/OOM, basic stress test passed
        assert!(flock.len() == 500);
    }

    #[test]
    fn test_apf_boundary() {
        let mut boid = Boid::new(0, 800.0, 600.0); // At edge
        boid.particle.velocity = Vec2::new(10.0, 10.0); // Trying to leave

        // Apply edge force
        let force = boid.avoid_screen_edge(800.0, 600.0);
        
        // Should push back (negative x/y)
        assert!(force.x < 0.0);
        assert!(force.y < 0.0);
    }
}
