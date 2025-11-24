use crate::math::Vec2;

// ... Mat2 struct and impls ...

/// Simple 2x2 Matrix for 2D EKF
#[derive(Clone, Copy, Debug)]
pub struct Mat2 {
    pub m11: f32,
    pub m12: f32,
    pub m21: f32,
    pub m22: f32,
}

impl Mat2 {
    pub fn identity() -> Self {
        Self {
            m11: 1.0,
            m12: 0.0,
            m21: 0.0,
            m22: 1.0,
        }
    }

    pub fn zero() -> Self {
        Self {
            m11: 0.0,
            m12: 0.0,
            m21: 0.0,
            m22: 0.0,
        }
    }

    pub fn new(m11: f32, m12: f32, m21: f32, m22: f32) -> Self {
        Self { m11, m12, m21, m22 }
    }

    pub fn mul_vec(&self, v: Vec2) -> Vec2 {
        Vec2::new(
            self.m11 * v.x + self.m12 * v.y,
            self.m21 * v.x + self.m22 * v.y,
        )
    }

    pub fn mul(&self, other: Mat2) -> Mat2 {
        Mat2 {
            m11: self.m11 * other.m11 + self.m12 * other.m21,
            m12: self.m11 * other.m12 + self.m12 * other.m22,
            m21: self.m21 * other.m11 + self.m22 * other.m21,
            m22: self.m21 * other.m12 + self.m22 * other.m22,
        }
    }

    pub fn transpose(&self) -> Mat2 {
        Mat2 {
            m11: self.m11,
            m12: self.m21,
            m21: self.m12,
            m22: self.m22,
        }
    }

    pub fn add(&self, other: Mat2) -> Mat2 {
        Mat2 {
            m11: self.m11 + other.m11,
            m12: self.m12 + other.m12,
            m21: self.m21 + other.m21,
            m22: self.m22 + other.m22,
        }
    }

    pub fn sub(&self, other: Mat2) -> Mat2 {
        Mat2 {
            m11: self.m11 - other.m11,
            m12: self.m12 - other.m12,
            m21: self.m21 - other.m21,
            m22: self.m22 - other.m22,
        }
    }

    // Simple inverse for 2x2
    pub fn inverse(&self) -> Option<Mat2> {
        let det = self.m11 * self.m22 - self.m12 * self.m21;
        if det.abs() < 1e-6 {
            return None;
        }
        let inv_det = 1.0 / det;
        Some(Mat2 {
            m11: self.m22 * inv_det,
            m12: -self.m12 * inv_det,
            m21: -self.m21 * inv_det,
            m22: self.m11 * inv_det,
        })
    }
}

// ... EKF struct and impls ...

/// Extended Kalman Filter for 2D Unicycle Model
/// State: [x, y, theta] (approximated here as [x, y] + velocity for simplicity in boid context,
/// but we'll do a proper discrete step estimation)
#[derive(Clone, Debug)]
pub struct EKF {
    pub state: Vec2,             // Estimated Position
    pub covariance: Mat2,        // P matrix
    pub process_noise: Mat2,     // Q
    pub measurement_noise: Mat2, // R
}

impl EKF {
    pub fn new(initial_pos: Vec2) -> Self {
        Self {
            state: initial_pos,
            covariance: Mat2::identity(), // High uncertainty initially? Or identity.
            process_noise: Mat2::new(0.1, 0.0, 0.0, 0.1), // Low process noise
            measurement_noise: Mat2::new(1.0, 0.0, 0.0, 1.0), // Higher measurement noise
        }
    }

    pub fn predict(&mut self, velocity: Vec2, dt: f32) {
        // x_pred = F * x + B * u
        // Linear model for position update: pos = pos + vel * dt
        // Jacobian F is Identity for simple linear motion
        let f = Mat2::identity();

        self.state = self.state + velocity * dt;

        // P_pred = F * P * F' + Q
        let p_ft = self.covariance.mul(f.transpose());
        let f_p_ft = f.mul(p_ft);
        self.covariance = f_p_ft.add(self.process_noise);
    }

    pub fn update(&mut self, measurement: Vec2) {
        // y = z - H * x_pred
        // H is Identity if we measure position directly
        let h = Mat2::identity();
        let y = measurement - self.state;

        // S = H * P_pred * H' + R
        let p_ht = self.covariance.mul(h.transpose());
        let h_p_ht = h.mul(p_ht);
        let s = h_p_ht.add(self.measurement_noise);

        // K = P_pred * H' * S^-1
        if let Some(s_inv) = s.inverse() {
            let k = p_ht.mul(s_inv); // p_ht is P * H'

            // x_new = x_pred + K * y
            self.state = self.state + k.mul_vec(y);

            // P_new = (I - K * H) * P_pred
            let kh = k.mul(h);
            let i = Mat2::identity();
            let i_minus_kh = i.sub(kh);
            self.covariance = i_minus_kh.mul(self.covariance);
        }
    }
}

#[cfg(test)]
#[path = "ekf_tests.rs"]
mod tests;
