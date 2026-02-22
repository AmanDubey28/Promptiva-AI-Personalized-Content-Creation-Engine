import streamlit as st
from Core.intent import detect_intent
from Core.inference import infer_parameters
from Core.prompt_builder import build_prompt
from Core.model_router import generate_response
from config import AVAILABLE_MODELS

st.set_page_config(page_title="SmartChat", layout="wide")

st.title("🧠 SmartChat - Multi Model AI Engine")

# ---- Model Selection ----
models = st.multiselect(
    "Select Model(s)",
    AVAILABLE_MODELS,
    default=["gemini"]
)

# ---- User Input ----
user_input = st.text_area("Enter your prompt")

# ---- Generate Button ----
if st.button("Generate"):

    if not user_input.strip():
        st.warning("Please enter a prompt.")
    else:
        intent = detect_intent(user_input)
        params = infer_parameters(intent, user_input)
        final_prompt = build_prompt(user_input, intent, params)

        for model in models:
            st.subheader(f"{model.upper()} Response")

            try:
                response = generate_response(model, final_prompt)
                st.write(response)
            except Exception as e:
                st.error(f"Error with {model}: {e}")