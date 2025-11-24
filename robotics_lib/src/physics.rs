use crate::math::Vec2;

#[derive(Clone, Copy, Debug)]
pub struct Particle {
    pub position: Vec2,
    pub velocity: Vec2,
    pub acceleration: Vec2,
    pub max_speed: f32,
    pub max_force: f32,
}

impl Particle {
    pub fn new(x: f32, y: f32) -> Self {
        Self {
            position: Vec2::new(x, y),
            velocity: Vec2::zero(),
            acceleration: Vec2::zero(),
            max_speed: 4.0,
            max_force: 0.1,
        }
    }

    pub fn apply_force(&mut self, force: Vec2) {
        self.acceleration = self.acceleration + force;
    }

    pub fn update(&mut self) {
        self.velocity = self.velocity + self.acceleration;
        self.velocity = self.velocity.limit(self.max_speed);
        self.position = self.position + self.velocity;
        self.acceleration = Vec2::zero();
    }
}

#[cfg(test)]
#[path = "physics_tests.rs"]
mod tests;
