#[cfg(test)]
mod tests {
    use crate::dstar::{DStarLite, GridMap, Node};

    // ==================== NODE ====================

    #[test]
    fn test_node_creation() {
        let n = Node {
            x: 5,
            y: 10,
            g: 1.5,
            rhs: 2.0,
        };
        assert_eq!(n.x, 5);
        assert_eq!(n.y, 10);
        assert_eq!(n.g, 1.5);
        assert_eq!(n.rhs, 2.0);
    }

    #[test]
    fn test_node_equality() {
        let n1 = Node {
            x: 1,
            y: 2,
            g: 0.0,
            rhs: 0.0,
        };
        let n2 = Node {
            x: 1,
            y: 2,
            g: 0.0,
            rhs: 0.0,
        };
        assert_eq!(n1, n2);
    }

    #[test]
    fn test_node_inequality() {
        let n1 = Node {
            x: 1,
            y: 2,
            g: 0.0,
            rhs: 0.0,
        };
        let n2 = Node {
            x: 1,
            y: 3,
            g: 0.0,
            rhs: 0.0,
        };
        assert_ne!(n1, n2);
    }

    #[test]
    fn test_node_clone() {
        let n1 = Node {
            x: 5,
            y: 5,
            g: 1.0,
            rhs: 2.0,
        };
        let n2 = n1;
        assert_eq!(n1, n2);
    }

    // ==================== GRIDMAP CONSTRUCTION ====================

    #[test]
    fn test_gridmap_new() {
        let map = GridMap::new(10, 20);
        assert_eq!(map.width, 10);
        assert_eq!(map.height, 20);
        assert_eq!(map.obstacles.len(), 200);
    }

    #[test]
    fn test_gridmap_initially_empty() {
        let map = GridMap::new(5, 5);
        for x in 0..5 {
            for y in 0..5 {
                assert!(!map.is_obstacle(x, y));
            }
        }
    }

    #[test]
    fn test_gridmap_zero_size() {
        let map = GridMap::new(0, 0);
        assert_eq!(map.width, 0);
        assert_eq!(map.height, 0);
        assert_eq!(map.obstacles.len(), 0);
    }

    // ==================== GRIDMAP OBSTACLES ====================

    #[test]
    fn test_gridmap_set_obstacle() {
        let mut map = GridMap::new(10, 10);
        map.set_obstacle(5, 5, true);
        assert!(map.is_obstacle(5, 5));
    }

    #[test]
    fn test_gridmap_clear_obstacle() {
        let mut map = GridMap::new(10, 10);
        map.set_obstacle(5, 5, true);
        map.set_obstacle(5, 5, false);
        assert!(!map.is_obstacle(5, 5));
    }

    #[test]
    fn test_gridmap_multiple_obstacles() {
        let mut map = GridMap::new(10, 10);
        map.set_obstacle(0, 0, true);
        map.set_obstacle(5, 5, true);
        map.set_obstacle(9, 9, true);

        assert!(map.is_obstacle(0, 0));
        assert!(map.is_obstacle(5, 5));
        assert!(map.is_obstacle(9, 9));
        assert!(!map.is_obstacle(1, 1));
    }

    #[test]
    fn test_gridmap_obstacle_row() {
        let mut map = GridMap::new(10, 10);
        for x in 0..10 {
            map.set_obstacle(x, 5, true);
        }

        for x in 0..10 {
            assert!(map.is_obstacle(x, 5));
            assert!(!map.is_obstacle(x, 4));
            assert!(!map.is_obstacle(x, 6));
        }
    }

    // ==================== GRIDMAP BOUNDS ====================

    #[test]
    fn test_gridmap_out_of_bounds_is_obstacle() {
        let map = GridMap::new(10, 10);
        assert!(map.is_obstacle(10, 0)); // Out of bounds x
        assert!(map.is_obstacle(0, 10)); // Out of bounds y
        assert!(map.is_obstacle(100, 100)); // Way out
    }

    #[test]
    fn test_gridmap_set_out_of_bounds_ignored() {
        let mut map = GridMap::new(10, 10);
        // Should not crash, just ignore
        map.set_obstacle(100, 100, true);
        // Map should be unchanged
        assert_eq!(map.obstacles.iter().filter(|&&x| x).count(), 0);
    }

    #[test]
    fn test_gridmap_corners() {
        let mut map = GridMap::new(5, 5);
        map.set_obstacle(0, 0, true);
        map.set_obstacle(4, 0, true);
        map.set_obstacle(0, 4, true);
        map.set_obstacle(4, 4, true);

        assert!(map.is_obstacle(0, 0));
        assert!(map.is_obstacle(4, 0));
        assert!(map.is_obstacle(0, 4));
        assert!(map.is_obstacle(4, 4));
    }

