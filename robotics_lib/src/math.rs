use core::ops::{Add, Div, Mul, Sub};

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vec2 {
    pub x: f32,
    pub y: f32,
}

// ... existing impls ...

impl Vec2 {
    pub fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }

    pub fn zero() -> Self {
        Self { x: 0.0, y: 0.0 }
    }

    pub fn mag_sq(&self) -> f32 {
        self.x * self.x + self.y * self.y
    }

    pub fn mag(&self) -> f32 {
        libm::sqrtf(self.mag_sq())
    }

    pub fn normalize(&self) -> Self {
        let m = self.mag();
        if m > 0.0 {
            *self / m
        } else {
            Self::zero()
        }
    }

    pub fn limit(&self, max: f32) -> Self {
        if self.mag_sq() > max * max {
            self.normalize() * max
        } else {
            *self
        }
    }

    pub fn distance_sq(&self, other: &Vec2) -> f32 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        dx * dx + dy * dy
    }
}

impl Add for Vec2 {
    type Output = Self;
    fn add(self, other: Self) -> Self {
        Self {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

impl Sub for Vec2 {
    type Output = Self;
    fn sub(self, other: Self) -> Self {
        Self {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }
}

impl Mul<f32> for Vec2 {
    type Output = Self;
    fn mul(self, scalar: f32) -> Self {
        Self {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }
}

impl Div<f32> for Vec2 {
    type Output = Self;
    fn div(self, scalar: f32) -> Self {
        if scalar != 0.0 {
            Self {
                x: self.x / scalar,
                y: self.y / scalar,
            }
        } else {
            Self::zero()
        }
    }
}

#[cfg(test)]
#[path = "math_tests.rs"]
mod tests;
