// Fetch destination data from the server API


// Track the active category filter
let currentCategory = 'all';

// Track the current search text
let currentSearch = '';


// Get search elements
const searchInput = document.getElementById('search-input');
const clearSearch = document.getElementById('clear-search');


// Fetch destinations from the API
async function fetchDestinations(category, search) {

  let url = '/api/destinations';

  // Create query parameters
  const params = new URLSearchParams();


  // Add category filter
  if (category && category !== 'all') {
    params.append('category', category);
  }


  // Add search filter
  if (search && search.trim() !== '') {
    params.append('search', search.trim());
  }


  // Add parameters to the URL
  if (params.toString()) {
    url += '?' + params.toString();
  }


  try {

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch destinations');
    }

    const destinations = await response.json();

    renderDestinations(destinations);

  } catch (error) {

    console.error('Error fetching destinations:', error);

  }
}


// ================================
// SEARCH
// ================================

searchInput.addEventListener('input', function(e) {

  // Store what the user typed
  currentSearch = e.target.value;


  // Show the clear button when text exists
  if (currentSearch.trim() !== '') {
    clearSearch.classList.add('visible');
  } else {
    clearSearch.classList.remove('visible');
  }


  // Fetch using current category AND search
  fetchDestinations(
    currentCategory,
    currentSearch
  );

});


// Clear search button
clearSearch.addEventListener('click', function() {

  // Clear the input
  searchInput.value = '';

  // Clear the stored search
  currentSearch = '';

  // Hide the clear button
  clearSearch.classList.remove('visible');

  // Put cursor back inside search box
  searchInput.focus();

  // Reload destinations
  fetchDestinations(
    currentCategory,
    currentSearch
  );

});


// ================================
// ADD DESTINATION
// ================================

document
  .getElementById('add-destination-form')
  .addEventListener('submit', async function(e) {

    e.preventDefault();


    const formData = new FormData(e.target);

    const data = Object.fromEntries(formData);


    // Convert rating from string to number
    data.rating = Number(data.rating);


    try {

      const response = await fetch('/api/destinations', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(data)

      });


      if (!response.ok) {
        throw new Error('Failed to add destination');
      }


      // Clear the form
      e.target.reset();


      // Refresh destinations while keeping
      // the current category and search
      fetchDestinations(
        currentCategory,
        currentSearch
      );


    } catch (error) {

      console.error('Error adding destination:', error);

    }

  });


// ================================
// CATEGORY FILTERS
// ================================

document
  .querySelectorAll('.filter-btn')
  .forEach(function(btn) {

    btn.addEventListener('click', function() {


      // Remove active class from all buttons
      document
        .querySelectorAll('.filter-btn')
        .forEach(function(b) {

          b.classList.remove('active');

        });


      // Set clicked button as active
      btn.classList.add('active');


      // Store selected category
      currentCategory = btn.dataset.category;


      // Fetch using current category AND search
      fetchDestinations(
        currentCategory,
        currentSearch
      );

    });

  });


// ================================
// RENDER DESTINATION CARDS
// ================================

function renderDestinations(destinations) {

  const container = document.getElementById('destinations');


  // No results
  if (destinations.length === 0) {

    container.innerHTML =
      '<p class="no-results">No destinations found. Try another search or category.</p>';

    return;

  }


  // Create destination cards
  container.innerHTML = destinations.map(function(dest) {


    // Create star rating
    const stars =
      '★'.repeat(dest.rating) +
      '☆'.repeat(5 - dest.rating);


    return '<div class="destination-card">' +

      '<h3>' +
      dest.name +
      '</h3>' +

      '<span class="category">' +
      dest.category +
      '</span>' +

      '<p class="location">' +
      dest.location +
      '</p>' +

      '<p class="description">' +
      dest.description +
      '</p>' +

      '<p class="rating">' +
      stars +
      '</p>' +

    '</div>';

  }).join('');

}


// ================================
// INITIAL LOAD
// ================================

fetchDestinations('all', '');