// 1) Random images carousel + limited breed buttons (only for these 10)
fetch('https://dog.ceo/api/breeds/image/random/10')
  .then(r => r.json())
  .then(data => {
    const slider = document.getElementById('dog-slider');
    const container = document.getElementById('breed-buttons');
    slider.classList.add('dog-carousel');
    container.classList.add('breed-buttons');

    const breedSet = new Set();

    data.message.forEach((src, i) => {
      // Create image for carousel
      const img = document.createElement('img');
      img.src = src;
      img.className = 'dog-slide' + (i === 0 ? ' active' : '');
      slider.appendChild(img);

      // Extract breed/sub-breed from URL
      const parts = src.split('/');
      const breedPath = parts[parts.indexOf('breeds') + 1]; // e.g., bulldog-boston
      const breedParts = breedPath.split('-').reverse(); // e.g., ["boston", "bulldog"]
      const fullName = breedParts.join(' '); // "boston bulldog"

      breedSet.add(fullName);
    });

    // Create 1 button for each breed in the image set
    breedSet.forEach(fullName => {
      const btn = document.createElement('button');
      btn.textContent = fullName;
      btn.className = 'button-85';
      btn.setAttribute('data-breed', fullName);
      btn.setAttribute('role', 'button');
      btn.onclick = () => loadBreedInfo(fullName);
      container.appendChild(btn);
    });

    // Carousel auto-switch
    let current = 0;
    setInterval(() => {
      const slides = document.querySelectorAll('.dog-slide');
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 3000);
  });

// 2) On-demand breed info
function loadBreedInfo(breed) {
  fetch(`https://api.thedogapi.com/v1/breeds/search?q=${breed}`)
    .then(r => r.json())
    .then(arr => {
      if (!arr.length) throw new Error();
      const info = arr[0];
      const [min, max] = info.life_span.replace(' years', '').split(' - ').map(n => n.trim());
      const container = document.getElementById('breed-info');
      container.className = 'breed-info';
      container.innerHTML = `
        <h2>${info.name}</h2>
        <p><strong>Description:</strong> ${info.temperament || 'n/a'}</p>
        <p><strong>Min Life:</strong> ${min}</p>
        <p><strong>Max Life:</strong> ${max}</p>
      `;
    })
    .catch(() => {
      const container = document.getElementById('breed-info');
      container.className = 'breed-info';
      container.textContent = 'Could not load info.';
    });
}

// Expose for voice command use
window.loadBreedInfo = loadBreedInfo;
