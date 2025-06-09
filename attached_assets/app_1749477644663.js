// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('categorySelect');
    const barcodeTypeSelect = document.getElementById('barcodeTypeSelect');
    const barcodeDataInput = document.getElementById('barcodeData');
    const dataHint = document.getElementById('dataHint');
    const showTextCheckbox = document.getElementById('showText');
    const barColorInput = document.getElementById('barColor');
    const bgColorInput = document.getElementById('bgColor');
    const scaleInput = document.getElementById('scale');
    const generateBtn = document.getElementById('generateBtn');
    const barcodeCanvas = document.getElementById('barcodeCanvas');
    const errorMessageDiv = document.getElementById('errorMessage');
    const downloadPNGButton = document.getElementById('downloadPNG');
    const downloadSVGButton = document.getElementById('downloadSVG');

    let currentBarcodeDef = null; // To store definition of currently selected barcode

    // Populate categories
    for (const categoryName in barcodeCategories) {
        const option = document.createElement('option');
        option.value = categoryName;
        option.textContent = categoryName;
        categorySelect.appendChild(option);
    }

    // Function to populate barcode types based on selected category
    function populateBarcodeTypes(categoryName) {
        barcodeTypeSelect.innerHTML = '<option value="">-- Select Type --</option>'; // Clear previous
        dataHint.textContent = '';
        currentBarcodeDef = null;

        if (categoryName && barcodeCategories[categoryName]) {
            const types = barcodeCategories[categoryName];
            for (const typeName in types) {
                const option = document.createElement('option');
                option.value = typeName;
                option.textContent = typeName;
                barcodeTypeSelect.appendChild(option);
            }
        }
    }

    // Event listener for category change
    categorySelect.addEventListener('change', (e) => {
        populateBarcodeTypes(e.target.value);
    });

    // Event listener for barcode type change
    barcodeTypeSelect.addEventListener('change', (e) => {
        const categoryName = categorySelect.value;
        const typeName = e.target.value;
        if (categoryName && typeName && barcodeCategories[categoryName] && barcodeCategories[categoryName][typeName]) {
            currentBarcodeDef = barcodeCategories[categoryName][typeName];
            dataHint.textContent = currentBarcodeDef.hint || '';
            // TODO: Potentially show/hide specific input fields for complex types like vCard, SwissQR, composite data
            if (currentBarcodeDef.ccSupport) {
                barcodeDataInput.placeholder = "Enter main data | Enter 2D component data";
            } else {
                barcodeDataInput.placeholder = "Enter data for the barcode";
            }
        } else {
            dataHint.textContent = '';
            currentBarcodeDef = null;
        }
    });

    // Generate Barcode
    generateBtn.addEventListener('click', () => {
        if (!currentBarcodeDef || !barcodeDataInput.value.trim()) {
            displayError("Please select a barcode type and enter data.");
            return;
        }
        errorMessageDiv.textContent = '';
        barcodeCanvas.style.display = 'none'; // Hide while generating or if error

        const text = barcodeDataInput.value;
        let bcid = currentBarcodeDef.bcid;
        let mainData = text;
        let ccData = null;

        // Basic handling for composite codes (linear + 2D component)
        // Data format: "LinearData | CC_Data"
        if (currentBarcodeDef.ccSupport && text.includes('|')) {
            const parts = text.split('|').map(s => s.trim());
            mainData = parts[0];
            if (parts.length > 1 && parts[1]) {
                ccData = parts[1];
            }
        }

        let options = {
            bcid: bcid,
            text: mainData,
            scale: parseInt(scaleInput.value) || 3,
            height: 10, // bwip-js default, can be overridden
            includetext: showTextCheckbox.checked,
            textxalign: 'center',
            barcolor: barColorInput.value.substring(1), // Remove #
            backgroundcolor: bgColorInput.value.substring(1), // Remove #
            // Add any default options from barcode-types.js
            ...(currentBarcodeDef.options || {})
        };

        // Add composite component data if present
        if (ccData) {
            options.ccdata = ccData;
            // You might need to specify ccversion (cca, ccb, ccc)
            // For simplicity, let's default or you can add a UI element for it
            options.ccversion = 'cca'; // Common default, but might need adjustment
        }


        // For specific barcodes that require text to be split (e.g. ISBN with addon)
        if ((bcid === 'ean13' || bcid === 'upca' || bcid === 'upce') && mainData.includes('|')) {
            const parts = mainData.split('|');
            options.text = parts[0];
            options.addon = parts[1];
            // bwip-js handles addon text placement automatically
        }

        // Special handling for Swiss QR Code
        if (bcid === 'swissqrcode') {
            // The entire data including newlines is the 'text' for swissqrcode
            options.text = mainData; // Ensure mainData contains the full structured SwissQR data
            // SwissQR has fixed aspect ratio, scale might be handled differently or might need specific height/width
        }

        // Special handling for Mailmark (which is a DataMatrix or RM4SCC with specific requirements)
        if (bcid === 'mailmark') { // This is for RM4SCC Mailmark
             // Data for mailmark is complex and has specific structure
        }
        if (currentBarcodeDef.bcid === 'datamatrix' && currentBarcodeDef.options && currentBarcodeDef.options.mailmark) {
            // This is for Royal Mail Mailmark 2D (DataMatrix)
            // Data is complex and usually pre-formatted string.
            // bwip-js might need specific options or the data itself to be pre-encoded.
            options.parsefnc = true; // Might be needed for GS1/Mailmark structured data
        }

        try {
            // Create a temporary canvas to render to
            let canvas = document.createElement('canvas');
            bwipjs.toCanvas(canvas, options);

            // Copy to the display canvas (or just use the one created)
            // This ensures the displayed canvas is cleared and resized correctly
            barcodeCanvas.width = canvas.width;
            barcodeCanvas.height = canvas.height;
            const ctx = barcodeCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0);

            barcodeCanvas.style.display = 'block';
            downloadPNGButton.disabled = false;
            downloadSVGButton.disabled = false;

        } catch (e) {
            console.error("bwip-js error:", e);
            let userMessage = "Error generating barcode.";
            if (typeof e === 'string') {
                userMessage += ` ${e.replace(/^Error: /, '')}`;
            } else if (e.message) {
                userMessage += ` ${e.message.replace(/^Error: /, '')}`;
            }
            displayError(userMessage);
            downloadPNGButton.disabled = true;
            downloadSVGButton.disabled = true;
        }
    });

    function displayError(message) {
        errorMessageDiv.textContent = message;
        barcodeCanvas.style.display = 'none';
    }

    // Download PNG
    downloadPNGButton.addEventListener('click', () => {
        if (barcodeCanvas.style.display === 'none' || !barcodeCanvas.width) return;
        const link = document.createElement('a');
        link.download = `${currentBarcodeDef.bcid || 'barcode'}.png`;
        link.href = barcodeCanvas.toDataURL('image/png');
        link.click();
    });

    // Download SVG
    downloadSVGButton.addEventListener('click', () => {
        if (!currentBarcodeDef || !barcodeDataInput.value.trim()) {
            displayError("Generate a barcode first.");
            return;
        }

        const text = barcodeDataInput.value;
        let bcid = currentBarcodeDef.bcid;
        let mainData = text;
        let ccData = null;

        if (currentBarcodeDef.ccSupport && text.includes('|')) {
            const parts = text.split('|').map(s => s.trim());
            mainData = parts[0];
            if (parts.length > 1 && parts[1]) ccData = parts[1];
        }

        let options = {
            bcid: bcid,
            text: mainData,
            scale: parseInt(scaleInput.value) || 3,
            height: 10,
            includetext: showTextCheckbox.checked,
            textxalign: 'center',
            barcolor: barColorInput.value.substring(1),
            backgroundcolor: bgColorInput.value.substring(1),
            ...(currentBarcodeDef.options || {})
        };
        if (ccData) {
            options.ccdata = ccData;
            options.ccversion = 'cca';
        }
         if ((bcid === 'ean13' || bcid === 'upca' || bcid === 'upce') && mainData.includes('|')) {
            const parts = mainData.split('|');
            options.text = parts[0];
            options.addon = parts[1];
        }
        if (bcid === 'swissqrcode') {
            options.text = mainData;
        }


        try {
            const svg = bwipjs.toSVG(options);
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${currentBarcodeDef.bcid || 'barcode'}.svg`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("SVG generation error:", e);
            let userMessage = "Error generating SVG.";
            if (typeof e === 'string') {
                userMessage += ` ${e.replace(/^Error: /, '')}`;
            } else if (e.message) {
                userMessage += ` ${e.message.replace(/^Error: /, '')}`;
            }
            displayError(userMessage);
        }
    });


    // Initialize
    populateBarcodeTypes(categorySelect.value || Object.keys(barcodeCategories)[0]);
    if (categorySelect.options.length > 0) {
        categorySelect.value = Object.keys(barcodeCategories)[0]; // Select the first category
        populateBarcodeTypes(categorySelect.value);
    }
    downloadPNGButton.disabled = true;
    downloadSVGButton.disabled = true;
});