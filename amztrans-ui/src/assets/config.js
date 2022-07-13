export const SUPPORT_LANGUAGES = [
    "af",
    "sq",
    "am",
    "ar",
    "hy",
    "az",
    "bn",
    "bs",
    "bg",
    "ca",
    "zh",
    "zh-TW",
    "hr",
    "cs",
    "da",
    "fa-AF",
    "nl",
    "en",
    "et",
    "fa",
    "tl",
    "fi",
    "fr",
    "fr-CA",
    "ka",
    "de",
    "el",
    "gu",
    "ht",
    "ha",
    "he",
    "hi",
    "hu",
    "is",
    "id",
    "ga",
    "it",
    "ja",
    "kn",
    "kk",
    "ko",
    "lv",
    "lt",
    "mk",
    "ms",
    "ml",
    "mt",
    "mr",
    "mn",
    "no",
    "ps",
    "pl",
    "pt",
    "pt-PT",
    "pa",
    "ro",
    "ru",
    "sr",
    "si",
    "sk",
    "sl",
    "so",
    "es",
    "es-MX",
    "sw",
    "sv",
    "ta",
    "te",
    "th",
    "tr",
    "uk",
    "ur",
    "uz",
    "vi"
];

// Refer to https://docs.aws.amazon.com/translate/latest/dg/API_InputDataConfig.html
export const SUPPORT_FILETYPES = [
    {
        "label": "Word (.docx)",
        "value": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    {
        "label": "HTML",
        "value": "text/html"
    },
    {
        "label": "Plain text",
        "value": "text/plain"
    },
    {
        "label": "Powerpoint (.pptx)",
        "value": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    },
    {
        "label": "Spreadsheet (.xlsx)",
        "value": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    },
    {
        "label": "XML (.xlf)",
        "value": "text/html"
    }
]

export const DEFAULT_TARGET_LANGUAGE = "vi";
export const DEFAULT_SOURCE_LANGUAGE = "en";

export const REGION = import.meta.env.VITE_REGION || "us-east-1";
export const BUCKET_NAME = import.meta.env.VITE_INPUT_BUCKET_NAME || "tungch-translationdemo-input-bucket";
export const OUTPUT_BUCKET_NAME = import.meta.env.VITE_OUTPUT_BUCKET_NAME || "tungch-translationdemo-output-bucket";
export const IDENTITY_POOL_ID = import.meta.env.VITE_IDENTITY_POOL_ID || "us-east-1:fdcbbbb0-2b84-43c1-af89-3111ece98582";

export const APIGATEWAY_ENDPOINT = import.meta.env.VITE_APIGATEWAY_ENDPOINT || "https://ch6qlmeelb.execute-api.us-east-1.amazonaws.com/default";
export const COGNITO_USERPOOL_ENDPOINT = import.meta.env.VITE_COGNITO_USERPOOL_ENDPOINT || "https://amztrans-userpool.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=6b5c48s1d43g6jtjuloibahcsn&response_type=token&scope=email+openid+phone&redirect_uri=http%3A%2F%2Flocalhost%3A3000/auth";