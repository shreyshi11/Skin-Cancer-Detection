// =====================================================
// DOM ELEMENTS
// =====================================================

const dropArea = document.getElementById("dropArea");

const fileInput = document.getElementById("fileInput");

const browseBtn = document.getElementById("browseBtn");

const preview = document.getElementById("preview");

const analyzeBtn = document.getElementById("analyzeBtn");

const loadingMessage =
    document.getElementById("loadingMessage");

const analysisResult =
    document.getElementById("analysisResult");

const resultContent =
    document.getElementById("resultContent");

const predictionElement =
    document.getElementById("prediction");

const confidenceElement =
    document.getElementById("confidence");

const aiInsights =
    document.getElementById("aiInsights");

const uploadNotification =
    document.getElementById("uploadNotification");


// =====================================================
// FASTAPI BACKEND URL
// =====================================================

// This URL is for your current local/Colab testing.
//
// Later, when you deploy FastAPI,
// replace this with your public backend URL.

const API_URL =
    "http://127.0.0.1:8000/predict";


// =====================================================
// SELECTED FILE
// =====================================================

let selectedFile = null;


// =====================================================
// BROWSE BUTTON
// =====================================================

browseBtn.addEventListener("click", function (event) {

    // Prevent click from triggering dropArea twice
    event.stopPropagation();

    fileInput.click();

});


// =====================================================
// DROP AREA CLICK
// =====================================================

dropArea.addEventListener("click", function () {

    fileInput.click();

});


// =====================================================
// FILE INPUT
// =====================================================

fileInput.addEventListener(
    "change",
    function () {

        const file =
            fileInput.files[0];

        if (!file) {
            return;
        }

        handleSelectedFile(file);

    }
);


// =====================================================
// HANDLE SELECTED FILE
// =====================================================

function handleSelectedFile(file) {

    // Check whether file is an image

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image file."
        );

        return;
    }


    // Store selected file

    selectedFile = file;


    // Create image preview

    preview.src =
        URL.createObjectURL(file);

    preview.style.display =
        "block";


    // Show analyze button

    analyzeBtn.style.display =
        "inline-block";


    // Reset previous result

    analysisResult.style.display =
        "block";

    resultContent.style.display =
        "none";


    // Update notification

    uploadNotification.innerText =
        "✔ Image uploaded successfully";


    // Update text

    const emptyText =
        analysisResult.querySelector("p");

    const emptySpan =
        analysisResult.querySelector("span");


    if (emptyText) {

        emptyText.innerText =
            file.name;

    }


    if (emptySpan) {

        emptySpan.innerText =
            "Click Analyze Image to start AI prediction";

    }

}


// =====================================================
// DRAG & DROP
// =====================================================

dropArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropArea.classList.add("dragging");

    }
);


dropArea.addEventListener(
    "dragleave",
    function () {

        dropArea.classList.remove(
            "dragging"
        );

    }
);


dropArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropArea.classList.remove(
            "dragging"
        );


        const file =
            event.dataTransfer.files[0];


        if (!file) {
            return;
        }


        handleSelectedFile(file);

    }
);


// =====================================================
// ANALYZE BUTTON
// =====================================================

analyzeBtn.addEventListener(
    "click",
    async function () {

        // Check file

        if (!selectedFile) {

            alert(
                "Please upload an image first."
            );

            return;

        }


        // Disable button

        analyzeBtn.disabled =
            true;


        analyzeBtn.innerText =
            "Analyzing...";


        // Show loading message

        loadingMessage.style.display =
            "block";


        // Hide previous result

        analysisResult.style.display =
            "none";

        resultContent.style.display =
            "none";


        try {

            // =================================================
            // CREATE FORM DATA
            // =================================================

            const formData =
                new FormData();


            formData.append(
                "file",
                selectedFile
            );


            // =================================================
            // SEND IMAGE TO FASTAPI
            // =================================================

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            // =================================================
            // CHECK RESPONSE
            // =================================================

            if (!response.ok) {

                throw new Error(
                    "Server returned an error."
                );

            }


            // =================================================
            // GET JSON RESPONSE
            // =================================================

            const result =
                await response.json();


            console.log(
                "AI Prediction:",
                result
            );


            // =================================================
            // DISPLAY RESULT
            // =================================================

            displayPrediction(result);

        }


        catch (error) {

            console.error(
                "Prediction Error:",
                error
            );


            // Show error

            analysisResult.style.display =
                "block";


            resultContent.style.display =
                "none";


            const emptyText =
                analysisResult.querySelector("p");


            const emptySpan =
                analysisResult.querySelector("span");


            if (emptyText) {

                emptyText.innerText =
                    "Prediction failed";

            }


            if (emptySpan) {

                emptySpan.innerText =
                    "Make sure the FastAPI server is running";

            }


            alert(
                "Unable to connect to the AI model.\n\n" +
                "Please make sure your FastAPI backend is running."
            );

        }


        finally {

            // Hide loading

            loadingMessage.style.display =
                "none";


            // Enable button

            analyzeBtn.disabled =
                false;


            analyzeBtn.innerText =
                "Analyze Image";

        }

    }
);


