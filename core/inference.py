# core/inference.py

def infer_parameters(intent: dict, user_input: str) -> dict:
    content_format = intent["format"]
    purpose = intent["purpose"]

    # ---- Tone Inference ----
    if content_format == "email":
        if purpose == "promotion":
            tone = "persuasive but professional"
        elif purpose == "apology":
            tone = "polite and empathetic"
        elif purpose == "request":
            tone = "formal and respectful"
        else:
            tone = "professional"

    elif content_format == "linkedin":
        if purpose == "promotion":
            tone = "engaging and visionary"
        else:
            tone = "professional and insightful"

    elif content_format == "ad":
        tone = "persuasive and compelling"

    else:
        tone = "clear and informative"

    # ---- Emoji Rule ----
    if content_format in ["email"]:
        emojis = False
    elif content_format == "linkedin":
        emojis = True
    elif content_format == "ad":
        emojis = True
    else:
        emojis = False

    # ---- Length Default ----
    if content_format == "email":
        length = 150
    elif content_format == "linkedin":
        length = 200
    elif content_format == "ad":
        length = 120
    else:
        length = 180

    return {
        "tone": tone,
        "emojis": emojis,
        "length": length
    }