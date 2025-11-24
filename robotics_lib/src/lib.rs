#![no_std]

extern crate alloc; // needed for Vec

pub mod boids;
pub mod dstar;
pub mod ekf;
pub mod math;
pub mod physics;
pub mod spatial;

#[cfg(test)]
mod integration_tests;
