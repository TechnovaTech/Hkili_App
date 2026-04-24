from PIL import Image
import os

src = 'HKILI_App/assets/images/logo.png'
sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}
base = 'HKILI_App/android/app/src/main/res'

img = Image.open(src).convert('RGBA')
for folder, size in sizes.items():
    resized = img.resize((size, size), Image.LANCZOS)
    for name in ['ic_launcher.png', 'ic_launcher_round.png']:
        path = os.path.join(base, folder, name)
        resized.save(path)
        print(f'Saved {path}')

print('Done!')
