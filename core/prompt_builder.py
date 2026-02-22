# core/prompt_builder.py

def build_prompt(user_input: str, intent: dict, params: dict) -> str:
    content_format = intent["format"]
    purpose = intent["purpose"]

    tone = params["tone"]
    emojis = params["emojis"]
    length = params["length"]

    # ---- Format Rules ----
    if content_format == "email":
        format_rules = """
Generate a professional email.
Include a subject line.
Use proper greeting and closing.
Keep structure formal.
"""
    elif content_format == "linkedin":
        format_rules = """
Generate a LinkedIn post.
Start with a strong hook.
Maintain paragraph spacing.
Add 2–3 relevant hashtags at the end.
"""
    elif content_format == "ad":
        format_rules = """
Generate an advertisement copy.
Focus on benefits.
Include a clear call-to-action.
Make it compelling.
"""
    else:
        format_rules = "Generate a clear and well-structured response."

    # ---- Emoji Rule ----
    emoji_rule = "Include appropriate emojis." if emojis else "Do not use emojis."

    # ---- Final Prompt ----
    final_prompt = f"""
You are a senior content strategist and professional writer.

Task Purpose: {purpose}
Tone: {tone}
Target Length: approximately {length} words.
{emoji_rule}

{format_rules}

User Request:
{user_input}
"""

    return final_prompt.strip()