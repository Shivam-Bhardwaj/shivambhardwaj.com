use crate::math::Vec2;
use crate::physics::Particle;
use crate::ekf::EKF;

#[derive(Clone)] // Added Clone derive for tests
pub struct Boid {
    pub particle: Particle,
    pub id: usize,
    pub ekf: EKF,
}

impl Boid {
    pub fn new(id: usize, x: f32, y: f32) -> Self {
        let mut particle = Particle::new(x, y);
        // Randomize velocity slightly to avoid stacking
        particle.velocity = Vec2::new(
            (id % 3) as f32 - 1.0, 
            (id % 5) as f32 - 2.0
        ).normalize() * 2.0;
        
        let ekf = EKF::new(particle.position);

        Self { particle, id, ekf }
    }

    // ... rest of methods ...
    
    pub fn flock(&mut self, boids: &[Boid]) {
        let sep = self.separate(boids);
        let ali = self.align(boids);
        let coh = self.cohesion(boids);
        let avoid = self.avoid_screen_edge(800.0, 600.0);

        self.particle.apply_force(sep * 1.5);
        self.particle.apply_force(ali * 1.0);
        self.particle.apply_force(coh * 1.0);
        self.particle.apply_force(avoid * 2.0);
    }
    
    pub fn avoid_screen_edge(&self, width: f32, height: f32) -> Vec2 {
        let margin = 50.0;
        let mut steer = Vec2::zero();
        let p = self.particle.position;
        
        if p.x < margin { steer.x += 1.0; }
        if p.x > width - margin { steer.x -= 1.0; }
        if p.y < margin { steer.y += 1.0; }
        if p.y > height - margin { steer.y -= 1.0; }
        
        if steer.mag_sq() > 0.0 {
             steer.normalize() * self.particle.max_force
        } else {
            Vec2::zero()
        }
    }

    fn separate(&self, boids: &[Boid]) -> Vec2 {
        let desired_separation = 25.0f32;
        let mut steer = Vec2::zero();
        let mut count = 0;

        for other in boids {
            let d_sq = self.particle.position.distance_sq(&other.particle.position);
            if d_sq > 0.0 && d_sq < desired_separation * desired_separation {
                let diff = (self.particle.position - other.particle.position).normalize();
                let d = libm::sqrtf(d_sq);
                let weighted_diff = diff / d; 
                steer = steer + weighted_diff;
                count += 1;
            }
        }

        if count > 0 {
            steer = steer / (count as f32);
        }
        
        if steer.mag_sq() > 0.0 {
            steer = steer.normalize() * self.particle.max_speed;
            steer = steer - self.particle.velocity;
            steer = steer.limit(self.particle.max_force);
        }
        
        steer
    }

    fn align(&self, boids: &[Boid]) -> Vec2 {
        let neighbor_dist = 50.0f32;
        let mut sum = Vec2::zero();
        let mut count = 0;

        for other in boids {
            let d_sq = self.particle.position.distance_sq(&other.particle.position);
            if d_sq > 0.0 && d_sq < neighbor_dist * neighbor_dist {
                sum = sum + other.particle.velocity;
                count += 1;
            }
        }

        if count > 0 {
            sum = sum / (count as f32);
            sum = sum.normalize() * self.particle.max_speed;
            let steer = sum - self.particle.velocity;
            return steer.limit(self.particle.max_force);
        }
        
        Vec2::zero()
    }

    fn cohesion(&self, boids: &[Boid]) -> Vec2 {
        let neighbor_dist = 50.0f32;
        let mut sum = Vec2::zero();
        let mut count = 0;

        for other in boids {
            let d_sq = self.particle.position.distance_sq(&other.particle.position);
            if d_sq > 0.0 && d_sq < neighbor_dist * neighbor_dist {
                sum = sum + other.particle.position;
                count += 1;
            }
        }

        if count > 0 {
            sum = sum / (count as f32);
            return self.seek(sum);
        }
        
        Vec2::zero()
    }

    fn seek(&self, target: Vec2) -> Vec2 {
        let desired = target - self.particle.position;
        let desired = desired.normalize() * self.particle.max_speed;
        let steer = desired - self.particle.velocity;
        steer.limit(self.particle.max_force)
    }

    pub fn edges(&mut self, width: f32, height: f32) {
        if self.particle.position.x > width { self.particle.position.x = 0.0; }
        else if self.particle.position.x < 0.0 { self.particle.position.x = width; }
        
        if self.particle.position.y > height { self.particle.position.y = 0.0; }
        else if self.particle.position.y < 0.0 { self.particle.position.y = height; }
    }
    
    pub fn update_ekf(&mut self, dt: f32) {
        self.ekf.predict(self.particle.velocity, dt);
        let noisy_pos = self.particle.position; 
        self.ekf.update(noisy_pos);
    }
}

#[cfg(test)]
#[path = "boids_tests.rs"]
mod tests;
