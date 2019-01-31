const isSec = window.location.protocol === 'https:'
const socket = new WebSocket(`${isSec ? 'wss' : 'ws'}://${window.location.hostname}:${window.location.port}`);

const messages = document.querySelector('.messages');
const inputBox = document.querySelector('.user-input input');
const form = document.querySelector('.user-input');

socket.addEventListener('error', err => {
    console.log(err);
})

let loggedIn = false;
let myUsername = null;

socket.addEventListener('message', event => {
    console.log('Received: ', event.data);
    const data = JSON.parse(event.data);
    switch (data.event) {
        case 'chat': {
            const [username, chat] = data.args;
            let scrollTop = messages.scrollTop;
            messages.innerHTML =
                `<div class="chat message">
                <span class="${username === myUsername ? 'me' : 'user'}">@${username}:</span> ${chat}
            </div>` + messages.innerHTML;
            if (messages.scrollHeight - messages.scrollTop > messages.offsetHeight) {
                messages.scrollTop = scrollTop;
            }
            break;
        }
        case 'login': {
            const [username] = data.args;
            messages.innerHTML =
                `<div class="login message${username === myUsername ? ' me' : ''}">
                <span>@${username}</span> has joined the chatroom
            </div>` + messages.innerHTML;
            if (!loggedIn && username === myUsername) {
                loggedIn = true;
                inputBox.setAttribute('placeholder', '');
            }
            break;
        }
        case 'logout': {
            const [username] = data.args;
            messages.innerHTML =
                `<div class="logout message">
                <span class=${username === myUsername ? 'me' : ''}>@${username}</span> has left the chatroom
            </div>` + messages.innerHTML;
            break;
        }
        case 'error': {
            const [err] = data.args;
            messages.innerHTML =
                `<div class="error message">
                <span>ERROR:</span> ${err}
            </div>` + messages.innerHTML;
            break;
        }
        case 'info': {
            const [info] = data.args;
            messages.innerHTML =
                `<div class="info message">
                <span>SERVER:</span> ${info}
            </div>` + messages.innerHTML;
            break;
        }
    }
});

// inputBox.addEventListener('keyup', e => {
//     if (e.key === 'Enter') {
//         const input = e.target.value;
//         e.target.value = '';
//         const message = {
//             event: null,
//             args: [input]
//         }
//         if (loggedIn) {
//             message.event = 'chat';
//         } else {
//             message.event = 'login';
//             myUsername = input;
//         }
//         socket.send(JSON.stringify(message));
//     }
// });
form.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target[0].value;
    e.target[0].value = '';
    const message = {
        event: null,
        args: [input]
    }
    if (loggedIn) {
        message.event = 'chat';
    } else {
        message.event = 'login';
        myUsername = input;
    }
    socket.send(JSON.stringify(message));
})