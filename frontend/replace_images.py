import os
import re

directory = "/Users/macbookpro/Desktop/TMC/frontend/src/pages"

# A diverse selection of 20+ makeup/cosmetic images from Unsplash
MAKEUP_IMAGES = [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1512496015851-a1cbf443b353?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1580870058882-747f4f6e1f0e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1571781926291-c477eb317dd4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1583241475880-083f84372725?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1512496015851-a1cbf443b353?auto=format&fit=crop&q=80&w=800"
]

pattern = re.compile(r'https://images\.unsplash\.com/[a-zA-Z0-9_\-\?\=\&]+w=800')
pattern_lh3 = re.compile(r'https://lh3\.googleusercontent\.com/[a-zA-Z0-9_\-]+')

for filename in os.listdir(directory):
    if filename.endswith(".tsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace existing unsplash links and any remaining lh3 links to scatter the new array
        matches = pattern.findall(content)
        matches_lh3 = pattern_lh3.findall(content)
        all_matches = matches + matches_lh3

        if all_matches:
            for i, match in enumerate(all_matches):
                replacement = MAKEUP_IMAGES[i % len(MAKEUP_IMAGES)]
                content = content.replace(match, replacement, 1) # replace 1 at a time to cycle
            
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Replaced {len(all_matches)} images in {filename}")
