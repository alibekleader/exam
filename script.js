'use strict';

// *** Dark Mode Variables :
const modeBtn = document.querySelector('.btn__mode');
let mode = 1;
const colors = [
  {
    primaryColor: 'hsl(200, 15%, 8%)',
    secondaryColor: '#fff',
    backgroundColor: 'hsl(0, 0%, 98%)',
    hoverColor: '#f2f2f2',
  },
  {
    primaryColor: '#fff',
    secondaryColor: 'hsl(209, 23%, 22%)',
    backgroundColor: 'hsl(207, 26%, 17%)',
    hoverColor: '#627884',
  },
];

// Search Bar Variables :
const searchBar = document.querySelector('.search-bar');
const searchInput = document.getElementById('search-input');
const searchOptions = searchBar.querySelector('.search-options');
let countriesNames = [];

// *** Filter Bar Variables :
const select = document.getElementById('select-btn');
const selectText = document.getElementById('select-text');
const optionsParent = document.querySelector('.options');

// *** Switch View Variables :
const backBtn = document.querySelector('.btn--back');
const item = document.querySelector('.item');
const countryParent = document.querySelector('.countries');

// *** Load More btn Variable :
const loadBtn = document.querySelector('.btn--load');
let countryIndex = 24;

// # - Dark Mode :
modeBtn.addEventListener('click', function () {
  for (const [key, value] of Object.entries(colors[mode])) {
    document.documentElement.style.setProperty(`--${key}`, value);
  }
  this.querySelector('span').textContent = `${mode ? 'Light' : 'Dark'} Mode`;
  this.querySelector('ion-icon').name = mode ? 'moon-sharp' : 'moon-outline';
  mode = mode ? 0 : 1;
});

// # - Search Bar :
searchInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    searchName(this.value, getSearchResult);
    selectText.textContent = 'Filter by Region';
  }
});

searchInput.addEventListener('input', function (e) {
  select.classList.remove('active-filter');
  optionsParent.classList.add('hidden');
  searchOptions.innerHTML = '';
  searchBar.classList.remove('warning');
  const value = this.value;
  const suggestions = Array.from(new Set(countriesNames))
    .sort()
    .filter((name) => name.startsWith(value.toLowerCase()));
  if (suggestions && suggestions.length <= 20)
    suggestions.forEach((name) =>
      searchOptions.insertAdjacentHTML(
        'beforeend',
        `<div class="search--option">${name}</div>`
      )
    );
  if (!value.length) {
    displayCountry(showCountries);
    selectText.textContent = 'Filter by Region';
  }
});

searchOptions.addEventListener('click', function (e) {
  const value = e.target.textContent;
  searchInput.value = value;
  this.innerHTML = '';
  searchName(value, getSearchResult);
  selectText.textContent = 'Filter by Region';
});

// # - Filter Bar :
select.addEventListener('click', function () {
  this.classList.toggle('active-filter');
  optionsParent.classList.toggle('hidden');
});

optionsParent.addEventListener('click', function (e) {
  const region = e.target.dataset.value;
  selectText.textContent = region;
  this.classList.add('hidden');
  loadBtn.classList.add('hidden');
  if (region == 'All Regions') displayCountry(showCountries);
  else searchRegion(region);
});

// # - Switch View :
countryParent.addEventListener('click', (e) => {
  if (e.target.closest('.country')) {
    item.classList.remove('hidden');
    document.querySelector('section').classList.add('hidden');
    document.documentElement.scrollTop = 0;
    const countryName = e.target
      .closest('.country')
      .querySelector('h3').textContent;
    searchName(countryName, showCountryInfo);
  }
});

backBtn.addEventListener('click', () => {
  item.classList.add('hidden');
  document.querySelector('section').classList.remove('hidden');
});

// # - Load More Countries :
loadBtn.addEventListener('click', () => displayCountry(loadMore));

// # - Remove Focus on filter :
document.querySelector('.toolbar').addEventListener('click', (e) => {
  if (e.target.className.includes('toolbar'))
    optionsParent.classList.add('hidden');
});

// ##################################
// ********* - Rest API :  **********

async function getResult(url, func) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    func(data);
  } catch {
    searchBar.classList.add('warning');
  }
}

// Get All Countries :
const displayCountry = (method) => {
  const url = 'https://restcountries.com/v3.1/all';
  getResult(url, method);
};

