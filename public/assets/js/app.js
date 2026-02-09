
const IMAGES = {
    // White pieces
    wK: "public/assets/images/wK.svg",
    wQ: "public/assets/images/wQ.svg",
    wR: "public/assets/images/wR.svg",
    wB: "public/assets/images/wB.svg",
    wN: "public/assets/images/wN.svg",
    wP: "public/assets/images/wP.svg",

    // Black pieces
    bK: "public/assets/images/bK.svg",
    bQ: "public/assets/images/bQ.svg",
    bR: "public/assets/images/bR.svg",
    bB: "public/assets/images/bB.svg",
    bN: "public/assets/images/bN.svg",
    bP: "public/assets/images/bP.svg"
};

class AssetLoader {
    static loadImages(imageMap) {
        const entries = Object.entries(imageMap);

        return Promise.all(
            entries.map(([key, src]) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve([key, img]);
                    img.onerror = reject;
                });
            })
        ).then(results => Object.fromEntries(results));
    }
}

AssetLoader.loadImages(IMAGES).then(images => {
    let game = new Game(new Renderer(images));
    game.start();
});

