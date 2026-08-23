/* =========================================
   MECHANICAL DRAWING APPLICATION
   FLANGE DESIGN
========================================= */


// =========================================
// DEFAULT DIMENSIONS
// =========================================

const DEFAULTS = {
    outerDiameter: 100,
    innerDiameter: 40,
    thickness: 15,
    boltCircle: 70
};


// =========================================
// GET ELEMENTS
// =========================================

const outerDiameterInput =
    document.getElementById("outerDiameter");

const innerDiameterInput =
    document.getElementById("innerDiameter");

const thicknessInput =
    document.getElementById("thickness");

const boltCircleInput =
    document.getElementById("boltCircle");


const outerDiameterDisplay =
    document.getElementById("outerDiameterDisplay");

const innerDiameterDisplay =
    document.getElementById("innerDiameterDisplay");

const thicknessDisplay =
    document.getElementById("thicknessDisplay");

const boltCircleDisplay =
    document.getElementById("boltCircleDisplay");


const outerDiameterDimension =
    document.getElementById("outerDiameterDimension");

const innerDiameterDimension =
    document.getElementById("innerDiameterDimension");

const thicknessDimension =
    document.getElementById("thicknessDimension");


const frontOuter =
    document.getElementById("frontOuter");

const frontInner =
    document.getElementById("frontInner");

const frontBoltCircle =
    document.getElementById("frontBoltCircle");


const frontBoltHoles =
    document.querySelectorAll(
        "#frontBoltHoles circle"
    );


const sideProfile =
    document.getElementById("sideProfile");


// =========================================
// READ CURRENT VALUES
// =========================================

function getDimensions() {

    return {

        outerDiameter:
            Number(outerDiameterInput.value),

        innerDiameter:
            Number(innerDiameterInput.value),

        thickness:
            Number(thicknessInput.value),

        boltCircle:
            Number(boltCircleInput.value)

    };

}


// =========================================
// VALIDATE DIMENSIONS
// =========================================

function validateDimensions(dimensions) {

    const {
        outerDiameter,
        innerDiameter,
        thickness,
        boltCircle
    } = dimensions;


    if (innerDiameter >= outerDiameter) {

        alert(
            "Inner diameter must be smaller than outer diameter."
        );

        return false;
    }


    if (boltCircle >= outerDiameter) {

        alert(
            "Bolt circle diameter must be smaller than outer diameter."
        );

        return false;
    }


    if (boltCircle <= innerDiameter) {

        alert(
            "Bolt circle diameter must be larger than inner diameter."
        );

        return false;
    }


    if (
        outerDiameter <= 0 ||
        innerDiameter <= 0 ||
        thickness <= 0 ||
        boltCircle <= 0
    ) {

        alert(
            "All dimensions must be greater than zero."
        );

        return false;
    }


    return true;
}


// =========================================
// UPDATE TEXT
// =========================================

function updateDimensionText(dimensions) {

    const {
        outerDiameter,
        innerDiameter,
        thickness,
        boltCircle
    } = dimensions;


    outerDiameterDisplay.textContent =
        `${outerDiameter} mm`;

    innerDiameterDisplay.textContent =
        `${innerDiameter} mm`;

    thicknessDisplay.textContent =
        `${thickness} mm`;

    boltCircleDisplay.textContent =
        `${boltCircle} mm`;


    outerDiameterDimension.textContent =
        `Ø${outerDiameter} mm`;

    innerDiameterDimension.textContent =
        `Ø${innerDiameter} mm`;

    thicknessDimension.textContent =
        `${thickness} mm`;

}


// =========================================
// UPDATE FRONT VIEW
// =========================================

