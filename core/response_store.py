# Core/response_store.py

class ResponseStore:
    def __init__(self):
        self._responses = {}

    def store(self, model: str, response: str):
        self._responses[model] = response

    def get(self, model: str):
        return self._responses.get(model)

    def get_all(self):
        return self._responses

    def has(self, model: str):
        return model in self._responses

    def clear(self):
        self._responses.clear()