// Search by Country Name :
const searchName = (name, method) => {
  const url = `https://restcountries.com/v3.1/name/${name}`;
  getResult(url, method);
};

const searchRegion = (region) => {
  const url = `https://restcountries.com/v3.1/region/${region}`;
  getResult(url, getFilterResult);
};

// #####################################
// ********  All Methods :  ***********

const showCountryCard = (data) => {
  const html = `
      <figure class="country">
        <div class="country--flag">
          <img src=${data.flag} />
        </div>
        <div class="country--info">
          <h3>${data.name}</h3>
          <p><span class="bold">Population:</span> ${new Intl.NumberFormat(
            'en-US'
          ).format(data.population)}</p>
          <p><span class="bold">Region:</span> ${data.region}</p>
          <p><span class="bold">Capital:</span> ${data.capital}</p>
        </div>
      </figure>
  `;
  countryParent.insertAdjacentHTML('beforeend', html);
};

const showCountries = (data, order = true) => {
  const countries = [];
  data.forEach((country) =>
    countries.push({
      name: country.name.common,
      population: country.population,
      region: country.region,
      capital: country.capital,
      flag: country.flags.png,
    })
  );
  countryParent.innerHTML = '';
  if (order) {
    countries.forEach((countryName) =>
      countriesNames.push(countryName.name.toLowerCase())
    );
    for (let i = 0; i < countryIndex; i++) showCountryCard(countries[i]);
    loadBtn.classList.remove('hidden');
  } else countries.forEach((country) => showCountryCard(country));
};

displayCountry(showCountries);

const getSearchResult = (data) => {
  const country = {
    name: data[0].name.common,
    population: data[0].population,
    region: data[0].region,
    capital: data[0].capital,
    flag: data[0].flags.png,
  };
  countryParent.innerHTML = '';
  loadBtn.classList.add('hidden');
  showCountryCard(country);
};

const getFilterResult = (data) => showCountries(data, false);

const showCountryInfo = (data) => {
  const mainHTML = `
    <div class="logo">
      <div class="logo-inner"></div>
      <img src=${data[0].flags.png} />
    </div>
    <div class="item-info">
      <h3>${data[0].name.common}</h3>
      <div class="row">
        <div class="col-1">
          <p><span class="bold">Native Name:</span> ${
            Object.values(data[0].name.nativeName)[0].official
          }</p>
          <p><span class="bold">Population:</span> ${new Intl.NumberFormat(
            'en-US'
          ).format(data[0].population)}</p>
          <p><span class="bold">Region:</span> ${data[0].region}</p>
          <p><span class="bold">Sub Region:</span> ${data[0].subregion}</p>
          <p><span class="bold">Capital:</span> ${data[0].capital}</p>
        </div>
        <div class="col-2">
          <p><span class="bold">Top Level Domain:</span> ${data[0].tld[0]}</p>
          <p><span class="bold">Currencies:</span> ${
            Object.keys(data[0].currencies)[0]
          }</p>
          <p>
            <span class="bold">Languages:</span> ${Object.values(
              data[0].languages
            ).sort()}
          </p>
        </div>
      </div>
      <div class="border-container hidden">
        <p id="border-title">Border Countries:</p>
        <div class="borders"></div>
      </div>
    </div>
    `;

  const itemBody = item.querySelector('.item-body');
  itemBody.innerHTML = '';
  itemBody.insertAdjacentHTML('afterbegin', mainHTML);

  // Generate Borders :
  if (data[0].borders) {
    data[0].borders.forEach((borderCode) => {
      const url = `https://restcountries.com/v3.1/alpha/${borderCode}`;
      getResult(url, showBorders);
    });
    item.querySelector('.border-container').classList.remove('hidden');
  }
};

const showBorders = (data) => {
  let borderHTML = `<span class="border">${data[0].name.common}</span>`;
  item.querySelector('.borders').insertAdjacentHTML('beforeend', borderHTML);
};

const loadMore = (data) => {
  const countries = [];
  data.forEach((country) =>
    countries.push({
      name: country.name.common,
      population: country.population,
      region: country.region,
      capital: country.capital,
      flag: country.flags.png,
    })
  );

  const maxIndex =
    countryIndex + 24 <= countriesNames.length
      ? countryIndex + 24
      : countriesNames.length;
  for (let i = countryIndex; i < maxIndex; i++) showCountryCard(countries[i]);
  countryIndex = maxIndex;
  if (countryIndex === countriesNames.length) loadBtn.classList.add('hidden');
};
