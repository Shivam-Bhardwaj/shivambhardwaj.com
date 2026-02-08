use leptos::prelude::*;

/// Single quarter - placeholder for memories
///
/// Future: Will show:
/// - Celestial events (night sky)
/// - What you did that quarter
/// - Link to blog post for details
#[component]
pub fn Quarter(number: u32) -> impl IntoView {
    view! {
        <div
            class="quarter min-w-[3rem] h-24 md:h-32 bg-green-900/20 hover:bg-green-500/30
                   transition-colors cursor-pointer border-l border-green-900/30
                   flex items-center justify-center text-xs md:text-sm text-green-400
                   relative group"
            data-quarter=number
        >
            <span class="quarter-number">"Q" {number}</span>

            // Tooltip on hover (placeholder for celestial events)
            <div class="absolute bottom-full mb-2 hidden group-hover:block
                        bg-black/90 text-white text-xs p-2 rounded whitespace-nowrap">
                "Quarter " {number} " - Placeholder"
            </div>
        </div>
    }
}
