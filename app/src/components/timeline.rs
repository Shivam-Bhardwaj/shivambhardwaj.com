use leptos::prelude::*;
use super::quarter::Quarter;

/// Life timeline in quarters (3 months each)
/// 128 quarters ≈ 32 years from birth to now
///
/// Design: Circle with bubbles (like too.foo) showing:
/// - Outer ring: Celestial events for that quarter
/// - Bubbles: Quarter numbers
/// - Center: Short sentences of activities
/// - "Know more" links to blog posts
#[component]
pub fn LifeTimeline() -> impl IntoView {
    let total_quarters = 128;

    view! {
        <div class="timeline-container w-full min-h-screen flex items-center justify-center p-4 md:p-8">
            // Horizontal scrollable timeline
            <div class="flex gap-2 overflow-x-auto pb-4">
                <For
                    each=move || (1..=total_quarters).rev()
                    key=|q| *q
                    children=move |quarter| {
                        view! { <Quarter number=quarter /> }
                    }
                />
            </div>
        </div>
    }
}
