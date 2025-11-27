#!/usr/bin/env python
"""
Simple script to generate a Django SECRET_KEY.
Run this script to generate a new SECRET_KEY for your .env file.
"""
import secrets
import string

def generate_secret_key():
    """Generate a Django-compatible SECRET_KEY"""
    # Django SECRET_KEYs are typically 50 characters
    # Using a mix of letters, digits, and special characters
    chars = string.ascii_letters + string.digits + string.punctuation
    # Remove characters that might cause issues in .env files
    chars = chars.replace('"', '').replace("'", '').replace('\\', '').replace('$', '')
    
    secret_key = ''.join(secrets.choice(chars) for _ in range(50))
    return secret_key

if __name__ == '__main__':
    key = generate_secret_key()
    print("\n" + "="*60)
    print("Generated SECRET_KEY:")
    print("="*60)
    print(key)
    print("="*60)
    print("\nAdd this to your .env file:")
    print(f"SECRET_KEY={key}")
    print("\n⚠️  Keep this key secret! Never commit it to git.\n")

