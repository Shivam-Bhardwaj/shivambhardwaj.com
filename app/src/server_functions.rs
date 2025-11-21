use leptos::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BlogPost {
    pub slug: String,
    pub title: String,
    pub date: String,
    pub content: String, // HTML content
}

#[server(GetBlogPosts, "/api")]
pub async fn get_blog_posts() -> Result<Vec<BlogPost>, ServerFnError> {
    // In a real scenario, this would read from the /content folder
    // For this MVP/Plan, we'll return simulated data or read 1 file if exists
    // To be fully vertical, we'd implement the file reading here.
    
    let posts = vec![
        BlogPost {
            slug: "welcome".to_string(),
            title: "Welcome to Antimony Labs".to_string(),
            date: "2025-11-21".to_string(),
            content: "<p>This is the first mission log.</p>".to_string(),
        }
    ];
    
    Ok(posts)
}

