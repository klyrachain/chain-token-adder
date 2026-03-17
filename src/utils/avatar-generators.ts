// Avatar generator utilities for fallback chain/token logos

export interface AvatarGenerator {
  name: string;
  generateUrl: (seed: string, size?: number) => string;
}

// DiceBear Avatar Generator
export const diceBearGenerator: AvatarGenerator = {
  name: 'DiceBear',
  generateUrl: (seed: string, size = 64) => {
    const styles = ['adventurer', 'avataaars', 'big-smile', 'bottts', 'croodles', 'fun-emoji', 'identicon', 'initials', 'lorelei', 'micah', 'miniavs', 'notionists', 'open-peeps', 'personas', 'pixel-art'];
    const randomStyle = styles[seed.charCodeAt(0) % styles.length];
    return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
  }
};

// Multiavatar Avatar Generator
export const multiAvatarGenerator: AvatarGenerator = {
  name: 'Multiavatar',
  generateUrl: (seed: string, size = 64) => {
    return `https://api.multiavatar.com/${encodeURIComponent(seed)}.svg?size=${size}`;
  }
};

// UI Avatars Avatar Generator  
export const uiAvatarsGenerator: AvatarGenerator = {
  name: 'UI Avatars',
  generateUrl: (seed: string, size = 64) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&size=${size}&background=random&color=fff`;
  }
};

// Boring Avatars Generator
export const boringAvatarsGenerator: AvatarGenerator = {
  name: 'Boring Avatars',
  generateUrl: (seed: string, size = 64) => {
    const types = ['marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus'];
    const randomType = types[seed.charCodeAt(1) % types.length];
    return `https://source.boringavatars.com/marble/${size}/${encodeURIComponent(seed)}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`;
  }
};

export const avatarGenerators = [
  diceBearGenerator,
  multiAvatarGenerator,
  uiAvatarsGenerator,
  boringAvatarsGenerator
];

// Function to generate avatar URL with fallback - more robust retry logic
export const generateAvatarUrl = async (seed: string, size = 64): Promise<string> => {
  // Create a shuffled copy of generators to try different ones each time
  const shuffledGenerators = [...avatarGenerators].sort(() => Math.random() - 0.5);

  for (const generator of shuffledGenerators) {
    try {
      const url = generator.generateUrl(seed, size);
      
      // Test if the URL loads successfully
      const isValid = await testImageUrl(url);
      
      if (isValid) {
        console.log(`Successfully loaded avatar from ${generator.name}:`, url);
        return url;
      } else {
        console.warn(`Failed to load avatar from ${generator.name}, trying next...`);
        continue;
      }
    } catch (error) {
      console.warn(`Error with ${generator.name}:`, error);
      continue;
    }
  }

  // If all generators fail, return a simple colored SVG
  console.warn('All avatar generators failed, using fallback SVG');
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8'];
  const randomColor = colors[seed.charCodeAt(0) % colors.length];
  
  return `data:image/svg+xml,%3Csvg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23${randomColor}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial, sans-serif' font-size='${Math.floor(size/2.5)}' font-weight='bold'%3E${(seed.charAt(0) || '?').toUpperCase()}%3C/text%3E%3C/svg%3E`;
};

// Function to handle image loading with retry logic for components
export const handleImageError = async (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSeed: string,
  size = 48
): Promise<void> => {
  const target = event.target as HTMLImageElement;
  
  // If we already tried avatar generators, don't retry again
  if (target.dataset.avatarRetried === 'true') {
    return;
  }

  try {
    target.dataset.avatarRetried = 'true';
    const fallbackUrl = await generateAvatarUrl(fallbackSeed, size);
    target.src = fallbackUrl;
  } catch (error) {
    console.error('Failed to generate fallback avatar:', error);
    // Set a simple colored circle as ultimate fallback
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4'];
    const randomColor = colors[fallbackSeed.charCodeAt(0) % colors.length];
    target.src = `data:image/svg+xml,%3Csvg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${size/2}' cy='${size/2}' r='${size/2}' fill='%23${randomColor}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='${Math.floor(size/3)}'%3E${(fallbackSeed.charAt(0) || '?').toUpperCase()}%3C/text%3E%3C/svg%3E`;
  }
};

// Function to test if an image URL is valid
export const testImageUrl = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    setTimeout(() => resolve(false), 5000); // Timeout after 5 seconds
  });
};