function updateFrontView(dimensions) {

    const {
        outerDiameter,
        innerDiameter,
        boltCircle
    } = dimensions;


    /*
        Drawing scale:

        100 mm = 150 SVG units

        Therefore:

        scale = 1.5
    */

    const scale = 1.5;


    const outerRadius =
        (outerDiameter / 2) * scale;


    const innerRadius =
        (innerDiameter / 2) * scale;


    const boltRadius =
        (boltCircle / 2) * scale;


    frontOuter.setAttribute(
        "r",
        outerRadius
    );


    frontInner.setAttribute(
        "r",
        innerRadius
    );


    frontBoltCircle.setAttribute(
        "r",
        boltRadius
    );


    /*
        Calculate four bolt positions.
    */

    const centerX = 300;
    const centerY = 260;


    const positions = [

        {
            x: centerX,
            y: centerY - boltRadius
        },

        {
            x: centerX + boltRadius,
            y: centerY
        },

        {
            x: centerX,
            y: centerY + boltRadius
        },

        {
            x: centerX - boltRadius,
            y: centerY
        }

    ];


    frontBoltHoles.forEach(
        (hole, index) => {

            hole.setAttribute(
                "cx",
                positions[index].x
            );

            hole.setAttribute(
                "cy",
                positions[index].y
            );

        }
    );

}


// =========================================
// UPDATE SIDE VIEW
// =========================================

function updateSideView(dimensions) {

    const {
        outerDiameter,
        thickness
    } = dimensions;


    /*
        Side view scale.

        100 mm = 140 SVG units

        Therefore:

        scale = 1.4
    */

    const scale = 1.4;


    const width =
        thickness * scale;


    const height =
        outerDiameter * scale;


    /*
        Keep drawing inside the SVG.
    */

    const x =
        700 - width / 2;


    const y =
        555 - height / 2;


    sideProfile.setAttribute(
        "x",
        x
    );


    sideProfile.setAttribute(
        "y",
        y
    );


    sideProfile.setAttribute(
        "width",
        width
    );


    sideProfile.setAttribute(
        "height",
        height
    );

}


// =========================================
// UPDATE COMPLETE DRAWING
// =========================================

function updateDrawing() {

    const dimensions =
        getDimensions();


    if (
        !validateDimensions(
            dimensions
        )
    ) {

        return;
    }


    updateDimensionText(
        dimensions
    );


    updateFrontView(
        dimensions
    );


    updateSideView(
        dimensions
    );


    console.log(
        "Drawing updated:",
        dimensions
    );

}


// =========================================
// RESET DIMENSIONS
// =========================================

function resetDimensions() {

    outerDiameterInput.value =
        DEFAULTS.outerDiameter;

    innerDiameterInput.value =
        DEFAULTS.innerDiameter;

    thicknessInput.value =
        DEFAULTS.thickness;

    boltCircleInput.value =
        DEFAULTS.boltCircle;


    updateDrawing();

}


// =========================================
// REAL-TIME INPUT
// =========================================

[
    outerDiameterInput,
    innerDiameterInput,
    thicknessInput,
    boltCircleInput

].forEach(input => {

    input.addEventListener(
        "input",
        updateDrawing
    );

});


// =========================================
// UPDATE BUTTON
// =========================================

document
    .getElementById("updateDrawingBtn")
    .addEventListener(
        "click",
        updateDrawing
    );


// =========================================
// RESET BUTTON
// =========================================

document
    .getElementById("resetDimensionsBtn")
    .addEventListener(
        "click",
        resetDimensions
    );


// =========================================
// RESET VIEW
// =========================================

document
    .getElementById("resetViewBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("drawing-wrapper")
                ?.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: "smooth"
                });

        }
    );


// =========================================
// PRINT / PDF
// =========================================

document
    .getElementById("printBtn")
    .addEventListener(
        "click",
        () => {

            window.print();

        }
    );


// =========================================
// EXPORT SVG
// =========================================

document
    .getElementById("svgBtn")
    .addEventListener(
        "click",
        exportSVG
    );


function exportSVG() {

    const svg =
        document.getElementById(
            "technicalDrawing"
        );


    const serializer =
        new XMLSerializer();


    let source =
        serializer.serializeToString(
            svg
        );


    /*
        Add XML declaration.
    */

    source =
        '<?xml version="1.0" standalone="no"?>\r\n'
        + source;


    const blob =
        new Blob(
            [source],
            {
                type: "image/svg+xml;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "flange-technical-drawing.svg";


    document
        .body
        .appendChild(link);


    link.click();


    document
        .body
        .removeChild(link);


    URL.revokeObjectURL(url);

}


// =========================================
// INITIAL DRAWING
// =========================================

updateDrawing();