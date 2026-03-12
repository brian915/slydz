
current_page_url = window.location.pathname;
current_filename = current_page_url.substring(current_page_url.lastIndexOf('/') + 1);

slide_number_match = current_filename.match(/presentation_slide_(\d+)\.html/);
current_slide_number = parseInt(slide_number_match[1]);

previous_slide_number = current_slide_number - 1;
next_slide_number = current_slide_number + 1;

previous_slide_filename = "presentation_slide_" + previous_slide_number + ".html";
next_slide_filename = "presentation_slide_" + next_slide_number + ".html";

prev_button = document.getElementById("prevBtn");
next_button = document.getElementById("nextBtn");

if (current_slide_number === 1) {
    prev_button.disabled = true;
    prev_button.style.display = "none";
} else {
    prev_button.disabled = false;
    prev_button.style.display = "inline-block";
    prev_button.addEventListener("click", function() {
        window.location.href = previous_slide_filename;
    });
}

if (current_slide_number === DECK_TOTAL_SLIDES) {
    next_button.disabled = true;
    next_button.style.display = "none";
} else {
    next_button.disabled = false;
    next_button.style.display = "inline-block";
    next_button.addEventListener("click", function() {
        window.location.href = next_slide_filename;
    });
}


















































