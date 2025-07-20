# Models API Implementation

## Current Status

The `/v1/models` endpoint is implemented and returns dynamic model information from Ollama. Frontend currently uses this endpoint to populate model dropdowns with enhanced metadata.

## Implemented Features

### 1. Dynamic Model Listing
- Fetches available models from Ollama
- Adds computed metadata fields
- Returns OpenAI-compatible format
- Includes capabilities detection

### 2. Model Metadata
- **displayLabel**: Human-friendly model name
- **contextLength**: Maximum token context
- **capabilities**: Array of supported features
- **metadata**: Detailed model information

## API Endpoint

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| `GET` | `/v1/models` | List available models | AllowAny |

## Response Format

### Models List Response
```json
{
  "object": "list",
  "data": [
    {
      "id": "llama3.2",
      "object": "model",
      "displayLabel": "llama GGUF 3.2B Q4_0",
      "contextLength": 131072,
      "capabilities": ["tools", "vision"],
      "metadata": {
        "family": "llama",
        "format": "GGUF",
        "parameterSize": "3.2B",
        "quantizationLevel": "Q4_0",
        "architectureDetails": {
          "heads": 32,
          "layers": 28,
          "embeddingLength": 3072,
          "headDim": 96
        }
      }
    },
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "displayLabel": "gpt-4o-mini GPT 8B Q8_0",
      "contextLength": 128000,
      "capabilities": ["tools"],
      "metadata": {
        "family": "gpt-4o-mini",
        "format": "GPT",
        "parameterSize": "8B",
        "quantizationLevel": "Q8_0"
      }
    }
  ]
}
```

## Implementation Details

### OllamaClient Integration
The models endpoint uses the same `OllamaClient` class as chat:
- Fetches models via `ollama.list()`
- Extracts metadata from model details
- Computes display labels and capabilities
- Handles connection errors gracefully

### Metadata Extraction
```python
def _extract_metadata(self, model_dict):
    """Extract structured metadata from Ollama model"""
    details = model_dict.get('details', {})
    
    # Extract architecture info
    family = details.get('family', 'unknown')
    parameter_size = details.get('parameter_size', '')
    quantization = details.get('quantization_level', '')
    
    # Compute context length
    context_length = self._get_context_length(model_dict)
    
    # Detect capabilities
    capabilities = self._detect_capabilities(model_dict)
    
    return metadata
```

### Frontend Integration
Frontend caches model list in localStorage:
- 10-minute cache duration
- Reduces API calls on page reloads
- Updates automatically when cache expires

## Model Families Supported

Based on actual Ollama models:
- **llama**: Various Llama models
- **gpt-4o-mini**: OpenAI compatible models
- **gemma**: Google's Gemma models
- **phi**: Microsoft Phi models
- **qwen**: Alibaba Qwen models
- **mistral**: Mistral AI models

## Not Implemented

1. **Model Details Endpoint**: No `/v1/models/{id}` endpoint
2. **Image Models**: No image generation models listed
3. **Model Management**: No CRUD operations
4. **Model Training**: No fine-tuning support
5. **Model Uploading**: No custom model upload

## Configuration

Models available depend on what's installed in Ollama:
```bash
# Install models in Ollama
ollama pull llama3.2
ollama pull gpt-4o-mini
ollama pull gemma2
```

## Frontend Usage

Frontend `RunSettingsPanel`:
1. Fetches models on component mount
2. Displays in dropdown with `displayLabel`
3. Shows context length in token counter
4. Enables/disables tools based on capabilities 