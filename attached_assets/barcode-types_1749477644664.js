// js/barcode-types.js
const barcodeCategories = {
    "Linear Codes": {
        "Code-128": { bcid: "code128", hint: "Alphanumeric or all numeric." },
        "Code-11": { bcid: "code11", hint: "Numeric (0-9) and hyphen (-)." },
        "Code-2of5 Interleaved": { bcid: "interleaved2of5", hint: "Numeric (0-9), even number of digits." },
        "Code-39": { bcid: "code39", hint: "Alphanumeric (A-Z, 0-9) and symbols (- . $ / + % SPACE)." },
        "Code-39 Full ASCII": { bcid: "code39ext", hint: "Full ASCII character set." },
        "Code-93": { bcid: "code93", hint: "Full ASCII character set." },
        "Flattermarken": { bcid: "flattermarken", hint: "Specialized code." }, // Check bwip-js for exact name if different
        "GS1-128 (UCC/EAN-128)": { bcid: "gs1-128", hint: "GS1 standard, uses Application Identifiers. E.g., (01)12345..." },
        "MSI": { bcid: "msicode", hint: "Numeric (0-9)." },
        "Pharmacode One-Track": { bcid: "pharmacode", hint: "Numeric, for pharmaceutical packaging." },
        "Pharmacode Two-Track": { bcid: "pharmacode2", hint: "Numeric, two-track version." },
        "Telepen Alpha": { bcid: "telepen", hint: "Full ASCII. (Note: bwip-js might call it 'telepen')" }
    },
    "Postal Codes": {
        "Australian Post Standard Customer": { bcid: "auspost", hint: "Format: NNNN or NNNNNNNN (FCC+Sort+DPID)" },
        "DAFT": { bcid: "daft", hint: "Used by some European postal services." }, // Verify exact bcid
        "DPD Barcode (DPD Parcel Label)": { bcid: "dpd", hint: "Parcel identification." }, // Verify exact bcid
        "Japanese Postal (Customer) Code": { bcid: "japanpost", hint: "Numeric and hyphen." },
        "KIX (TNT Post Netherlands)": { bcid: "kix", hint: "Alphanumeric, Dutch postal code." },
        "Korean Postal Authority Code": { bcid: "codeone", options: { "format": "koreapost" }, hint: "Specific format of Code One" }, // May need options
        "Planet Code 12": { bcid: "planet", hint: "12 or 14 digits. USPS Marketing Mail." },
        "Royal Mail 4-State (RM4SCC)": { bcid: "royalmail", hint: "Alphanumeric, UK postal." },
        "Royal Mail Mailmark 4-State": { bcid: "mailmark", hint: "Complex, requires specific data structure." }, // Verify. This is a complex one.
        // "Royal Mail Mailmark 2D": { bcid: "datamatrix", options: { "mailmark": true } }, // This is a DataMatrix with specific structure
        "USPS PostNet 5": { bcid: "postnet", options: { "includetext": true, "textyoffset": -5 }, hint: "5-digit ZIP." }, // Postnet can be 5, 9, 11
        "USPS PostNet 9": { bcid: "postnet", options: { "includetext": true, "textyoffset": -5 }, hint: "9-digit ZIP (ZIP+4)." },
        "USPS PostNet 11": { bcid: "postnet", options: { "includetext": true, "textyoffset": -5 }, hint: "11-digit Delivery Point." },
        "USPS IM Package (IMpb)": { bcid: "gs1-128", hint: "GS1-128 with specific AIs for USPS Intelligent Mail Package Barcode." }, // Often a GS1-128 or DataMatrix
        "UPU S10": { bcid: "gs1-128", hint: "International postal items, often GS1-128. Format: (420)ZIP(92)COUNTRY(01)ITEM_ID" } // Needs specific AI structure
    },
    "GS1 DataBar": {
        "GS1-DataBar Omnidirectional": { bcid: "gs1databaromni", hint: "14 digits, typically GTIN." },
        "GS1-DataBar Stacked": { bcid: "gs1databarstacked", hint: "14 digits, for smaller items." },
        "GS1-DataBar Stacked Omni": { bcid: "gs1databarstackedomni", hint: "14 digits." },
        "GS1-DataBar Limited": { bcid: "gs1databarlimited", hint: "14 digits, leading (0) or (1)." },
        "GS1-DataBar Expanded": { bcid: "gs1databarexpanded", hint: "Up to 74 numeric or 41 alphabetic chars. Uses AIs." },
        "GS1-DataBar Expanded Stacked": { bcid: "gs1databarexpandedstacked", hint: "Multi-row version of Expanded." },
        // Composite Symbologies require a `ccversion` (e.g., cca, ccb, ccc) and `ccdata`
        "GS1-128 Composite Symbology": { bcid: "gs1-128", ccSupport: true, hint: "GS1-128 with 2D component. Data | CC_Data" },
        "GS1-DataBar Composite": { bcid: "gs1databaromni", ccSupport: true, hint: "DataBar Omni with 2D component. Data | CC_Data" },
        "GS1-DataBar Stacked Composite": { bcid: "gs1databarstacked", ccSupport: true, hint: "DataBar Stacked with 2D. Data | CC_Data" },
        "GS1-DataBar Stacked Omni Composite": { bcid: "gs1databarstackedomni", ccSupport: true, hint: "Stacked Omni with 2D. Data | CC_Data" },
        "GS1-DataBar Limited Composite": { bcid: "gs1databarlimited", ccSupport: true, hint: "Limited with 2D. Data | CC_Data" },
        "GS1-DataBar Expanded Composite": { bcid: "gs1databarexpanded", ccSupport: true, hint: "Expanded with 2D. Data | CC_Data" },
        "GS1-DataBar Expanded Stacked Composite": { bcid: "gs1databarexpandedstacked", ccSupport: true, hint: "Expanded Stacked with 2D. Data | CC_Data" }
    },
    "EAN / UPC": {
        "EAN-8": { bcid: "ean8", hint: "8 digits." },
        "EAN-13": { bcid: "ean13", hint: "13 digits (12 data + 1 check)." },
        "EAN-14": { bcid: "ean14", hint: "14 digits (GTIN-14), often represented as GS1-128 (01) or DataMatrix." }, // This is usually an AI(01) in GS1-128
        "EAN-8 Composite Symbology": { bcid: "ean8", ccSupport: true, hint: "EAN-8 with 2D component. Data | CC_Data" },
        "EAN-13 Composite Symbology": { bcid: "ean13", ccSupport: true, hint: "EAN-13 with 2D component. Data | CC_Data" },
        "UPC-A": { bcid: "upca", hint: "12 digits (11 data + 1 check)." },
        "UPC-E": { bcid: "upce", hint: "8 digits (compressed from UPC-A)." },
        "UPC-A Composite Symbology": { bcid: "upca", ccSupport: true, hint: "UPC-A with 2D component. Data | CC_Data" },
        "UPC-E Composite Symbology": { bcid: "upce", ccSupport: true, hint: "UPC-E with 2D component. Data | CC_Data" }
    },
    "2D Codes": {
        "QR Code": { bcid: "qrcode", hint: "Alphanumeric data, URLs, etc." },
        "QR Code (Mobile/Smartphone)": { bcid: "qrcode", hint: "Optimized for mobile scanning." }, // Same as QR, might suggest smaller module size.
        "Data Matrix": { bcid: "datamatrix", hint: "Alphanumeric, high density." },
        "Data Matrix Rectangular": { bcid: "datamatrixrectangular", hint: "Rectangular version of Data Matrix." },
        "Aztec": { bcid: "azteccode", hint: "Alphanumeric, robust." },
        "Codablock-F": { bcid: "codablockf", hint: "Stacked linear code." },
        "MaxiCode": { bcid: "maxicode", hint: "Fixed size, used by UPS." },
        "MicroPDF417": { bcid: "micropdf417", hint: "Smaller version of PDF417." },
        "PDF417": { bcid: "pdf417", hint: "Stacked linear, can hold large amounts of data." },
        "Micro QR Code": { bcid: "microqrcode", hint: "Smaller version of QR Code." },
        "Han Xin": { bcid: "hanxin", hint: "Chinese 2D code." },
        "DotCode": { bcid: "dotcode", hint: "For high-speed industrial printing." },
        "Royal Mail Mailmark 2D": { bcid: "datamatrix", options: { "mailmark": true }, hint: "Data Matrix for Royal Mail Mailmark. Specific data structure." }, // Likely uses datamatrix with specific options or data encoding.
        "NTIN Code": { bcid: "datamatrix", hint: "German PPN system, uses Data Matrix. Data: PPN_Data" }, // Usually Data Matrix
        "PPN Code": { bcid: "datamatrix", hint: "Pharmacy Product Number, uses Data Matrix. Data: PPN_Data" } // Usually Data Matrix
    },
    "GS1 2D Barcodes": {
        "GS1 QR Code": { bcid: "gs1qrcode", hint: "QR Code with GS1 data structure (FNC1)." },
        "GS1 DataMatrix": { bcid: "gs1datamatrix", hint: "Data Matrix with GS1 data structure (FNC1)." },
        "GS1 Digital Link QR code": { bcid: "qrcode", hint: "URL using GS1 Digital Link syntax. e.g. https://d.gs1.org/gtin/..." },
        "GS1 Digital Link Data Matrix": { bcid: "datamatrix", hint: "URL using GS1 Digital Link syntax. e.g. https://d.gs1.org/gtin/..." }
    },
    "Banking and Payments": { // Note: Some items here are not barcode types but features or specific structured data
        "EPC QR Code V2": { bcid: "qrcode", hint: "SEPA Credit Transfer QR. Structured data: BCD\n002\n1\nSCT\n..." },
        "Swiss QR Code v.1.0/v.2.2": { bcid: "swissqrcode", hint: "Highly structured data for Swiss payments. Refer to Swiss QR standards for data format." },
        // Swiss QR variants are handled by `swissqrcode` bcid with correct data.
        "ZATCA QR Code (Saudi Arabia)": { bcid: "qrcode", hint: "Base64 encoded TLV for ZATCA e-invoicing. Complex data structure." }
    },
    "Mobile Tagging": { // These are applications of existing 2D codes
        "QR Code": { bcid: "qrcode", hint: "For URLs, contact info, etc." },
        "Data Matrix": { bcid: "datamatrix", hint: "For small asset tagging, etc." },
        "Aztec": { bcid: "azteccode", hint: "For transport tickets, etc." }
    },
    "Healthcare Codes": {
        "Code32 (Italian Pharmacode)": { bcid: "code32", hint: "Italian pharmaceutical code." },
        // Flattermarken already listed in Linear
        "HIBC LIC 128": { bcid: "hibccode128", hint: "HIBC with Code 128. Data: +LIC_Data" },
        "HIBC LIC 39": { bcid: "hibccode39", hint: "HIBC with Code 39. Data: +LIC_Data" },
        "HIBC LIC Aztec": { bcid: "hibcazteccode", hint: "HIBC with Aztec. Data: +LIC_Data" },
        "HIBC LIC Codablock-F": { bcid: "hibccodablockf", hint: "HIBC with Codablock F. Data: +LIC_Data" },
        "HIBC LIC Data Matrix": { bcid: "hibcdatamatrix", hint: "HIBC with Data Matrix. Data: +LIC_Data" },
        "HIBC LIC Micro PDF 417": { bcid: "hibcmicropdf417", hint: "HIBC with MicroPDF417. Data: +LIC_Data" },
        "HIBC LIC PDF417": { bcid: "hibcpdf417", hint: "HIBC with PDF417. Data: +LIC_Data" },
        "HIBC LIC QR-Code": { bcid: "hibcqrcode", hint: "HIBC with QR Code. Data: +LIC_Data" },
        "HIBC PAS 128": { bcid: "hibcpascode128", hint: "HIBC PAS with Code 128. Data: +PAS_Data" }, // PAS may not be directly supported, might be data structure
        "HIBC PAS 39": { bcid: "hibcpascode39", hint: "HIBC PAS with Code 39. Data: +PAS_Data" },
        // ... and so on for other HIBC PAS variants
        "NTIN (Data Matrix)": { bcid: "datamatrix", hint: "German PPN system, uses Data Matrix. Data: PPN_Data" }, // Same as PPN
        // Pharmacodes already listed
        "PPN (Pharmacy Product Number)": { bcid: "datamatrix", hint: "Data Matrix. Data: PPN_Data (typically starts with //S)"},
        "PZN7": { bcid: "code39", options: { "pzn": true }, hint: "German pharma number (old). Usually Code 39 based." }, // May need specific options or be a Code 39 variant
        "PZN8": { bcid: "pzn8", hint: "German pharma number (new)." } // bwip-js has pzn8
    },
    "ISBN Codes": {
        "ISBN 13": { bcid: "ean13", options: { "addontextxoffset": 5, "addontextyoffset":0, "addontextsize":10 }, hint: "13 digits (usually starts 978/979). Can add price addon: ISBN|Price (e.g. 9781234567890|51299)" },
        "ISBN 13 + 5 Digits": { bcid: "ean13", options: { "addontextxoffset": 5, "addontextyoffset":0, "addontextsize":10 }, hint: "ISBN with 5-digit price addon. Format: ISBN_Number|Addon_Digits" },
        "ISMN": { bcid: "ean13", options: { "addontextxoffset": 5, "addontextyoffset":0, "addontextsize":10 }, hint: "International Standard Music Number (EAN-13 format, starts 979-0). Can have addon." },
        "ISSN": { bcid: "ean13", options: { "issn":true, "addontextxoffset": 5, "addontextyoffset":0, "addontextsize":10 }, hint: "International Standard Serial Number (EAN-13 format, starts 977). Can have addon." },
        "ISSN + 2 Digits": { bcid: "ean13", options: { "issn":true, "addontextxoffset": 5, "addontextyoffset":0, "addontextsize":10 }, hint: "ISSN with 2-digit issue addon. Format: ISSN_Number|Addon_Digits" }
    },
    "Business Cards": { // These are data formats for QR/DataMatrix
        "QR Code vCard": { bcid: "qrcode", hint: "Data: BEGIN:VCARD\nVERSION:3.0\nN:Gump;Forrest\nFN:Forrest Gump\nORG:Bubba Gump Shrimp Co.\nTITLE:Shrimp Man\nTEL;TYPE=WORK,VOICE:(111) 555-1212\nEND:VCARD" },
        "Data Matrix vCard": { bcid: "datamatrix", hint: "Same vCard data as QR Code." },
        "QR Code MeCard": { bcid: "qrcode", hint: "Data: MECARD:N:Owen,Sean;ADR:76 9th Avenue, 4th Floor, New York, NY 10011;TEL:12125551212;EMAIL:srowen@example.com;;" },
        "Data Matrix MeCard": { bcid: "datamatrix", hint: "Same MeCard data as QR Code." }
    },
    "Event Barcodes": { // Applications of existing 2D codes
        "QR Code": { bcid: "qrcode", hint: "Ticket ID, event info, URL." },
        "Data Matrix": { bcid: "datamatrix", hint: "Ticket ID, compact." }
    },
    "Wi-Fi Barcodes": { // Data format for QR/DataMatrix
        "QR Code": { bcid: "qrcode", hint: "Data: WIFI:T:WPA;S:MyNetworkSSID;P:MyPassword;;" },
        "Data Matrix": { bcid: "datamatrix", hint: "Same Wi-Fi data as QR Code." }
    }
    // ... Add ALL other categories and types. This is tedious but necessary.
    // For each type, find the corresponding `bcid` in bwip-js documentation.
    // Some might require specific `options` to be passed.
    // Example: "GS1-128 Composite" would have bcid "gs1-128" and require ccdata/ccversion options.
};

// Notes on bwip-js bcid mapping:
// - Many are direct matches.
// - GS1-128 is often just "gs1-128".
// - EAN/UPC with addons: data is "main_data|addon_data".
// - Composite codes: data is "main_data|cc_data", and you may need to specify `ccversion: 'cca'` (or ccb, ccc)
// - HIBC codes: "hibc..." e.g., "hibccode128".
// - Some postal codes like Mailmark 2D are actually DataMatrix with specific encoding rules.
// - Swiss QR Code: `bcid: 'swissqrcode'`
// - For codes not directly in bwip-js, you might need to format data for a generic type (e.g. PPN in DataMatrix)