# main.py

from Core.intent import detect_intent
from Core.inference import infer_parameters
from Core.prompt_builder import build_prompt
from Core.model_router import generate_response
from Core.response_store import ResponseStore
from Core.comparator import compare_models
from config import AVAILABLE_MODELS, DEFAULT_MODEL


def select_models():
    print("\nAvailable models:")
    for model in AVAILABLE_MODELS:
        print("-", model)

    user_input = input("\nSelect model(s) (comma separated): ").strip()

    if not user_input:
        print(f"No model selected. Defaulting to {DEFAULT_MODEL}.\n")
        return [DEFAULT_MODEL]

    selected = [m.strip().lower() for m in user_input.split(",")]
    valid_models = [m for m in selected if m in AVAILABLE_MODELS]

    if not valid_models:
        print(f"Invalid selection. Defaulting to {DEFAULT_MODEL}.\n")
        return [DEFAULT_MODEL]

    return valid_models


def main():
    print("Welcome to Personalized Content Creation AI Tool!")
    print("Type 'exit' to quit.")
    print("Type 'compare model1 model2' to compare responses.\n")

    store = ResponseStore()

    while True:
        user_input = input("Enter your prompt here: ").strip()

        if user_input.lower() == "exit":
            print("Exiting...")
            break

        # ---- Compare Command ----
        if user_input.lower().startswith("compare"):
            parts = user_input.lower().split()[1:]
            if parts:
                compare_models(store, parts)
            else:
                print("Specify models to compare.")
            continue

        # ---- Model Selection ----
        models = select_models()

        # ---- Intent & Prompt ----
        intent = detect_intent(user_input)
        params = infer_parameters(intent, user_input)
        final_prompt = build_prompt(user_input, intent, params)

        # ---- Generate ----
        for model in models:
            print(f"\nGenerating using {model}...\n")

            try:
                response = generate_response(model, final_prompt)
                store.store(model, response)

                print(f"{model.upper()} RESPONSE:\n")
                print(response)
                print("\n" + "-" * 60)

            except Exception as e:
                print(f"Error with {model}: {e}")


if __name__ == "__main__":
    main()