const socket = io();

/* socket.on('countUpdated', (count) => {
  console.log('The count has been updated.', count);
})
 */
/* document.querySelector('#increment').addEventListener('click', () => {
  console.log('Bottom clicked');
  socket.emit('increment')
}) */

//Elements
const $messageForm = document.getElementById('messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.getElementById('sendLocation');
const $messages = document.getElementById('messages');

// Templates
const messageTemplate = document.getElementById('messageTemplate').innerHTML;
const locationMessageTemplate = document.getElementById(
  'locationMessageTemplate'
).innerHTML;

//options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true}) 

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (message) => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm A'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  //Disable submit button
  $messageFormButton.setAttribute('disabled', 'disabled');

  //socketconsole.log('Bottom clicked');
  const text = document.getElementById('text').value;
  socket.emit('sendMessage', text, (message) => {
    //Enable submit button
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    console.log('The message was delivered!', message);
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('No geolocation supported by this browser.');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };
    socket.emit('sendLocation', location, (message) => {
      $sendLocationButton.removeAttribute('disabled');
      console.log(message);
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});