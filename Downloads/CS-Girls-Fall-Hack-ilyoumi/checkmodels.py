import google.generativeai as genai
import os

try:
    # --- Make sure your GEMINI_API_KEY is set in your terminal! ---
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

    print("✅ API Key configured.")
    print("Models available to you that support 'generateContent':")
    print("=====================================================")

    # This is the important part:
    # We list all models and filter for the ones that can 'generateContent'
    found_model = False
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(model.name)
            found_model = True

    if not found_model:
        print("\n--- No models found! ---")
        print("This is strange. Please double-check your API key and project settings in Google AI Studio.")

    print("\n=====================================================")
    print("ACTION: Copy one of the model names above (e.g., 'models/gemini-1.0-pro')")
    print("and paste it into your *main script* on line 10.")

except Exception as e:
    print(f"❌ Error: {e}")
    print("Failed to initialize. Make sure your GEMINI_API_KEY is set correctly.")