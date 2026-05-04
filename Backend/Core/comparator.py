def prepare_comparison_input(responses: dict) -> str:
    '''
    Convert responses from multiple models into 
    a formatted text block for comparison.
    '''
    formatted_text = ""
    for model, response in responses.items():
        formatted_text += f"{model.upper()} RESPONSE:\n"
        formatted_text += f"{response}\n\n"
        formatted_text += "-" * 60 + "\n\n"
    return formatted_text