// =====================================================
// DISPLAY PREDICTION
// =====================================================

function displayPrediction(result) {

    // =================================================
    // GET RESULT
    // =================================================

    const predictedClass =
        result.prediction;


    const confidence =
        result.confidence;


    // =================================================
    // CONVERT CONFIDENCE TO %
    // =================================================

    const confidencePercentage =
        (confidence * 100).toFixed(2);


    // =================================================
    // DISPLAY RESULT
    // =================================================

    predictionElement.innerText =
        predictedClass;


    confidenceElement.innerText =
        confidencePercentage + "%";


    // =================================================
    // SHOW RESULT SECTION
    // =================================================

    analysisResult.style.display =
        "none";


    resultContent.style.display =
        "block";


    // =================================================
    // AI INSIGHTS
    // =================================================

    let insightText = "";


    switch (predictedClass) {


        case "Melanoma":

            insightText =
                "The model classified this lesion as Melanoma. " +
                "Professional dermatological evaluation is strongly recommended.";

            break;


        case "Basal Cell Carcinoma":

            insightText =
                "The model classified this lesion as Basal Cell Carcinoma. " +
                "The result should be reviewed by a qualified dermatologist.";

            break;


        case "Actinic Keratoses":

            insightText =
                "The model classified this lesion as Actinic Keratoses. " +
                "Please consult a dermatologist for proper evaluation.";

            break;


        case "Benign Keratosis":

            insightText =
                "The model classified this lesion as Benign Keratosis. " +
                "This AI prediction should still be professionally reviewed.";

            break;


        case "Dermatofibroma":

            insightText =
                "The model classified this lesion as Dermatofibroma. " +
                "Professional evaluation is recommended.";

            break;


        case "Melanocytic Nevi":

            insightText =
                "The model classified this lesion as Melanocytic Nevi. " +
                "The prediction is AI-generated and is not a medical diagnosis.";

            break;


        case "Vascular Lesions":

            insightText =
                "The model classified this lesion as Vascular Lesions. " +
                "Please consult a qualified healthcare professional.";

            break;


        default:

            insightText =
                "AI prediction generated successfully. " +
                "Please consult a healthcare professional for interpretation.";

    }


    // =================================================
    // DISPLAY INSIGHT
    // =================================================

    aiInsights.innerHTML =
        `
        <p>
            ${insightText}
        </p>

        <p>
            <strong>Model confidence:</strong>
            ${confidencePercentage}%
        </p>

        <small>
            This system is intended for educational and
            research purposes and should not replace
            professional medical diagnosis.
        </small>
        `;


    // =================================================
    // UPDATE NOTIFICATION
    // =================================================

    uploadNotification.innerText =
        "✔ AI analysis completed";


    // =================================================
    // UPDATE TOTAL SCANS
    // =================================================

    const totalScans =
        document.getElementById(
            "totalScans"
        );


    if (totalScans) {

        let currentScans =
            parseInt(
                totalScans.innerText
            );


        if (!isNaN(currentScans)) {

            totalScans.innerText =
                currentScans + 1;

        }

    }

}


// =====================================================
// CHART
// =====================================================

window.addEventListener(
    "load",
    function () {

        const ctx =
            document.getElementById(
                "barChart"
            );


        if (!ctx) {
            return;
        }


        new Chart(
            ctx,
            {

                type: "bar",


                data: {

                    labels: [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                    ],


                    datasets: [

                        {

                            label:
                                "Scans",


                            data: [
                                35,
                                45,
                                30,
                                55,
                                48,
                                20,
                                15
                            ],


                            backgroundColor:
                                "rgba(59, 130, 246, 0.7)"

                        }

                    ]

                }

            }
        );

    }
);
