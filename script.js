function goTo(map, value) {
    let element = document.querySelector("[map='" + map + "'] .scrollbar");
    let count = element.querySelectorAll(".gallery-image").length + 1;  // +1 is for the 50% spacer from both sides

    element.scrollBy({
        left: element.scrollWidth / count * value,
        behavior: 'smooth'
    });
}

function onMapSelected(map) {
    let maps = document.querySelectorAll("[map]");
    for (let i = 0; i < maps.length; i++) {
        if (maps[i].getAttribute("map") == map) {
            maps[i].style.opacity = 1;
            maps[i].style.pointerEvents = "auto";
        } else {
            maps[i].style.opacity = 0;
            maps[i].style.pointerEvents = "none";
        }
    }
}
