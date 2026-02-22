# core/intent.py

def detect_intent(user_input: str) -> dict:
    text = user_input.lower()

    # Detect format
    if any(word in text for word in ["email", "mail", "subject", "dear"]):
        content_format = "email"
    elif any(word in text for word in ["linkedin", "post"]):
        content_format = "linkedin"
    elif any(word in text for word in ["ad", "advertisement"]):
        content_format = "ad"
    else:
        content_format = "general"

    # Detect purpose
    if any(word in text for word in ["promotion", "sale", "launch", "offer"]):
        purpose = "promotion"
    elif any(word in text for word in ["apology", "sorry"]):
        purpose = "apology"
    elif any(word in text for word in ["request", "asking"]):
        purpose = "request"
    else:
        purpose = "informative"

    return {
        "format": content_format,
        "purpose": purpose
    }