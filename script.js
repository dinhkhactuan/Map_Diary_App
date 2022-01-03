'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class workout {
  date = new Date();
  id = Date.now() + ''.slice(-10);
  constructor(distance, duration, croods) {
    this.distance = distance;
    this.duration = duration;
    this.croods = croods;
  }
  _detion() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class Running extends workout {
  type = 'running';
  constructor(distance, duration, croods, cadence) {
    super(distance, duration, croods);
    this.cadence = cadence;
    this._caleCadence();
    this._detion();
  }
  _caleCadence() {
    //min/km
    this.pane = this.duration / this.distance;
    return this.pane;
  }
}
class Cyling extends workout {
  type = 'cycling';
  constructor(distance, duration, croods, elevationGain) {
    super(distance, duration, croods);
    this.elevationGain = elevationGain;
    this._caleSpeed();
    this._detion();
  }
  _caleSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
class App {
  #map;
  #croods;
  #workout = [];
  constructor() {
    this._getPosition();

    this._getLocalStroage();

    form.addEventListener('submit', this._newWorld.bind(this));

    inputType.addEventListener('change', this._toggleFiled);
    containerWorkouts.addEventListener('click', this._handleClick.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('để sử dụng dịch vụ chúng tôi cần vị trí hiện tại của bạn');
        }
      );
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
    this.#workout.forEach(work => {
      this._renderWordkout(work);
    });
  }
  _showForm(even) {
    this.#croods = even;
    form.classList.remove('hidden');
  }
  _toggleFiled() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _clear() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 800);
  }
  _handleClick(e) {
    if (e.target.closest('.workout')) {
      const dataId = e.target.closest('.workout').dataset.id;
      if (!e.target.closest('.workout')) return;
      const work = this.#workout.find(el => el.id === dataId);
      this.#map.setView(work.croods, 11, {
        animate: true,
      });
    }
  }
  _newWorld(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();
    //OK
    const type = inputType.value;
    const distane = +inputDistance.value;
    const Duration = +inputDuration.value;
    const { lat, lng } = this.#croods.latlng;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        // !Number.isFinite(inputDistance.value) ||
        // !Number.isFinite(inputDuration.value || !Number.isFinite(cadence.value))
        !validInputs(distane, Duration, cadence) ||
        !allPositive(distane, Duration, cadence)
      ) {
        return alert('input can finite');
      }
      workout = new Running(distane, Duration, [lat, lng], cadence);
      this.#workout.push(workout);
    }
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      if (
        !validInputs(distane, Duration, elevationGain) ||
        !allPositive(distane, Duration, elevationGain)
      )
        return alert('input can finite');
      workout = new Cyling(distane, Duration, [lat, lng], elevationGain);
      this.#workout.push(workout);
    }
    this._renderWordkout(workout);
    this._renderlist(workout);
    //clear
    this._clear();
    this._setLocalStroage();
  }
  _renderWordkout(workout) {
    L.marker(workout.croods)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  _renderlist(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description} 14</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;
    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pane.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;
    }
    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _setLocalStroage() {
    localStorage.setItem('workout', JSON.stringify(this.#workout));
  }
  _getLocalStroage() {
    const data = JSON.parse(localStorage.getItem('workout'));
    if (!data) return;
    this.#workout = data;
    this.#workout.forEach(el => this._renderlist(el));
  }
  _reset() {
    localStorage.removeItem('workout');
    location.reload();
  }
}
const app = new App();
