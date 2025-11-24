#[cfg(test)]
mod tests {
    use crate::math::Vec2;
    use crate::spatial::Rect;

    // ==================== RECT CONSTRUCTION ====================

    #[test]
    fn test_rect_creation() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        assert_eq!(r.x, 100.0);
        assert_eq!(r.y, 100.0);
        assert_eq!(r.w, 50.0);
        assert_eq!(r.h, 50.0);
    }

    // ==================== RECT CONTAINS ====================

    #[test]
    fn test_rect_contains_center() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        // Center point should be inside
        assert!(r.contains(Vec2::new(100.0, 100.0)));
    }

    #[test]
    fn test_rect_contains_inside() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        // Point inside but not at center
        assert!(r.contains(Vec2::new(120.0, 80.0)));
    }

    #[test]
    fn test_rect_contains_edge_left() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        // On left edge (x = 100 - 50 = 50)
        assert!(r.contains(Vec2::new(50.0, 100.0)));
    }

    #[test]
    fn test_rect_contains_edge_right() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        // On right edge (x = 100 + 50 = 150)
        assert!(r.contains(Vec2::new(150.0, 100.0)));
    }

    #[test]
    fn test_rect_contains_edge_top() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        // On top edge (y = 100 - 50 = 50)
        assert!(r.contains(Vec2::new(100.0, 50.0)));
    }

    #[test]
    fn test_rect_contains_edge_bottom() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        // On bottom edge (y = 100 + 50 = 150)
        assert!(r.contains(Vec2::new(100.0, 150.0)));
    }

    #[test]
    fn test_rect_contains_corner() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        // On corner
        assert!(r.contains(Vec2::new(50.0, 50.0)));
        assert!(r.contains(Vec2::new(150.0, 150.0)));
    }

    #[test]
    fn test_rect_not_contains_outside_left() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        assert!(!r.contains(Vec2::new(49.0, 100.0)));
    }

    #[test]
    fn test_rect_not_contains_outside_right() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        assert!(!r.contains(Vec2::new(151.0, 100.0)));
    }

    #[test]
    fn test_rect_not_contains_outside_top() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        assert!(!r.contains(Vec2::new(100.0, 49.0)));
    }

    #[test]
    fn test_rect_not_contains_outside_bottom() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 50.0,
            h: 50.0,
        };
        assert!(!r.contains(Vec2::new(100.0, 151.0)));
    }

    // ==================== RECT AT ORIGIN ====================

    #[test]
    fn test_rect_at_origin() {
        let r = Rect {
            x: 0.0,
            y: 0.0,
            w: 10.0,
            h: 10.0,
        };
        // Center
        assert!(r.contains(Vec2::new(0.0, 0.0)));
        // Inside
        assert!(r.contains(Vec2::new(5.0, 5.0)));
        // Edge
        assert!(r.contains(Vec2::new(-10.0, 0.0)));
        assert!(r.contains(Vec2::new(10.0, 0.0)));
    }

    // ==================== RECT WITH NEGATIVE COORDS ====================

    #[test]
    fn test_rect_negative_center() {
        let r = Rect {
            x: -50.0,
            y: -50.0,
            w: 25.0,
            h: 25.0,
        };
        assert!(r.contains(Vec2::new(-50.0, -50.0)));
        assert!(r.contains(Vec2::new(-60.0, -60.0)));
        assert!(!r.contains(Vec2::new(-80.0, -50.0)));
    }

    // ==================== RECT ZERO SIZE ====================

    #[test]
    fn test_rect_zero_size() {
        let r = Rect {
            x: 100.0,
            y: 100.0,
            w: 0.0,
            h: 0.0,
        };
        // Only the center point should be contained
        assert!(r.contains(Vec2::new(100.0, 100.0)));
        assert!(!r.contains(Vec2::new(100.1, 100.0)));
    }
}
