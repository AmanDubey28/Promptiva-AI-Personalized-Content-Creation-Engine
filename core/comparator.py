# Core/comparator.py

def compare_models(response_store, models: list):
    print("\nModel Comparison:\n")

    for model in models:
        if response_store.has(model):
            print(f"{model.upper()} RESPONSE:\n")
            print(response_store.get(model))
            print("\n" + "-" * 60 + "\n")
        else:
            print(f"No stored response for model: {model}\n")