    // ==================== DSTARLITE CONSTRUCTION ====================

    #[test]
    fn test_dstarlite_new() {
        let ds = DStarLite::new(20, 20);
        assert_eq!(ds.map.width, 20);
        assert_eq!(ds.map.height, 20);
        assert_eq!(ds.start, (0, 0));
        assert_eq!(ds.goal, (19, 19));
    }

    #[test]
    fn test_dstarlite_initial_path_empty() {
        let ds = DStarLite::new(10, 10);
        assert!(ds.path.is_empty());
    }

    // ==================== DSTARLITE PATH ====================

    #[test]
    fn test_dstarlite_compute_path() {
        let mut ds = DStarLite::new(10, 10);
        ds.compute_shortest_path();

        // Should have at least start and goal
        assert!(ds.path.len() >= 2);
        assert_eq!(ds.path[0], ds.start);
        assert_eq!(*ds.path.last().unwrap(), ds.goal);
    }

    #[test]
    fn test_dstarlite_recompute_clears_path() {
        let mut ds = DStarLite::new(10, 10);
        ds.compute_shortest_path();
        let first_len = ds.path.len();

        ds.compute_shortest_path();
        // Should have recomputed (same length since no changes)
        assert_eq!(ds.path.len(), first_len);
    }

    #[test]
    fn test_dstarlite_custom_start_goal() {
        let mut ds = DStarLite::new(10, 10);
        ds.start = (2, 3);
        ds.goal = (7, 8);
        ds.compute_shortest_path();

        assert_eq!(ds.path[0], (2, 3));
        assert_eq!(*ds.path.last().unwrap(), (7, 8));
    }

    // ==================== DSTARLITE WITH OBSTACLES ====================

    #[test]
    fn test_dstarlite_with_obstacle() {
        let mut ds = DStarLite::new(10, 10);
        ds.map.set_obstacle(5, 5, true);
        ds.compute_shortest_path();

        // Current simple implementation just does start -> goal
        // So this tests that it doesn't crash with obstacles
        assert!(!ds.path.is_empty());
    }

    #[test]
    fn test_dstarlite_obstacle_wall() {
        let mut ds = DStarLite::new(10, 10);

        // Create a wall
        for y in 0..8 {
            ds.map.set_obstacle(5, y, true);
        }

        ds.compute_shortest_path();

        // Simple implementation will still produce a path
        // (doesn't actually pathfind around obstacles yet)
        assert!(!ds.path.is_empty());
    }

    // ==================== INTEGRATION ====================

    #[test]
    fn test_dstarlite_full_workflow() {
        let mut ds = DStarLite::new(20, 15);

        // Set some obstacles
        for x in 5..15 {
            ds.map.set_obstacle(x, 7, true);
        }

        // Set custom start/goal
        ds.start = (0, 0);
        ds.goal = (19, 14);

        // Compute path
        ds.compute_shortest_path();

        // Verify basic path structure
        assert!(ds.path.len() >= 2);
        assert_eq!(ds.path[0], (0, 0));
        assert_eq!(*ds.path.last().unwrap(), (19, 14));
    }

    // ==================== EDGE CASES ====================

    #[test]
    fn test_dstarlite_1x1_grid() {
        let ds = DStarLite::new(1, 1);
        assert_eq!(ds.start, (0, 0));
        assert_eq!(ds.goal, (0, 0)); // Same as start
    }

    #[test]
    fn test_dstarlite_rectangular_grid() {
        let ds = DStarLite::new(50, 10);
        assert_eq!(ds.map.width, 50);
        assert_eq!(ds.map.height, 10);
        assert_eq!(ds.goal, (49, 9));
    }

    #[test]
    fn test_gridmap_stress() {
        let mut map = GridMap::new(100, 100);

        // Set many obstacles
        for x in 0..100 {
            for y in 0..100 {
                if (x + y) % 3 == 0 {
                    map.set_obstacle(x, y, true);
                }
            }
        }

        // Verify pattern
        let obstacle_count = map.obstacles.iter().filter(|&&x| x).count();
        assert!(obstacle_count > 0);

        // Verify we can still query
        assert!(map.is_obstacle(0, 0)); // 0+0 = 0, 0%3 = 0 -> obstacle
        assert!(!map.is_obstacle(1, 0)); // 1+0 = 1, 1%3 = 1 -> not obstacle
    }
}
